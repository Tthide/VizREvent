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
        variants.append((f"Remove channel {channel}", base + clauses))

        # Variant: Change mark type
        for alt_mark in ["bar", "line", "point", "area", "tick", "rect"]:
            if mark and alt_mark != mark:
                clauses = [f"attribute((mark,type),m0,{alt_mark})."]
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")
                variants.append((f"Change mark to {alt_mark}", base + clauses))

        # Variant: Swap x/y channel
        if channel == "x" or channel == "y":
            swapped = "y" if channel == "x" else "x"
            clauses = []
            if mark:
                clauses.append(f"attribute((mark,type),m0,{mark}).")
            clauses.append(f"attribute((encoding,channel),e0,{swapped}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            variants.append((f"Swap {channel.upper()} to {swapped.upper()}", base + clauses))

        # Variant: Add binning if not present
        if not binning:
            clauses = []
            clauses.append(f"attribute((encoding,channel),e0,{channel}).")
            clauses.append(f"attribute((encoding,field),e0,{field}).")
            clauses.append("attribute((encoding,binning),e0,true).")
            variants.append((f"Add binning to {channel}", base + clauses))

        # Variant: Add aggregation if not present
        if not aggregate:
            for agg in ["count"]:
                clauses = []
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")
                clauses.append(f"attribute((encoding,aggregate),e0,{agg}).")
                variants.append((f"Aggregate using count on {channel}", base + clauses))

        # Variant: Add additional encoding using existing fields
        for alt_channel in ["color", "size", "shape"]:
            for used_field in used_fields:
                clauses = ["entity(encoding,m0,e1)."]
                if mark:
                    clauses.append(f"attribute((mark,type),m0,{mark}).")
                clauses.append(f"attribute((encoding,channel),e0,{channel}).")
                clauses.append(f"attribute((encoding,field),e0,{field}).")

                clauses.append(f"attribute((encoding,channel),e1,{alt_channel}).")
                variants.append((f"Add {alt_channel} encoding for {used_field}", base + clauses))

    # Variant: Explore unused fields in a new encoding
    for field in used_fields:
        clauses = []
        if mark:
            clauses.append(f"attribute((mark,type),m0,{mark}).")
        clauses.append(f":- attribute((encoding,field),_,{field}).")
        variants.append((f"Explore fields excluding {field}", base + clauses))

    # Deduplicate variants
    # Use tuple of sorted clauses to ensure uniqueness
    print("before sorting asp gen", len(variants))
    unique = {tuple(sorted(v[1])): v for v in variants}
    print("after sorting asp gen", len(unique))

    return list(unique.values())
