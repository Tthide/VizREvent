import json
import os
import shutil

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


    # Check if the original file exists
    if not os.path.exists(temp_file_path):
        # Clean other temporary files
        clean_temp_files(temp_folder_path)
        
        # Create a temporary file that is a copy of the original file
        if os.path.exists(original_file_path):
            shutil.copyfile(original_file_path, temp_file_path)
            print(f"Temporary file created as a copy of the original file: {temp_file_path}")
        else:
            print(f"Original file does not exist: {original_file_path}")
            # Handle the case where the original file does not exist
            # You can create a default temp file or raise an error
            default_data = {"default_key": "default_value"}
            with open(temp_file_path, 'w') as temp_file:
                json.dump(default_data, temp_file)
            print(f"Temporary file created with default data: {temp_file_path}")

    return temp_file_path

def get_data(dataset_name):
    #checking whether the temp dataset already exist
    file_path = create_temp_file(dataset_name)
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
    
def process_data(data):
    # Example: Return only the first 50 items
    return data[:50]