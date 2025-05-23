import os
import json


# Compute the default config path once, relative to this script’s location
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CONF = os.path.join(SCRIPT_DIR, 'preprocessing_config.json')

def preprocess_events(events: list[dict], 
                      config_path: str = DEFAULT_CONF) -> list[dict]:
    """
    1. Loads keep_keys from 'preprocessing_config.json' stored alongside this script.
    2. Copies any key in keep_keys verbatim into the output.
    3. Flattens any dict-with-['name'] into its name string.
    4. Packs all other fields into the 'payload' dict.
    """

    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, 'r', encoding='utf-8') as f:
        CONFIG = json.load(f)

    KEEP_KEYS = CONFIG.get('keep_keys', [])

    transformed = []
    for ev in events:
        new_ev  = {}
        payload = {}
        for k, v in ev.items():
            if k in KEEP_KEYS:
                if isinstance(v, dict) and 'name' in v:
                    new_ev[k] = v['name']
                else:
                    new_ev[k] = v
            #else:
                #payload[k] = v

        #new_ev['payload'] = payload
        transformed.append(new_ev)

    return transformed



def split_vega_lite_spec(chart_rec_item_json):
    chart_rec_item = json.loads(chart_rec_item_json)

    datasets = chart_rec_item.get("datasets", {})
    data_ref = chart_rec_item.get("data", {})
    original_name = data_ref.get("name")
    spec_without_data = {k: v for k, v in chart_rec_item.items() if k != "datasets"}

    # Expecting only one dataset key
    if len(datasets) != 1:
        raise ValueError("Expected exactly one dataset in 'datasets'")

    # Extract the nested dictionary from the datasets
    dataset_values = datasets[original_name]

    # Update the spec to refer to the renamed dataset
    spec_without_data["data"] = {
        "name": "dataset"
    }

    return {
        "spec": spec_without_data,
        "data": {
            "dataset": dataset_values
        }
    }


def is_preprocessed(data: list[dict[str, any]], config_path: str = DEFAULT_CONF) -> bool:
    """
    Returns True if data appears to be preprocessed correctly:
    - Each item is a dict.
    - Contains 'payload' key.
    - All other keys match expected keep_keys or are flat values.
    """
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, 'r', encoding='utf-8') as f:
        CONFIG = json.load(f)

    KEEP_KEYS = CONFIG.get('keep_keys', [])

    for i, item in enumerate(data):
        if not isinstance(item, dict):
            print(f"[Validation Error] Item at index {i} is not a dict.")
            return False

        if 'payload' not in item:
            print(f"[Validation Error] Item at index {i} missing 'payload'.")
            return False

        for k, v in item.items():
            if k == 'payload':
                if not isinstance(v, dict):
                    print(f"[Validation Error] 'payload' at index {i} is not a dict.")
                    return False
            elif k in KEEP_KEYS:
                continue  # valid
            elif isinstance(v, dict):
                print(f"[Validation Warning] Unexpected nested dict at key '{k}' in index {i}.")
                return False

    return True
            
