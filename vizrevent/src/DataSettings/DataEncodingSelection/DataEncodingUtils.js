
export const MARK_OPTIONS = [
    { value: '', label: 'Select a Mark' },
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'point', label: 'Point' },
    { value: 'area', label: 'Area' },
    { value: 'tick', label: 'Tick' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
];

export const PROPERTY_CHANNELS = ['color', 'opacity', 'fillOpacity', 'size', 'angle', 'shape', 'facet'];

// Define available operations (type indicates grouping: 'aggregate', 'bin', or 'none')
export const OPERATION_OPTIONS = [
    { type: 'bin', param: 'true' },
    // Aggregation operations
    ...[
        'count', 'valid', 'missing', 'distinct', 'sum', 'product',
        'mean', 'average', 'variance', 'variancep', 'stdev', 'stdevp',
        'stderr', 'median', 'q1', 'q3', 'ci0', 'ci1', 'min', 'max'
    ].map(param => ({ type: 'aggregate', param }))
];


export const convertTypeFormat = (type) => {
    return (
        {
            number: 'quantitative',
            datetime: 'temporal',
            string: 'nominal',
        }[type]
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

    if (!spec) return resetEncodingLocal();

    setMark(spec.mark || null);
    if (!spec.encoding) return;
    const enc = spec.encoding;

    const newSelectedField = [];
    if (enc.x && enc.x.field) {
        const found = dataFields.find(f => f.name === enc.x.field);
        setXField(found || { name: enc.x.field, type: 'unknown' });
        //adding new datafield to selectedField list
        if (!selectedFields.includes(found)) {
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

    if (enc.y && enc.y.field) {
        const found = dataFields.find(f => f.name === enc.y.field);
        setYField(found || { name: enc.y.field, type: 'unknown' });
        //adding new datafield to selectedField list
        if (!selectedFields.includes(found)) {
            newSelectedField.push(found);
        }

        if (enc.y.bin) {
            setYAgr(OPERATION_OPTIONS.find(op => op.type === "bin"));
        }
        else if (enc.y.aggregate) {
            setYAgr(OPERATION_OPTIONS.find(op => op.type === "aggregate" && enc.x.aggregate === op.param));
        }
        else {
            setYAgr({});
        }

    } else setYField({});

    const otherProps = [];
    Object.entries(enc).forEach(([channel, specObj]) => {
        if (channel !== 'x' && channel !== 'y' && specObj && specObj.field) {
            otherProps.push({ channel, field: specObj.field });


        }
    });
    setEncodingProperties([...otherProps, {}]);

    //uploading all new selectedFields all at once
    setSelectedFields([...selectedFields, ...newSelectedField])
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
        newSpec.encoding.x["type"] = convertTypeFormat(xField.type);
    };
    if (yField.name) {
        newSpec.encoding.y["field"] = yField.name;
        newSpec.encoding.y["type"] = convertTypeFormat(yField.type);
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
        "config": { "view": { "continuousHeight": 300, "continuousWidth": 300 } },
        "data": { "name": "dataset" }
    };

    return { ...defaultSpec, ...newSpec };
};
