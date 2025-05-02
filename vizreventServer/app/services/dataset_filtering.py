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


#Remove a specified column from a DataFrame.
def remove_column(df: pd.DataFrame, column_name: str)-> pd.DataFrame:
    if column_name in df.columns:
        return df.drop(columns=[column_name])
    else:
        print(f"Column '{column_name}' not found in DataFrame.")
        return df

#Removing non essential or redundant data columns from the dataset's DataFrame.
def dataset_df_cleaning(df):
    
    with open("./data/data_columns_to_remove.json", 'r') as file:
        data = json.load(file)
        columns_to_remove = data.get("columns_to_remove", [])

        for column in columns_to_remove:
            df = remove_column(df, column)

    return df

def fill_dataframe_empty_cells(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill empty/missing cells in a DataFrame based on column data types.
    Numbers -> 0
    Strings -> ""
    Lists/Tuples -> [] or ()
    """
    filled_df = df.copy()

    for col in filled_df.columns:
        col_dtype = filled_df[col].dtype

        if np.issubdtype(col_dtype, np.number):
            filled_df[col] = filled_df[col].fillna(0)
        elif col_dtype == object:
            sample_nonnull_series = filled_df[col].dropna()
            sample_nonnull = sample_nonnull_series.iloc[0] if not sample_nonnull_series.empty else ""

            if isinstance(sample_nonnull, (list, tuple)):
                default_value = [] if isinstance(sample_nonnull, list) else ()

                filled_df[col] = filled_df[col].apply(
                    lambda x: default_value if pd.isna(x) else x
                )
            else:
                filled_df[col] = filled_df[col].fillna("")
        else:
            filled_df[col] = filled_df[col].fillna(0)

    return filled_df
            
