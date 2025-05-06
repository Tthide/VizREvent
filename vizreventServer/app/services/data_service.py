import os
import json
from .temp_file_management import create_temp_file,create_temp_data_schema
import glob
from .draco_service import get_draco_schema,get_draco_dataframe
import time

def get_data(dataset_name):
    
        # Check if the input is a string composed of numbers and nothing else
    if not isinstance(dataset_name, str) or not dataset_name.isdigit():
        raise ValueError("dataset_name must be a string composed of numbers only.")
    
    #checking whether the temp dataset already exist
    file_path = create_temp_file(dataset_name)
    
    # Wait for the file to be written
    while not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        time.sleep(0.1)  # Wait for a short period before checking again
        
    with open(file_path, 'r') as file:
        data = json.load(file)
        print("data_service/get_data" + str(file.name))
    return data

#here we only want to work with the datasets from the 2022 World Cup, if we want to allow users to chose, we would need
#this function to have a parameter (and it would be more like get_data()
def list_datasets():
    datasets_dir = "./data/matches/"
    datasets = []

    # List all files in the directory
    for filename in os.listdir(datasets_dir):
        if filename.endswith(".json"):  # Assuming the files are JSON files
            file_path = os.path.join(datasets_dir, filename)
            with open(file_path, 'r') as file:
                data = json.load(file)
                # Ensure data is a list and extend the datasets list
                if isinstance(data, list):
                    datasets.extend(data)
                else:
                    datasets.append(data)
    return datasets


def get_data_fields(dataset_name,file_path="./data/events/temps/draco_dataframe.json"):
            # Check if the input is a string composed of numbers and nothing else
    if not isinstance(dataset_name, str) or not dataset_name.isdigit():
        raise ValueError("dataset_name must be a string composed of numbers only.")
    
    data=get_data(dataset_name)
    draco_data=get_draco_dataframe(data)
    schema_data = get_draco_schema(draco_data)
    file_path=create_temp_data_schema(schema_data)
    
        # Wait for the file to be written
    while not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        time.sleep(0.1)  # Wait for a short period before checking again
    
    with open(file_path, 'r') as file:
        output_schema = json.load(file)
    
    return output_schema

def write_into_temp_dataset(payload: str):
    """
    Writes the provided JSON payload into a the temp dataset JSON file.
    The function assumes there is exactly one such file in the folder.

    Parameters:
    payload (str): The JSON content to be written into the file.

    Returns:
    None
    """
    # Define the folder path
    folder_path = "./data/events/temps/"

    # Use glob to find the file that matches the pattern
    file_pattern = os.path.join(folder_path, "[0-9]*.json")
    matching_files = glob.glob(file_pattern)

    if len(matching_files) == 1:
        file_path = matching_files[0]
        with open(file_path, 'w') as f:
            print(f"Writing output to {f.name}")
            f.write(payload)  # Write the payload to the file
    else:
        print("Error: Either no file or multiple files match the pattern.")

