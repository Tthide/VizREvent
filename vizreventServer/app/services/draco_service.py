import draco
import pandas as pd
from draco.renderer import AltairRenderer
import altair as alt
from .dataset_filtering import split_vega_lite_spec,is_preprocessed,preprocess_events
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

default_input_spec =["entity(view,root,v0).",
                     "entity(mark,v0,m0).",]

def draco_rec_compute(data,d:draco.Draco = draco.Draco(),specs:list[str]= default_input_spec,num_chart:int = 5, labeler=lambda i: f"CHART {i + 1}", Debug: bool=False):
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
    input_spec_base = draco_facts + specs
    #print("\n\n\n///////////input_spec_base:\n",input_spec_base)
    def recommend_charts(
    spec: list[str], drc: draco.Draco, num: int = 5, labeler=lambda i: f"CHART {i + 1}"
):
        # Dictionary to store the generated recommendations, keyed by chart name
        chart_specs = []
        
        for i, model in enumerate(drc.complete_spec(spec, num)):
            
            chart_name = labeler(i)
            schema = draco.answer_set_to_dict(model.answer_set)

            #print("draco spec",chart_specs[chart_name])
            #print(f"COST: {model.cost}")
            
            #computing vega lite spec for current recommendation
            chart_vega_lite = renderer.render(spec=schema, data=draco_data)
            #chart_specs[chart_name] = draco.dict_to_facts(schema), schema
            
            #converting the altair object to json and formatting it for export to frontend
            chart_vega_lite_json=split_vega_lite_spec(chart_vega_lite.to_json())
            chart_specs.append(chart_vega_lite_json)
            
            #Debug, write into json file to test vega lite specs
            if(Debug):
                with open("debug/"+chart_name+'_output.vg.json', 'w') as f:
                    print(f"Writing output {chart_name} in {f.name}")
                    f.write(chart_vega_lite.to_json())  # indent=4 makes it pretty
        return chart_specs

    return recommend_charts(input_spec_base,d,num_chart)


#Usage Example
"""file_path = create_temp_file("3857256")
with open(file_path, 'r') as file:
    data = json.load(file)
    draco_rec_compute(data,Debug=True)"""
