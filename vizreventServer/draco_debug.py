# -*- coding: utf-8 -*-
"""
Created on Tue Apr 29 14:34:55 2025

@author: Thibault
"""



# Display utilities
import json
import draco
import altair as alt
from draco.renderer import AltairRenderer
from draco.debug import DracoDebug, DracoDebugChartConfig, DracoDebugPlotter
from services.temp_file_management import create_temp_file
from services.draco_service import get_draco_dataframe,get_draco_facts,get_draco_schema
import numpy as np
from IPython.display import Markdown, display
from tqdm import tqdm

# Handles serialization of common numpy datatypes
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)


def md(markdown: str):
    display(Markdown(markdown))


def pprint(obj):
    md(f"```json\n{json.dumps(obj, indent=2, cls=NpEncoder)}\n```")
#%%

default_input_spec=[
    "entity(view,root,v0).",
    "entity(mark,v0,m0).",
]
def draco_rec_compute(data,specs:list[str]= default_input_spec,num_chart:int = 5, labeler=lambda i: f"CHART {i + 1}", Debug: bool=False):
    """
    Computes and recommends Draco charts based on the input data.

    Parameters:
    data (JSON): The raw input data to be processed.
    num_chart (int, optional): The number of charts to recommend. Default is 5.
    Debug(bool, optional):Debug mode, writes chart_specs_outpute to json files in ./data/events/temps/. Default is False.
    
    Returns:
    dict: A dictionary containing the recommended chart specifications and their renderings.
    """
    
    d = draco.Draco()
    renderer = AltairRenderer()
    draco_data=get_draco_dataframe(data)
    draco_facts=get_draco_facts(get_draco_schema(draco_data))
    input_spec_base = draco_facts + specs
    #print("\n\n\n///////////input_spec_base:\n",input_spec_base)
    if Debug:
        alt.renderers.enable("svg")

    
    def recommend_charts(
    spec: list[str], drc: draco.Draco, num: int = 2, labeler=lambda i: f"CHART {i + 1}"
):
        # Dictionary to store the generated recommendations, keyed by chart name
        chart_specs = {}
        
        for i, model in enumerate(drc.complete_spec(spec, num)):
            
            chart_name = labeler(i)
            schema = draco.answer_set_to_dict(model.answer_set)

            #print("draco spec",chart_specs[chart_name])
            #print(f"COST: {model.cost}")
            
            #computing vega lite spec for current recommendation
            chart_vega_lite = renderer.render(spec=schema, data=draco_data)
            display(chart_vega_lite)
            chart_specs[chart_name] = draco.dict_to_facts(schema), schema
            #chart_specs[chart_name] = chart_vega_lite
            
            
        return chart_specs

    return recommend_charts(input_spec_base,d,num_chart)


#%%
    
d = draco.Draco()
renderer = AltairRenderer()
alt.renderers.enable("svg")
   
#%%
 
#Usage Example
file_path = create_temp_file("3857256")
with open(file_path, 'r') as file:
    data = json.load(file)
    chart_specs=draco_rec_compute(data)
#%%
test_specs = [
"entity(view,root,v).",
"attribute((view,coordinates),v,cartesian).",

"entity(mark,v,m).",
"attribute((mark,type),m,tick).",
]
with open(file_path, 'r') as file:
    data = json.load(file)
    draco_data=get_draco_dataframe(data)
    draco_facts=get_draco_facts(get_draco_schema(draco_data))
    input_spec_base = draco_facts + test_specs
    

#%%Inspecting the Knowledge Base

def display_debug_data(draco: draco.Draco, specs: dict[str, tuple[list[str], dict]]):
    debugger = DracoDebug(
        specs={chart_name: fact_spec for chart_name, (fact_spec, _) in specs.items()},
        draco=draco,
    )
    chart_preferences = debugger.chart_preferences

    print("**Raw debug data**")
    print(chart_preferences.head().to_string())

    print("**Number of violated preferences**")
    num_violations = len(
        set(chart_preferences[chart_preferences["count"] != 0]["pref_name"])
    )
    num_all = len(set(chart_preferences["pref_name"]))
    print(
        f"*{num_violations} preferences are violated out of a total of {num_all} preferences (soft constraints)*"
    )

    print("Using DracoDebugPlotter to visualize the debug DataFrame (open separately if needed)")
    plotter = DracoDebugPlotter(chart_preferences)
    plot_size = (1200, 600)
    chart = plotter.create_chart(
        cfg=DracoDebugChartConfig.SORT_BY_COUNT_SUM,
        violated_prefs_only=False,
        plot_size=plot_size,
    )
    chart.show()  # <-- If using Altair/VegaLite backend; else: export to HTML or save
    
#%%


display_debug_data(draco=d, specs=chart_specs)



#%%Generating Input Specifications Programmatically
def rec_from_generated_spec(data,
    marks: list[str],
    fields: list[str],
    encoding_channels: list[str],
    draco: draco.Draco,
    num: int = 1,
) -> dict[str, dict]:
    input_specs = [
        (
            (mark, field, enc_ch),
            input_spec_base
            + [
                f"attribute((mark,type),m0,{mark}).",
                "entity(encoding,m0,e0).",
                f"attribute((encoding,field),e0,{field}).",
                f"attribute((encoding,channel),e0,{enc_ch}).",
                # filter out designs with less than 3 encodings
                ":- {entity(encoding,_,_)} < 3.",
                # exclude multi-layer designs
                ":- {entity(mark,_,_)} != 1.",
            ],
        )
        for mark in marks
        for field in fields
        for enc_ch in encoding_channels
    ]
    #print(input_specs)
    recs = {}
    for cfg, spec in tqdm(input_specs, desc="Processing input specifications"):        
        def labeler(i):
            f"CHART {i + 1} ({' | '.join(cfg)})"
        recs |= draco_rec_compute(data, specs=spec, num_chart=num, labeler=labeler,Debug=True)
        #print(recs)
    return recs

#%%
with open(file_path, 'r') as file:
    data = json.load(file)
    recommendations = rec_from_generated_spec(data,
        marks=["point", "bar", "line", "rect"],
        fields=["timestamp", "team", "type_name"],
        encoding_channels=["color", "shape", "size"],
        draco=d,
    )

#%%
display_debug_data(draco=d, specs=recommendations)
#%%Adjusting the Knowledge Base
########################################################
#Now creating the constraint 

def draco_with_updated_kb( pref_weight: int) -> draco.Draco:
    # Custom soft constraint to discourage faceting with rect mark and color encoding
    rect_color_facet_pref = """
    % @soft(rect_color_facet) Faceting with rect mark and color encoding.
    preference(rect_color_facet,Fa) :-
        attribute((mark,type),_,rect),
        attribute((encoding,channel),_,color),
        attribute((facet,channel),Fa,_).
    """.strip()
    rect_color_facet_pref_weight = pref_weight

    # Update the default soft constraint knowledge base (program)
    soft_updated = draco.Draco().soft + f"\n\n{rect_color_facet_pref}\n\n"
    # Assign the weight to the new soft constraint
    weights_updated = draco.Draco().weights | {
        "rect_color_facet_weight": rect_color_facet_pref_weight
    }
    return draco.Draco(soft=soft_updated, weights=weights_updated)

#%% Verifying That the Knowledge Base Got Updated

weight = 0
display(f"**Weight for `rect_color_facet` preference: {weight}**")
#updated_draco = draco_with_updated_kb(constraint_label="rect_color_facet",pref_weight=weight,new_soft_constraint=rect_color_facet_pref)
updated_draco = draco_with_updated_kb(pref_weight=weight)
recommendations = rec_from_generated_spec(data,
    marks=["rect"],
    fields=["timestamp", "team"],
    encoding_channels=["color"],
    draco=updated_draco,
)
display_debug_data(draco=updated_draco, specs=recommendations)


#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
##Trying out new constraints

def draco_add_soft_constraint(drc: draco.Draco,
    new_constraints: list[tuple[str, int, str]]
) -> draco.Draco:
    """
    Update Draco with new soft constraints.

    Parameters:
    - new_constraints: List of tuples (constraint_name, weight, constraint_str)

    Returns:
    - draco.Draco object with updated soft program and weights
    """
    
    soft_updated = drc.soft
    weights_updated = drc.weights.copy()

    for name, weight, constraint_str in new_constraints:
        constraint_str = constraint_str.strip()
        # Prepend metadata comment
        annotated = f"% @soft({name})\n{constraint_str}"
        soft_updated += f"\n\n{annotated}"
        weights_updated[f"{name}_weight"] = weight
        print(annotated)
        print(soft_updated)
        print(weights_updated)

    return draco.Draco(soft=soft_updated, weights=weights_updated)


#%%

# Soft constraints to guide better visualizations
constraints = [
    (
        "avoid_high_cardinality_color", 10,
        """
        preference(avoid_high_cardinality_color, E) :-
            entity(encoding, _, E),
            attribute((encoding,channel), E, color),
            attribute((encoding,field), E, F),
            attribute((field,type), F, string),
            attribute((field,unique), F, U), U > 20.
        """
    ),
    (
        "prefer_temporal_on_x", 8,
        """
        preference(prefer_temporal_on_x, E) :-
            entity(encoding, _, E),
            attribute((encoding,channel), E, x),
            attribute((encoding,field), E, F),
            attribute((field,name), F, "timestamp").
        """
    ),
    (
        "avoid_id_in_encoding", 9,
        """
        preference(avoid_id_in_encoding, E) :-
            entity(encoding, _, E),
            attribute((encoding,field), E, F),
            attribute((field,name), F, "id").
        """
    ),
    (
        "prefer_high_std_on_y", 6,
        """
        preference(prefer_high_std_on_y, E) :-
            entity(encoding, _, E),
            attribute((encoding,channel), E, y),
            attribute((encoding,field), E, F),
            attribute((field,std), F, S), S > 5.
        """
    )
]

irrelevant_constraints = [
    (
        "avoid_id_field", 10,
        """
        preference(avoid_id_field, E) :-
            entity(encoding, _, E),
            attribute((encoding,field), E, F),
            attribute((field,name), F, "id").
        """
    ),
    (
        "avoid_index_field", 1000,
        """
        preference(avoid_index_field, E) :-
            entity(encoding, _, E),
            attribute((encoding,field), E, F),
            attribute((field,name), F, "index").
        """
    ),
    (
        "avoid_timestamp_field", 10,
        """
        preference(avoid_timestamp_field, E) :-
            entity(encoding, _, E),
            attribute((encoding,field), E, F),
            attribute((field,name), F, "timestamp").
        """
    ),
    (
        "avoid_play_pattern_field", 7,
        """
        preference(avoid_play_pattern_field, E) :-
            entity(encoding, _, E),
            attribute((encoding,field), E, F),
            attribute((field,name), F, "play_pattern").
        """
    )
    # Add more fields similarly...
]




# Generate new Draco instance with these soft constraints
custom_draco = draco_add_soft_constraint(d,irrelevant_constraints)
#%%
recommendations = rec_from_generated_spec(data,
    marks=["rect"],
    fields=["timestamp", "id"],
    encoding_channels=["color"],
    draco=updated_draco,
)
display_debug_data(draco=custom_draco, specs=recommendations)
