
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
    }
    else setXField({});

    if (enc.y && enc.y.field) {
        const found = dataFields.find(f => f.name === enc.y.field);
        setYField(found || { name: enc.y.field, type: 'unknown' });
        //adding new datafield to selectedField list
        if (!selectedFields.includes(found)) {
            newSelectedField.push(found);

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
export const buildNewSpec = (hasSelectedViz, { mark, xField, yField, encodingProperties }) => {

    if (!hasSelectedViz) return;

    const newSpec = {
        mark: { type: mark } || undefined,
        encoding: {}
    };

    if (xField.name) newSpec.encoding.x = { field: xField.name, type: convertTypeFormat(xField.type) };
    if (yField.name) newSpec.encoding.y = { field: yField.name, type: convertTypeFormat(yField.type) };
    encodingProperties.forEach(p => {
        if (p.channel && p.field) newSpec.encoding[p.channel] = { field: p.field };
    });

    const defaultSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json",
        "config": { "view": { "continuousHeight": 300, "continuousWidth": 300 } },
        "data": { "name": "dataset" }
    };

    return { ...defaultSpec, ...newSpec };
};
