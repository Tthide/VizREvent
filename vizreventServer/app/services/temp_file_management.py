import json
from pathlib import Path
from .dataset_filtering import preprocess_events
from .utils import get_resource_path


# we need the unused temp files to be deleted when switching to another dataset
# we already suppose in this function, that the folder exists
def clean_temp_files(temp_folder_path):
    temp_folder = Path(temp_folder_path)

    # Iterate through the temp folder and delete files that do not match the current dataset name
    for file_path in temp_folder.iterdir():
        if file_path.is_file():
            file_path.unlink()
            print(f"Deleted temporary file: {file_path}")


def read_data_temp_file(dataset_name):
    original_file_path = Path(get_resource_path(f"data/events/{dataset_name}.json"))
    temp_folder_path = Path(get_resource_path("data/events/temps"))
    temp_file_path = temp_folder_path / f"{dataset_name}.json"

    data = []

    # if temps folder doesn't exist, create it
    if not temp_folder_path.exists():
        temp_folder_path.mkdir(parents=True)
    
    # Creating temp file if doesn't already exist
    if not temp_file_path.exists():
        print(f"No temp file for this dataset: {dataset_name}")
        
        # Create a temporary file for future use
        if original_file_path.exists():
            print(f"Reading original data {original_file_path}")
            # Processing the data before writing it in the file
            with original_file_path.open("r", encoding='utf-8') as original_file:
                raw_data = json.load(original_file)
                print(f"Preprocessing the data...")

                data = preprocess_events(raw_data)
                print(f"Preprocessing done!")

            with temp_file_path.open("w", encoding='utf-8') as temp_file:
                json.dump(data, temp_file, indent=4)
                print(f"Temporary file created as a copy of the original file: {temp_file_path}")

        else:
            print(f"Original file does not exist: {original_file_path}")
            # Handle the case where the original file does not exist
            # You can create a default temp file or raise an error
            data = {"default_key": "default_value"}

    # if temps folder exists, read it
    else:
        print(f"Reading temp file {temp_file_path}")
        with temp_file_path.open('r', encoding='utf-8') as file:
            data = json.load(file)
            print("data_service/get_data" + str(file.name))

    return data