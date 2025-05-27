import draco
import pandas as pd
from draco import dict_to_facts,schema_from_dataframe,answer_set_to_dict
from draco.renderer import AltairRenderer
from .dataset_filtering import split_vega_lite_spec
from .asp_variant_generation import generate_asp_variants
import heapq
import time
import concurrent.futures
from pathlib import Path

def get_draco_dataframe(preprocessed_data):
    """
    Converts unformatted data into a DataFrame suitable for Draco.

    Parameters:
    preprocessed_data (JSON): The pre_processed input data that needs to be reformatted.

    Returns:
    pd.DataFrame: A DataFrame representation of the dataset, ready for Draco.
    """        
    #Creating the dataframe from the preprocessed json
    df = pd.json_normalize(preprocessed_data)

    return df


def get_draco_schema(draco_data):
    """
    Generates a Draco schema from a DataFrame.

    Parameters:
    draco_data (pd.DataFrame): The DataFrame containing the preprocessed data.

    Returns:
    dict: A Draco schema derived from the input DataFrame.
    """   
    #processing draco schema 
    schema = schema_from_dataframe(draco_data)
    
    #Some datafield are wrongly interpreted by Draco and their type don't fit the reality
    # for instance, period works better as ordinal than quantitative
    #therefore we convert some fields to different data type here 
        # Define the type mapping
    type_mapping = {
        'period': 'string'
    }
    def change_field_types(data, type_mapping):
        # Iterate over each field in the data
        for field in data['field']:
            field_name = field['name']
            # Check if the field needs to be updated
            if field_name in type_mapping:
                # Update the type of the field
                field['type'] = type_mapping[field_name]
                
                # If converting from number to string, remove additional properties
                if field['type'] == 'string' and field.get('min') is not None:
                    field.pop('min', None)
                    field.pop('max', None)
                    field.pop('std', None)

        return data
    updated_schema = change_field_types(schema, type_mapping)

    return updated_schema


def get_draco_facts(draco_schema):
    """
    Converts a Draco schema into Draco facts.

    Parameters:
    draco_schema (dict): The Draco schema to be converted into facts.

    Returns:
    list: A list of Draco facts derived from the input schema.
    """
    data_schema_facts = dict_to_facts(draco_schema)

    return data_schema_facts



default_input_spec =["entity(view,root,v0).", # a root has to exist to display anything
                     "entity(mark,v0,m0).",   # likewise for a mark
                     "entity(encoding,m0,e0).", #here we ensure that we have at least one encoding
                     ":- {entity(encoding,m0,_)} < 2."]    # we want to have at least 2 encodings to produce interesting visualizations

def draco_rec_compute(data,d:draco.Draco = draco.Draco(),specs:list[str]= default_input_spec,num_chart:int = 1, labeler=lambda i: f"CHART {i + 1}", Debug: bool=False):
    """
    Computes and recommends Draco charts based on the input data.

    Parameters:
    data (JSON): The raw input data to be processed.
    num_chart (int, optional): The number of charts to recommend.
    Debug(bool, optional):Debug mode, writes chart_specs_outpute to json files in ./data/events/temps/. Default is False.
    
    Returns:
    dict: A dictionary containing the recommended chart specifications and their renderings.
    """
    start_time = time.time()
    
    renderer = AltairRenderer()
    draco_data=get_draco_dataframe(data)
    draco_facts=get_draco_facts(get_draco_schema(draco_data))
    
    spec_facts=[]
    print("specs==None",specs==None) 
    if specs==None :
        chart_name= ''
        input_specs=[(chart_name,draco_facts+default_input_spec)]
        num_chart=6
    else:
        start_time_asp = time.time()
        spec_facts = generate_asp_variants(specs, default_input_spec)
        input_specs = [(spec[0],draco_facts + spec[1]) for spec in spec_facts]
        print(f"\nExecution Time: {time.time() - start_time_asp:.2f} seconds")
    chart_specs = {}
    # Heap to store top 10 lowest-cost models (as a max-heap using negative costs)
    top_models_heap = []

    MAX_CHARTS = 10
    start_time_asp = time.time()

    def process_spec(i_spec):
        i, spec = i_spec
        local_heap = []
        for j, model in enumerate(d.complete_spec(spec[1], num_chart)):
            cost = model.cost[0] if isinstance(model.cost, list) else model.cost
            if num_chart==1:
                chart_name = spec[0]
            elif specs is not None:
                chart_name = spec[0] + f".{j}"
            else :
                chart_name = f"Chart {i+j}"
            entry = (cost, chart_name, i, j, model)

            if len(local_heap) < MAX_CHARTS:
                heapq.heappush(local_heap, entry)
            else:
                if cost < local_heap[0][0]:
                    heapq.heapreplace(local_heap, entry)
        return local_heap

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(process_spec, enumerate(input_specs))

    # Merge heaps
    top_models_heap = []
    for local_heap in results:
        for entry in local_heap:
            if len(top_models_heap) < MAX_CHARTS:
                heapq.heappush(top_models_heap, entry)
            else:
                if entry[0] < top_models_heap[0][0]:
                    heapq.heapreplace(top_models_heap, entry)

    top_models = sorted(top_models_heap)
    # Convert heap to sorted list (ascending cost)
    #top_models = sorted([(-cost, chart_name, i, j, model ) for cost, chart_name, i, j, model in top_models_heap])
    print(f"\Top model execution Time: {time.time() - start_time_asp:.2f} seconds")

    start_time_asp = time.time()

    # Now render and convert only these
    for cost, chart_name, i, j, model  in top_models:
        chart_debug_name = f"CHART {(i * num_chart + j)}{chart_name}"
        schema = answer_set_to_dict(model.answer_set)

        # renderer.render returns a full vega-lite viz, but we only want the specs,
        # to improve performance we feed it an empty dataframe
        chart_vega_lite = renderer.render(spec=schema, data=pd.DataFrame())
        # Convert to JSON and prepare for frontend
        chart_vega_lite_json = split_vega_lite_spec(chart_vega_lite.to_json())

        unique_key = f"{chart_name}_{i}_{j}"
        chart_specs[unique_key] = (chart_name, chart_vega_lite_json, cost)

        if Debug:

            debug_dir = Path("debug")
            debug_dir.mkdir(parents=True, exist_ok=True)  # Ensure the debug directory exists

            debug_file = debug_dir / f"{chart_debug_name}_output.vg.json"
            with debug_file.open('w', encoding='utf-8') as f:
                print(f"Writing output {chart_debug_name} in {f.name}")
                print(f"Current chart cost: {cost}")
                f.write(chart_vega_lite.to_json())

    # Format output
    sorted_chart_vega_lite_json_list = [
        {"name": value[0], "spec": value[1]["spec"]}
        for value in chart_specs.values()
    ]
    print(f"\Rendering VL execution Time: {time.time() - start_time_asp:.2f} seconds")

    print(f"\nExecution Time: {time.time() - start_time:.2f} seconds | Item number: {len(input_specs)*num_chart} | Per Item : {( time.time() - start_time )/(len(input_specs)*num_chart)}")
    return sorted_chart_vega_lite_json_list

