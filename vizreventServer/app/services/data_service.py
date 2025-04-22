import json

def get_data(dataset_name):
    with open( "./data/events/" +str(dataset_name) + ".json", 'r') as file:
        data = json.load(file)
        print("data_service/get_data"+str(file.name))
    return data

def process_data(data):
    # Example: Return only the first 50 items
    return data[:50]