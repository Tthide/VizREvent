import json
from pathlib import Path

# Compute the default config path once, relative to this script’s location
SCRIPT_DIR   = Path(__file__).resolve().parent
DEFAULT_CONF = SCRIPT_DIR / 'preprocessing_config.json'

def preprocess_events(events: list[dict], 
                      config_path: Path = DEFAULT_CONF) -> list[dict]:
    """
    1. Loads keep_keys from 'preprocessing_config.json' stored alongside this script.
    2. Copies any key in keep_keys verbatim into the output.
    3. Flattens any dict-with-['name'] into its name string.
    4. Packs all other fields into the 'payload' dict.
    """

    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with config_path.open('r', encoding='utf-8') as f:
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
            # else:
                # payload[k] = v

        # new_ev['payload'] = payload
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
