export const MARK_OPTIONS = [
    { value: '', label: 'Select a Mark' },
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'point', label: 'Point' },
    { value: 'area', label: 'Area' },
    { value: 'tick', label: 'Tick' },
    { value: 'rect', label: 'Rect' },
];

export const PROPERTY_CHANNELS = ['color', 'opacity', 'fillOpacity', 'size', 'angle', 'shape', 'facet'];

// Define available operations (type indicates grouping: 'aggregate', 'bin', or 'none')
export const OPERATION_OPTIONS = [
    { type: 'bin', param: 'true' },
    // Aggregation operations
    ...[
        'count', 'sum', 'product',
        'mean', 'variance', 'stdev',
        'median', 'min', 'max'
    ].map(param => ({ type: 'aggregate', param }))
];


export const convertTypeFormat = (field) => {
    //some fields are exceptions in terms of their type, therefore we include them here

    const exceptions = { period: 'ordinal' };
    if (field.name in exceptions) return exceptions[field.name];
    return (
        {
            number: 'quantitative',
            datetime: 'temporal',
            string: 'nominal',
        }[field.type]
        || 'unknown');
};


/**
 * Parse a complete spec object into local encoding state.
 * Handles mark, x/y channels, and any additional property channels.
 */
export const parseSpec = (spec, dataFields, selectedFields, encodingStateSetters) => {

    const {
        setMark,
        setXField,
        setYField,
        setXAgr,
        setYAgr,
        setEncodingProperties,
        setSelectedFields,
        resetEncodingLocal
    } = encodingStateSetters;
    //resetting local encoding just to be sure
    resetEncodingLocal();
    if (!spec) return;

    const otherProps = [];
    const newSelectedField = [];


    //when there is facets in a vega lite spec, the json layout changes
    //we need to take that into account
    if (spec.facet) {
        // Handle facets by extracting them and replacing spec
        if (spec.facet) {
            ['column', 'row'].forEach(channel => {
                const facetSpec = spec.facet[channel];
                if (facetSpec && facetSpec.field) {
                    const found = dataFields.find(f => f.name === facetSpec.field);
                    if (found) {
                        newSelectedField.push(found);
                    }
                    otherProps.push({
                        channel: "facet",
                        field: facetSpec.field,
                        aggregate: facetSpec.aggregate || null,
                        bin: facetSpec.bin || null,
                        type: facetSpec.type || null
                    });

                }
            });
        }
        //readjusting the spec as if there was no facet
        spec = spec.spec;

    }

    setMark(spec.mark || null);
    if (!spec.encoding) return;
    const enc = spec.encoding;


    if (enc.x) {
        let found = null;
        if (enc.x.field) {
            found = dataFields.find(f => f.name === enc.x.field);
            setXField(found || { name: enc.x.field, type: 'unknown' });
        }
        //adding new datafield to selectedField list
        if (found) {
            newSelectedField.push(found);
        }

        if (enc.x.bin) {
            setXAgr(OPERATION_OPTIONS.find(op => op.type === "bin"));

        }
        else if (enc.x.aggregate) {
            setXAgr(OPERATION_OPTIONS.find(op => op.type === "aggregate" && enc.x.aggregate === op.param));

        }
        else {
            setXAgr({});
        }



    }
    else setXField({});

    if (enc.y) {
        let found = null;
        if (enc.y.field) {
            found = dataFields.find(f => f.name === enc.y.field);
            setYField(found || { name: enc.y.field, type: 'unknown' });
        }
        //adding new datafield to selectedField list
        if (found) {
            newSelectedField.push(found);
        }

        if (enc.y.bin) {
            setYAgr(OPERATION_OPTIONS.find(op => op.type === "bin"));
        }
        else if (enc.y.aggregate) {
            setYAgr(OPERATION_OPTIONS.find(op => op.type === "aggregate" && enc.y.aggregate === op.param));
        }
        else {
            setYAgr({});
        }

    } else setYField({});



    Object.entries(enc).forEach(([channel, specObj]) => {
        if (channel !== 'x' && channel !== 'y' && specObj) {
            if (PROPERTY_CHANNELS.includes(channel)) {
                if (specObj.field !== undefined) {
                    newSelectedField.push(dataFields.find(f => f.name === specObj.field));
                }
                otherProps.push({
                    channel,
                    field: specObj.field || null,
                    aggregate: specObj.aggregate || null,
                    bin: specObj.bin || null,
                    type: specObj.type || null
                });
            }
        }
    });
    setEncodingProperties([...otherProps, {}]);

    //uploading all new selectedFields all at once
    setSelectedFields([...newSelectedField])
};





/**
 * Convert state Visualization Encoder to new vega-lite spec and returns it.
 */
export const buildNewSpec = (hasSelectedViz, { mark, xField, yField, xAgr, yAgr, encodingProperties }) => {

    if (!hasSelectedViz) return;

    const newSpec = {
        mark,
        encoding: {
            x: {},
            y: {}
        },
    };

    if (xField.name) {
        newSpec.encoding.x["field"] = xField.name;
        newSpec.encoding.x["type"] = convertTypeFormat(xField);
    };
    if (yField.name) {
        newSpec.encoding.y["field"] = yField.name;
        newSpec.encoding.y["type"] = convertTypeFormat(yField);
    };

    //in vega-lite, if an aggregate method is used, there must not be a type property, so we remove it 
    if (Object.keys(xAgr).length > 0 && xAgr.type !== "none") {
        newSpec.encoding.x[xAgr.type] = xAgr.param;

    }

    if (Object.keys(yAgr).length > 0 && yAgr.type !== "none") {
        newSpec.encoding.y[yAgr.type] = yAgr.param;

    }
    encodingProperties.forEach(p => {
        if (p.channel && (p.field || p.aggregate || p.bin)) {
            newSpec.encoding[p.channel] = {
                ...(p.field && { field: p.field }),
                ...(p.aggregate && { aggregate: p.aggregate }),
                ...(p.bin && { bin: p.bin })
            };
        }
    });

    const defaultSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json",
        "data": { "name": "dataset" }
    };

    return { ...defaultSpec, ...newSpec };
};
