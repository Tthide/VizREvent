import json
import draco
import pandas as pd
import numpy as np
from draco.renderer import AltairRenderer
import altair as alt
from .temp_file_management import create_temp_file 
from .dataset_filtering import dataset_df_cleaning,preprocess_events 



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
    #df=dataset_df_cleaning(df)
    """Debugging
    print("/////////////////////DF_filtered:\n",df)
    # Write the DataFrame to a CSV file
    df.to_csv('output_after_clean.csv', index=False)"""
    
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
        # Write the DataFrame to a CSV file
    df.to_csv('output_after_hash.csv', index=False)"""
    
    # Handle NaN values by filling them with appropriate default scalar values
    #it also ensures that the entropy won't be equal to 0 which is a requirement of Draco/Clingo
    default_values = {
    'id': '',
    'index': 0,
    'period': 1,
    'timestamp': '',
    'minute': 0,
    'second': 0,
    'type': '',
    'possession': 0,
    'possession_team': '',
    'play_pattern': '',
    'team': '',
    'duration': 0,
    'tactics.formation': 0,
    'tactics.lineup': '',
    'related_events': '()',
    'player': '',
    'position': '',
    'location': '(0.0, 0.0)',
    'type.name': '',
    'type.pass.recipient': '',
    'type.pass.length': 0,
    'type.pass.angle': 0,
    'type.pass.height': '',
    'type.pass.end_location': '(0.0, 0.0)',
    'type.pass.body_part': '',
    'type.pass.type': '',
    'type.carry.end_location': '(0.0, 0.0)',
    'type.pass.cross': 0,
    'type.pass.outcome': '',
    'ball_receipt.outcome': '',
    'under_pressure': 0,
    'type.clearance.right_foot': 0,
    'type.clearance.body_part': '',
    'type.shot.statsbomb_xg': 0,
    'type.shot.end_location': '(0.0, 0.0)',
    'type.shot.technique': '',
    'type.shot.body_part': '',
    'type.shot.type': '',
    'type.shot.outcome': '',
    'type.shot.first_time': 0,
    'type.shot.freeze_frame': '[]',
    'goalkeeper.end_location': '(0.0, 0.0)',
    'goalkeeper.position': '',
    'goalkeeper.type': '',
    'type.pass.assisted_shot_id': '',
    'type.pass.shot_assist': 0,
    'type.shot.key_pass_id': '',
    'goalkeeper.technique': '',
    'goalkeeper.body_part': '',
    'goalkeeper.outcome': '',
    'off_camera': 0,
    'type.pass.deflected': 0,
    'counterpress': 0,
    'type.duel.type': '',
    'type.pass.aerial_won': 0,
    'type.interception.outcome': '',
    'type.clearance.left_foot': 0,
    'type.pass.switch': 0,
    'type.clearance.aerial_won': 0,
    'type.clearance.head': 0,
    'out': 0,
    'type.pass.outswinging': 0,
    'type.pass.technique': '',
    'foul_won.defensive': 0,
    'type.duel.outcome': '',
    'type.dribble.outcome': '',
    'type.shot.one_on_one': 0,
    'type.pass.cut_back': 0,
    'type.block.offensive': 0,
    'foul_committed.card': '',
    'type.pass.goal_assist': 0,
    'type.shot.deflected': 0,
    'type.block.deflection': 0,
    'type.pass.through_ball': 0,
    'foul_committed.advantage': 0,
    'foul_won.advantage': 0,
    'type.pass.miscommunication': 0,
    'ball_recovery.recovery_failure': 0,
    'type.dribble.nutmeg': 0,
    'type.shot.open_goal': 0,
    'type.substitution.outcome': '',
    'type.substitution.replacement': '',
    'foul_committed.type': '',
    'injury_stoppage.in_chain': 0,
    'bad_behaviour.card': '',
    'type.shot.aerial_won': 0,
}

    df = df.fillna(default_values)
    # Ensure numerical columns do not contain NaN values
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(0)
    
    #Debug
    #df.to_csv('output_before_schema.csv', index=False)
    
    #some property names have dots in them which leads to parsing error in clingo
    df.columns = [col.replace(".", "_") for col in df.columns]
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


def draco_rec_compute(data,num_chart:int = 5):
    """
    Computes and recommends Draco charts based on the input data.

    Parameters:
    data (JSON): The raw input data to be processed.
    num_chart (int, optional): The number of charts to recommend. Default is 5.

    Returns:
    dict: A dictionary containing the recommended chart specifications and their renderings.
    """
    
    d = draco.Draco()
    renderer = AltairRenderer()
    
    draco_data=get_draco_dataframe(data)
    draco_facts=get_draco_facts(get_draco_schema(draco_data))
    

    input_spec_base = draco_facts + ["entity(view,root,v0).","entity(mark,v0,m0).",]
    
    
    def recommend_charts(
    spec: list[str], drc: draco.Draco, num: int = 5, labeler=lambda i: f"CHART {i + 1}"
) -> dict[str, tuple[list[str], dict]]:
        # Dictionary to store the generated recommendations, keyed by chart name
        chart_specs = {}
        
        for i, model in enumerate(drc.complete_spec(spec, num)):
            
            chart_name = labeler(i)
            schema = draco.answer_set_to_dict(model.answer_set)

            #print("draco spec",chart_specs[chart_name])
            #print(f"COST: {model.cost}")
            
            #computing vega lite spec for current recommendation
            chart_vega_lite = renderer.render(spec=schema, data=draco_data)
            
            chart_specs[chart_name] = chart_vega_lite
            
            """Debug, write into json file to test vega lite specs
            with open(chart_name+'_output.json', 'w') as f:
                f.write(chart_vega_lite.to_json())  # indent=4 makes it pretty"""


        return chart_specs

    return recommend_charts(input_spec_base,d,num_chart)


"""#Usage Example
file_path = create_temp_file("3857256")
with open(file_path, 'r') as file:
    data = json.load(file)
    draco_rec_compute(data)"""
