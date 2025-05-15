import draco
import pandas as pd
import numpy as np
from draco import dict_to_facts
from draco.renderer import AltairRenderer
import altair as alt
from .dataset_filtering import split_vega_lite_spec
from tqdm import tqdm
#from .temp_file_management import create_temp_file
from .asp_variant_generation import generate_asp_variants



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

    #Debug
    #print("\n\n\n/////////////////Schema\n",updated_schema)  
    return updated_schema


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



default_input_spec =["entity(view,root,v0).", # a root has to exist to display anything
                     "entity(mark,v0,m0).",   # likewise for a mark
                     "entity(encoding,m0,e0).", #here we ensure that we have at least one encoding
                     #':- attribute((scale,zero),_,true).', # we forbid to have this property because it creates visual duplicates (even if they are different vl specs)
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
        spec_facts = generate_asp_variants(specs, default_input_spec)
        #print("spec_facts",spec_facts)
        input_specs = [(spec[0],draco_facts + spec[1]) for spec in spec_facts]


        
    #print("\nspecs_fact",spec_facts)
    
    #print("\n draco_facts",draco_facts)

    # Dictionary to store the generated recommendations
    chart_specs = {}
    
    #print("\n len input_specs",len(input_specs))
    #print("\n\n\n///////////input_specs:\n",input_specs)

    for i,spec in tqdm(enumerate(input_specs)):
        #print("\n\n\n///////////input_specs:\n",spec)

        for j, model in enumerate(d.complete_spec(spec[1], num_chart)):
            if specs!=None:
                chart_name=spec[0]+f"_{j}"
            chart_debug_name  = f"CHART {(i*num_chart+j)}_{chart_name}"
            schema = draco.answer_set_to_dict(model.answer_set)


            chart_vega_lite = renderer.render(spec=schema, data=draco_data)
            
            #converting the altair object to json and formatting it for export to frontend
            chart_vega_lite_json=split_vega_lite_spec(chart_vega_lite.to_json())
            # Use a unique key for each entry
            unique_key = f"{chart_name}_{i}_{j}"
            chart_specs[unique_key] = chart_name,chart_vega_lite_json, model.cost

            #Debug, write into json file to test vega lite specs
            if(Debug):
                with open("debug/"+chart_debug_name +'_output.vg.json', 'w') as f:
                    print(f"Writing output {chart_debug_name } in {f.name}")
                    print(f"Current chart cost:{model.cost}")
                    f.write(chart_vega_lite.to_json())  # indent=4 makes it pretty
    

    # Sort the dictionary by the cost value and extract chart_vega_lite_json values
    sorted_chart_vega_lite_json_list = [{"name":value[0],"spec":value[1]} for value in sorted(chart_specs.values(), key=lambda item: item[2])]
    print("\n len output_specs",len(sorted_chart_vega_lite_json_list))

    return sorted_chart_vega_lite_json_list


#Usage Example
"""file_path = create_temp_file("3857256")
with open(file_path, 'r') as file:
    data = json.load(file)
    draco_rec_compute(data,Debug=True)"""
