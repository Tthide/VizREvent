import json
import os
import shutil
from .dataset_filtering import preprocess_events
import numpy as np

#we need the unused temp files to be deleted when switching to another dataset
#we already suppose in this function, that the folder exists
def clean_temp_files(temp_folder_path):

    # Iterate through the temp folder and delete files that do not match the current dataset name
    for filename in os.listdir(temp_folder_path):
        file_path = os.path.join(temp_folder_path, filename)
        os.remove(file_path)
        print(f"Deleted temporary file: {file_path}")
            
            
#the dataset needs to be processed to be made usable for draco
#therefore we create a temp copy of the current dataset on which we will apply the modification
#if that temp file already exists then we pass it
def create_temp_file(dataset_name):
    original_file_path = f"./data/events/{dataset_name}.json"
    temp_folder_path = "./data/events/temps"
    temp_file_path = f"{temp_folder_path}/{dataset_name}.json"
    
    #if temps folder doesn't exist, create it
    if not os.path.exists(temp_folder_path):
        os.makedirs(temp_folder_path)


    # Creating temp file if doesn't already exists
    if not os.path.exists(temp_file_path):
        # Clean other temporary files
        clean_temp_files(temp_folder_path)
        
        # Create a temporary file
        if os.path.exists(original_file_path):
            
            print(f"Temporary file created as a copy of the original file: {temp_file_path}")
            #Processing the data before writing it in the file
            with open(original_file_path,"r") as original_file:
                data= json.load(original_file)

            with open(temp_file_path,"w") as temp_file:
                json.dump(preprocess_events(data),temp_file,indent=4)
            
        else:
            print(f"Original file does not exist: {original_file_path}")
            # Handle the case where the original file does not exist
            # You can create a default temp file or raise an error
            default_data = {"default_key": "default_value"}
            with open(temp_file_path, 'w') as temp_file:
                json.dump(default_data, temp_file,indent=4)
            print(f"Temporary file created with default data: {temp_file_path}")

    return temp_file_path

def create_temp_data_schema(schema_data,file_path="./data/events/temps/draco_dataframe.json"):
    
        # Function to convert non-serializable objects to serializable format
    def convert_to_serializable(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        raise TypeError(f"Type {type(obj)} not serializable")

    # Convert the 'field' part of the schema to a JSON string with indentation
    json_object = json.dumps(schema_data["field"], indent=4, default=convert_to_serializable)

    # Write the JSON string to a file
    with open(file_path, "w") as outfile:
        outfile.write(json_object)
        
    return file_path