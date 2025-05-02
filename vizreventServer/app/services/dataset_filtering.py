import os
import json
import pandas as pd
import numpy as np

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

    with open(config_path, 'r') as f:
        CONFIG = json.load(f)

    KEEP_KEYS = CONFIG.get('keep_keys', [])

    transformed = []
    for ev in events:
        new_ev  = {}
        payload = {}
        for k, v in ev.items():
            if k in KEEP_KEYS:
                new_ev[k] = v
            elif isinstance(v, dict) and 'name' in v:
                new_ev[k] = v['name']
            else:
                payload[k] = v

        new_ev['payload'] = payload
        transformed.append(new_ev)

    return transformed

            
