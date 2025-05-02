import os
import json
import pandas as pd
import numpy as np

#preprocessing of the dataset to make it easier to transform after    
def preprocess_events(events,
                     keep_keys=None,
                     payload_key='payload'):
    """
    For each event dict:
      1. Copy any key in `keep_keys` verbatim into the output.
      2. For any other key whose value is a dict containing 'name', set that key
         to the name string.
      3. All remaining keys go into a sub‑dict under `payload_key`.
    """
    if keep_keys is None:
        keep_keys = [
            'id','index','period','timestamp',
            'minute','second','possession',
            'location','duration'
        ]

    transformed = []
    for ev in events:
        new_ev = {}
        payload = {}
        for k, v in ev.items():
            if k in keep_keys:
                # keep these fields as-is
                new_ev[k] = v
            elif isinstance(v, dict) and 'name' in v:
                # automatically flatten any {"id":…, "name":…} objects
                new_ev[k] = v['name']
            else:
                # everything else goes into payload
                payload[k] = v

        new_ev[payload_key] = payload
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
            
