from collections import Counter, defaultdict
import json
from .utils import get_resource_path
from .temp_file_management import read_data_temp_file
import numpy as np
from .draco_service import get_draco_schema,get_draco_dataframe
from pathlib import Path


def get_data(dataset_name):
        # Check if the input is a string composed of numbers and nothing else
    if not isinstance(dataset_name, str) or not dataset_name.isdigit():
        raise ValueError("dataset_name must be a string composed of numbers only.")
    
    #checking whether the temp dataset already exist
    data = read_data_temp_file(dataset_name)
    return data

# here we only want to work with the datasets from the 2022 World Cup, if we want to allow users to chose, we would need
# this function to have a parameter (and it would be more like get_data())
def list_datasets():
    datasets_dir = Path(get_resource_path("data/matches/"))
    datasets = []

  # List all JSON files in the directory
    json_files = list(datasets_dir.glob("*.json"))  # Assuming the files are JSON files
    if not json_files:
        raise FileNotFoundError("No JSON files found in the dataset directory.")

    for file_path in json_files:
        with file_path.open('r', encoding='utf-8') as file:
            data = json.load(file)
            # Ensure data is a list and extend the datasets list
            if isinstance(data, list):
                datasets.extend(data)
            else:
                datasets.append(data)
    if not datasets:
        raise ValueError("No data could be read from any JSON files in the dataset directory.")
    return datasets



def is_number(x):
    return isinstance(x, (int, float, np.integer, np.floating))
def compute_distribution(data, fields):
    """
    Compute distribution data for each field in the dataset.
    For numerical fields, compute histogram bins and counts.
    For categorical/string fields, compute frequency counts suitable for treemaps.

    Args:
        data (list of dict): The dataset to analyze.
        fields (list of dict): List of field metadata dicts, each with keys 'name' and 'type'.

    Returns:
        dict: mapping field name -> distribution info
    """
    from collections import Counter, defaultdict
    import numpy as np

    collected = defaultdict(list)
    for row in data:
        for f in fields:
            field_name = f["name"]
            collected[field_name].append(row.get(field_name))

    distribution = {}
    for f in fields:
        field_name = f["name"]
        values = collected[field_name]

        if f["type"] == "number":
            arr = np.array(values)
            hist, bin_edges = np.histogram(arr, bins='auto')
            distribution[field_name] = {
                "type": "numerical",
                "bins": bin_edges.tolist(),
                "counts": hist.tolist()
            }
        else:  # treat all others as categorical
            freq = dict(Counter(values))
            distribution[field_name] = {
                "type": "categorical",
                "frequencies": freq
            }
    return distribution


def get_data_fields(dataset_name, file_path=Path("./data/events/temps/draco_dataframe.json")):
    # Check if the input is a string composed of numbers and nothing else
    if not isinstance(dataset_name, str) or not dataset_name.isdigit():
        raise ValueError("dataset_name must be a string composed of numbers only.")
    
    data = get_data(dataset_name)
    print("Computing dataset's schema")
    draco_data = get_draco_dataframe(data)
    schema_data = get_draco_schema(draco_data)
    
    # the schema has Numpy types values which cannot be jsonify so we have to convert them to native Python
    def convert_numpy(obj):
        if isinstance(obj, dict):
            return {k: convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(v) for v in obj]
        elif isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        else:
            return obj
    
    print("Computing distribution data for each field")
    distribution = compute_distribution(data, schema_data["field"])
    
    # Append distribution data back into each field dict
    for field in schema_data["field"]:
        dist = distribution.get(field["name"])
        if dist:
            field["distribution"] = dist
    
    print("Datafields found and distribution computed")
    
    schema_data = convert_numpy(schema_data)
    return schema_data
