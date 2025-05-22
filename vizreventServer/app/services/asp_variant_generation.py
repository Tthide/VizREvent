
def generate_asp_variants(spec: dict, base: list[str]) -> list[list[str]]:
    variants = []

    #print("\ncurrent spec:",spec)

    #extracting properties from the current selected spec
    mark = spec.get("mark", {}).get("type") or spec.get("spec", {}).get("mark", {}).get("type")
    encoding = spec.get("encoding") or spec.get("spec", {}).get("encoding", {})
    
    used_fields = {enc.get("field") for enc in encoding.values() if enc.get("field")}

    #print("\ncurrent spec fields:",used_fields)
    #print("\ncurrent spec encoding:",encoding.items())
    for channel, enc in encoding.items():
        field = enc.get("field")
        aggregate = enc.get("aggregate")
        binning = enc.get("bin")
        stack = enc.get("stack")

        if not field:
            continue

        # Variant: Remove this encoding (drop field)
        clauses = []
        if mark:
            clauses.append(f"attribute((mark,type),m0,{mark}).")
        if channel:
            clauses.append(f":- attribute((encoding,channel),_,{channel}).")
        if aggregate:
            clauses.append(f":- attribute((encoding,aggregate),e0,{aggregate}).")
        if binning:
            bin_clause = f":- attribute((encoding,binning),e0,{binning if isinstance(binning, bool) else '1'})."
            clauses.append(bin_clause)
        if stack:
            clauses.append(f":- attribute((encoding,stack),e0,{stack}).")
        variants.append((f"keep_mark_&_remove_{channel}", base + clauses))

        # Variant: Change mark type
        for alt_mark in ["bar", "line", "point", "area", "tick","rect"]:
            if mark and alt_mark != mark:
                clauses = [f"attribute((mark,type),m0,{alt_mark}).", "entity(encoding,m0,e0)."]
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")
                variants.append((f"change_mark_to_{alt_mark}", base + clauses))

        # Variant: Swap x/y channel
        if channel == "x" or channel == "y":
            swapped = "y" if channel == "x" else "x"
            clauses = []
            if mark:
                clauses.append(f"attribute((mark,type),m0,{mark}).")
            clauses.append(f"attribute((encoding,channel),e0,{swapped}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            variants.append((f"swap_{channel}_to_{swapped}", base + clauses))

        # Variant: Add binning if not present
        if not binning:
            clauses = []
            clauses.append(f"attribute((encoding,channel),e0,{channel}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            clauses.append("attribute((encoding,binning),e0,true).")
            variants.append((f"add_binning_{channel}", base + clauses))

        # Variant: Add aggregation if not present
        if not aggregate:
            for agg in [#"mean",
                        #"sum",
                        "count",
                        #"min",
                        #"max"
                        ]:
                clauses = []
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")
                clauses.append(f"attribute((encoding,aggregate),e0,{agg}).")
                variants.append((f"add_agg_{agg}_{channel}", base + clauses))

    # Variant: Add additional encoding using existing fields
    for channel in ["color", "size", "shape"]:
        for field in used_fields:
            clauses = []
            if mark:
                clauses.append(f"attribute((mark,type),m0,{mark}).")
            clauses.append(f"attribute((encoding,channel),e0,{channel}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            variants.append((f"add_{channel}_{field}", base + clauses))

    # Variant: Explore unused fields in a new encoding
    for field in used_fields:
        clauses = []
        if mark:
            clauses.append(f"attribute((mark,type),m0,{mark}).")
        clauses.append(f":- attribute((encoding,field),_,{field}).")
        variants.append((f"explore_other_fields_than_{field}", base + clauses))


    # Deduplicate variants
    # Use tuple of sorted clauses to ensure uniqueness
    unique = {tuple(sorted(v[1])): v for v in variants}
    return list(unique.values())
