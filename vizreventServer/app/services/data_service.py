import json
import os

def get_data(dataset_name):
    with open( "./data/events/" +str(dataset_name) + ".json", 'r') as file:
        data = json.load(file)
        print("data_service/get_data"+str(file.name))
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