import json
import draco
import pandas as pd
import numpy as np
from draco.renderer import AltairRenderer
import altair as alt
from .dataset_filtering import preprocess_events, fill_dataframe_empty_cells,dataset_df_cleaning
from .temp_file_management import create_temp_file


def get_draco_dataframe(unformatted_data):
    """
    Converts unformatted data into a DataFrame suitable for Draco.

    Parameters:
    unformatted_data (JSON): The raw input data that needs to be preprocessed.

    Returns:
    pd.DataFrame: A DataFrame representation of the dataset, ready for Draco.
    """
    
    #the base datasets are not in format to be able to be read by draco
    #we first need to convert them to dataframe before becoming a draco schema
    preprocessed_data=preprocess_events(unformatted_data)
    
    """Debugging
    json_dump = json.dumps(preprocessed_data, indent=4)
    # Writing to sample.json
    with open("preprocessed_dataset.json", "w") as outfile:
        outfile.write(json_dump)"""
    
    df = pd.json_normalize(preprocessed_data)
    
    #Uncomment to remove unnecessary data fields column
    #Put data field names to remove in vizreventServer/data/data_columns_to_remove.json
    df=dataset_df_cleaning(df)
    
    
    #Debugging
    #print("/////////////////////DF_filtered:\n",df)
    # Write the DataFrame to a CSV file
    #df.to_csv('output_after_clean.csv', index=False)
    
    # Function to convert non-hashable types to hashable types
    def make_hashable(value):
        if isinstance(value, list):
            return tuple(make_hashable(item) for item in value)
        elif isinstance(value, dict):
            return json.dumps(value, sort_keys=True)
        else:
            return value

    # Apply the conversion to the entire DataFrame
    df = df.map(make_hashable)

    """Debug
    print("/////////////////////DF_hashed:\n",df)
        # Write the DataFrame to a CSV file"""
    #df.to_csv('output_after_hash.csv', index=False)
    
    # Handle NaN values by filling them with appropriate default scalar values
    #it also ensures that the entropy won't be equal to 0 which is a requirement of Draco/Clingo
    df=fill_dataframe_empty_cells(df)
    #Some property names have dots in them which leads to parsing error in clingo
    df.columns = df.columns.str.replace('.', '_', regex=False)
    # now prefix any name that starts with a digit (again it creates parsing errors in Clingo)
    df.columns = df.columns.str.replace(r'^(?=\d)', 'e_', regex=True)
    #Debug
   #df.to_csv('output_before_schema.csv', index=False)
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

default_input_spec =["entity(view,root,v0).",
                     "entity(mark,v0,m0).",]

def draco_rec_compute(data,specs:list[str]= default_input_spec,num_chart:int = 5, labeler=lambda i: f"CHART {i + 1}", Debug: bool=False):
    """
    Computes and recommends Draco charts based on the input data.

    Parameters:
    data (JSON): The raw input data to be processed.
    num_chart (int, optional): The number of charts to recommend. Default is 5.
    Debug(bool, optional):Debug mode, writes chart_specs_outpute to json files in ./data/events/temps/. Default is False.
    
    Returns:
    dict: A dictionary containing the recommended chart specifications and their renderings.
    """
    
    d = draco.Draco()
    renderer = AltairRenderer()
    draco_data=get_draco_dataframe(data)
    draco_facts=get_draco_facts(get_draco_schema(draco_data))
    input_spec_base = draco_facts + specs
    #print("\n\n\n///////////input_spec_base:\n",input_spec_base)
    
    def recommend_charts(
    spec: list[str], drc: draco.Draco, num: int = 5, labeler=lambda i: f"CHART {i + 1}"
):
        # Dictionary to store the generated recommendations, keyed by chart name
        chart_specs = {}
        
        for i, model in enumerate(drc.complete_spec(spec, num)):
            
            chart_name = labeler(i)
            schema = draco.answer_set_to_dict(model.answer_set)

            #print("draco spec",chart_specs[chart_name])
            #print(f"COST: {model.cost}")
            
            #computing vega lite spec for current recommendation
            chart_vega_lite = renderer.render(spec=schema, data=draco_data)
            #chart_specs[chart_name] = draco.dict_to_facts(schema), schema
            chart_specs[chart_name] = chart_vega_lite
            
            #Debug, write into json file to test vega lite specs
            if(Debug):
                with open("./data/events/temps/"+chart_name+'_output.vg.json', 'w') as f:
                    f.write(chart_vega_lite.to_json())  # indent=4 makes it pretty
        return chart_specs

    return recommend_charts(input_spec_base,d,num_chart)



#Usage Example
file_path = create_temp_file("3857256")
with open(file_path, 'r') as file:
    data = json.load(file)
    draco_rec_compute(data)
