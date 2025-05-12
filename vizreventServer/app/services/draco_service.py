import draco
import pandas as pd
from draco import dict_to_facts
from draco.renderer import AltairRenderer
import altair as alt
from .dataset_filtering import split_vega_lite_spec
from tqdm import tqdm
#from .temp_file_management import create_temp_file


def get_draco_dataframe(preprocessed_data):
    """
    Converts unformatted data into a DataFrame suitable for Draco.

    Parameters:
    preprocessed_data (JSON): The pre_processed input data that needs to be reformatted.

    Returns:
    pd.DataFrame: A DataFrame representation of the dataset, ready for Draco.
    """
    #Debugging
    """json_dump = json.dumps(preprocessed_data, indent=4)
    # Writing to sample.json
    with open("debug/preprocessed_dataset.json", "w") as outfile:
        outfile.write(json_dump)"""


    #preprocessed_data=preprocess_events(preprocessed_data)
    
        
    #Creating the dataframe from the preprocessed json
    df = pd.json_normalize(preprocessed_data)
    
    
    
    #Removing all columns that have at least one empty cell.
    # Because Draco needs the df to not have any empty cell. (Basically removes the payload but also any errors in the dataset)
    df=df.dropna(axis=1,how='any')
    
    #Debug
    df.to_csv('debug/output_before_schema.csv', index=False)
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
    schema = draco.schema_from_dataframe(draco_data)
    
    #Now writing the datafields' properties to a json file for frontend access
    
    #Debug
    #print("\n\n\n/////////////////Schema\n",schema)  
    return schema


def get_draco_facts(draco_schema):
    """
    Converts a Draco schema into Draco facts.

    Parameters:
    draco_schema (dict): The Draco schema to be converted into facts.

    Returns:
    list: A list of Draco facts derived from the input schema.
    """
    data_schema_facts = draco.dict_to_facts(draco_schema)
    #Debug
    #print("\n\n\n///////////Draco_facts_from_schema:\n",data_schema_facts)
    return data_schema_facts



def generate_asp_variants(spec: dict, base: list[str]) -> list[list[str]]:
    variants = []

    #extracting properties from the current selected spec
    mark = spec.get("mark", {}).get("type") or spec.get("spec", {}).get("mark", {}).get("type")
    encoding = spec.get("encoding") or spec.get("spec", {}).get("encoding", {})

    for channel, enc in encoding.items():
        field = enc.get("field")
        aggregate = enc.get("aggregate")
        binning = enc.get("bin")
        stack = enc.get("stack")

        if not field:
            continue

        # Variant: Remove this encoding (drop field)
        clauses = []
        if mark:
            clauses.append(f"attribute((mark,type),m0,{mark}).")
        if channel:
            clauses.append(f":- attribute((encoding,channel),e0,{channel}).")
        if aggregate:
            clauses.append(f":- attribute((encoding,aggregate),e0,{aggregate}).")
        if binning:
            bin_clause = f":- attribute((encoding,binning),e0,{binning if isinstance(binning, bool) else '1'})."
            clauses.append(bin_clause)
        if stack:
            clauses.append(f":- attribute((encoding,stack),e0,{stack}).")
        variants.append(base + clauses)

        # Variant: Change mark type
        for alt_mark in ["bar", "line", "point", "area", "tick"]:
            if mark and alt_mark != mark:
                clauses = [f"attribute((mark,type),m0,{alt_mark}).", "entity(encoding,m0,e0)."]
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")
                variants.append(base + clauses)

        # Variant: Swap x/y channel
        if channel == "x" or channel == "y":
            swapped = "y" if channel == "x" else "x"
            clauses = []
            if mark:
                clauses.append(f"attribute((mark,type),m0,{mark}).")
            clauses.append(f"attribute((encoding,channel),e0,{swapped}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            variants.append(base + clauses)

        # Variant: Add binning if not present
        if not binning:
            clauses = []
            clauses.append(f"attribute((encoding,channel),e0,{channel}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            clauses.append("attribute((encoding,binning),e0,true).")
            variants.append(base + clauses)

        # Variant: Add aggregation if not present
        if not aggregate:
            for agg in ["mean", "sum", "count", "min", "max"]:
                clauses = []
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")
                clauses.append(f"attribute((encoding,aggregate),e0,{agg}).")
                variants.append(base + clauses)

        # Variant: Try stacking options
        if stack:
            for s in ["zero", "center", "normalize"]:
                if s != stack:
                    clauses = []
                    clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                    clauses.append(f"attribute((encoding,field),e0,{field}).")
                    clauses.append(f"attribute((encoding,stack),e0,{s}).")
                    variants.append(base + clauses)
                    
    for channel in ["color", "size", "shape", "text"]:
        clauses = ["entity(encoding,m0,e0)."]
        if mark:
            clauses.append(f"attribute((mark,type),m0,{mark}).")
        clauses.append(f"attribute((encoding,channel),e0,{channel}).")
        variants.append(base + clauses)

    # Deduplicate variants
    # Use tuple of sorted clauses to ensure uniqueness
    unique = {tuple(sorted(v)): v for v in variants}
    return list(unique.values())


default_input_spec =["entity(view,root,v0).",
                     "entity(mark,v0,m0).","entity(encoding,m0,e0).",
                     ":- {entity(encoding,m0,_)} < 2."]

def draco_rec_compute(data,d:draco.Draco = draco.Draco(),specs:list[str]= default_input_spec,num_chart:int = 2, labeler=lambda i: f"CHART {i + 1}", Debug: bool=False):
    """
    Computes and recommends Draco charts based on the input data.

    Parameters:
    data (JSON): The raw input data to be processed.
    num_chart (int, optional): The number of charts to recommend. Default is 5.
    Debug(bool, optional):Debug mode, writes chart_specs_outpute to json files in ./data/events/temps/. Default is False.
    
    Returns:
    dict: A dictionary containing the recommended chart specifications and their renderings.
    """
    
    
    renderer = AltairRenderer()
    draco_data=get_draco_dataframe(data)
    draco_facts=get_draco_facts(get_draco_schema(draco_data))
    
    spec_facts=[]
            
    print("\nspecs",specs)
    if specs==None :
        input_specs=[draco_facts+default_input_spec]
        num_chart=6
    else:
        spec_facts = generate_asp_variants(specs, default_input_spec)
        input_specs = [draco_facts + spec for spec in spec_facts]
        num_chart=1


        
    #print("\nspecs_fact",spec_facts)
    
    #print("\n draco_facts",draco_facts)

    # Dictionary to store the generated recommendations
    chart_specs = {}
    
    
    print("\n len input_specs",len(input_specs))

    for i,spec in tqdm(enumerate(input_specs)):
        #print("\n\n\n///////////input_specs:\n",spec)

        for j, model in enumerate(d.complete_spec(spec, num_chart)):
            chart_name = f"CHART {(i*num_chart+j)}"
            schema = draco.answer_set_to_dict(model.answer_set)

            chart_vega_lite = renderer.render(spec=schema, data=draco_data)
            
            #converting the altair object to json and formatting it for export to frontend
            chart_vega_lite_json=split_vega_lite_spec(chart_vega_lite.to_json())
            chart_specs[chart_name] = chart_vega_lite_json, model.cost

            #Debug, write into json file to test vega lite specs
            if(Debug):
                with open("debug/"+chart_name+'_output.vg.json', 'w') as f:
                    print(f"Writing output {chart_name} in {f.name}")
                    print(f"Current chart cost:{model.cost}")
                    f.write(chart_vega_lite.to_json())  # indent=4 makes it pretty
    

    # Sort the dictionary by the cost value and extract chart_vega_lite_json values
    sorted_chart_vega_lite_json_list = [value[0] for value in sorted(chart_specs.values(), key=lambda item: item[1])]
    print("\n len output_specs",len(sorted_chart_vega_lite_json_list))

    return sorted_chart_vega_lite_json_list


#Usage Example
"""file_path = create_temp_file("3857256")
with open(file_path, 'r') as file:
    data = json.load(file)
    draco_rec_compute(data,Debug=True)"""
