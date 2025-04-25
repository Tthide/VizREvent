import json
from draco import schema_from_dataframe
import pandas as pd
import numpy as np

def get_draco_schema(data):
    
    #the base datasets are not in format to be able to be read by draco
    #we first need to convert them to dataframe before becoming a draco schema
    df = pd.json_normalize(data)
    #print("/////////////////////DF:\n",df)
    
    
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

    # Handle NaN values by filling them with appropriate default scalar values
    default_values = {
        'id': '',
        'index': 0,
        'period': 0,
        'timestamp': '',
        'minute': 0,
        'second': 0,
        'type.id': 0,
        'type.name': '',
        'possession': 0,
        'possession_team.id': 0,
        'possession_team.name': '',
        'play_pattern.id': 0,
        'play_pattern.name': '',
        'team.id': 0,
        'team.name': '',
        'player.id': 0,
        'player.name': '',
        'position.id': 0,
        'position.name': '',
        'location': '(0.0, 0.0)',  # Use a string representation of the tuple
        'related_events': '()'  # Use a string representation of the tuple
    }
    df = df.fillna(default_values)
    # Ensure numerical columns do not contain NaN values
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(0)
        
    #processing draco schema 
    schema = schema_from_dataframe(df)
    #print(type(schema))  
    # Print the JSON string
    #print("////////Schema",schema)  
    return schema