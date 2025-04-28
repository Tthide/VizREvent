import os
import json


#preprocessing of the dataset to make it easier to transform after
def preprocess_events(dataset):
    #deleting unnecessary id keys
    def delete_ids(obj, first_level=True):
        if isinstance(obj, dict):
            keys_to_delete = [key for key in obj if key == 'id' and not first_level]
            for key in keys_to_delete:
                del obj[key]
            for key, value in list(obj.items()):
                if isinstance(value, dict) and 'id' in value and 'name' in value:
                    obj[key] = value['name']
                else:
                    delete_ids(value, False)
        elif isinstance(obj, list):
            for item in obj:
                delete_ids(item, False)

    #Moving(grouping) additional event type info to event property
    def move_additional_info(event):
        # Check if the 'type' key exists in the object
        if 'type' in event:
            type_value = event['type'].lower()  # Convert the type value to lowercase
            # Check if the value of the 'type' key exists as another key in the object
            if type_value in event:
                # Move the corresponding value to the 'type' key
                event['type'] = {
                    'name': type_value,
                    type_value: event[type_value]
                }
                # Remove the original key
                del event[type_value]
        return event

    #applying to all events of the dataset
    for event in dataset:
        delete_ids(event)
        move_additional_info(event)

    return dataset


#Remove a specified column from a DataFrame.
def remove_column(df, column_name):
    if column_name in df.columns:
        return df.drop(columns=[column_name])
    else:
        print(f"Column '{column_name}' not found in DataFrame.")
        return df


            
