import React, { useEffect, useState } from 'react';

const MARK_OPTIONS = [
    { value: '', label: 'Select a Mark' },
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'point', label: 'Point' },
    { value: 'area', label: 'Area' },
    { value: 'tick', label: 'Tick' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
];


const PROPERTY_CHANNELS = [
    'color', 'opacity', 'fillOpacity', 'size', 'angle', 'shape', 'facet'
];

const DataEncodingSelection = ({ selectedFields, handleEncodingChange, hasSelectedViz }) => {
    const [mark, setMark] = useState(null);
    const [xField, setXField] = useState({});
    const [yField, setYField] = useState({});
    const [encodingProperties, setEncodingProperties] = useState([{ channel: '', field: '' }]);

    //Draco and Vega-lite don't exactly use the same type format for their data, thus we need to convert it
    function convertTypeFormat(measurementType) {
        const typeMapping = {
            "number": "quantitative",
            "datetime": "temporal",
            "string": "nominal"  // Assuming nominal data is represented as strings
        };

        return typeMapping[measurementType] || "unknown";
    }
    //dispatching new selected properties on update
    useEffect(() => {

        //building the spec 
        let newSpec = {
            "mark": {},
            "encoding": {}
        };
        if (mark) {
            newSpec.mark = mark
        }
        if (Object.keys(xField).length > 0) {
            //here could add additional properties like aggregate or others
            const xType = convertTypeFormat(xField.type)
            newSpec.encoding["x"] = {
                "field": xField.name,
                "type": xType
            }
        }
        if (Object.keys(yField).length > 0) {
            //here could add additional properties like aggregate or others
            const yType = convertTypeFormat(yField.type);
            newSpec.encoding["y"] = {
                "field": yField.name,
                "type": yType
            };
        }
        if (Object.keys(encodingProperties).length > 0) {
            //here could add additional properties like aggregate or others
            encodingProperties.forEach(property => {
                if (Object.keys(property).length > 0) {
                    newSpec.encoding[property.channel] = {"field":property.field};
                }
            });
        }
        console.log("newSpec:", newSpec)
    }, [mark, xField, yField, encodingProperties]);

    const handleSelectChange = (type, value) => {
        const selectedField = selectedFields.find(f => f.name === value);
        if (type === 'x') {
            setXField(selectedField || {});
        } else if (type === 'y') {
            setYField(selectedField || {});
        } else if (type === 'mark') {
            setMark(value);
        }
    };

    const handlePropertyChange = (index, key, value) => {

        console.log({ index, key, value })
        const updated = [...encodingProperties];
        updated[index][key] = value;
        setEncodingProperties(updated);

        // Add new selector if the last one is fully filled
        const last = updated[updated.length - 1];
        if (last.channel && last.field && updated.length === index + 1) {
            setEncodingProperties([...updated, {}]);
        }
    };


    if (!hasSelectedViz) {
        return (
            <div >
                <p>Visualization type not selected</p>
                <p>Please choose a visualization type before encoding data.</p>
            </div>
        );
    }



    return (
        <div>
            {/* Mark Selector */}
            <div >
                <span >Mark</span>
                <select
                    onChange={(e) => handleSelectChange('mark', e.target.value)}
                >
                    {MARK_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* X-Axis Selector */}
            <div>
                <span>X Axis</span>
                <select
                    onChange={(e) => handleSelectChange('x', e.target.value)}
                >
                    <option value="">Select a Field</option>
                    {selectedFields.map((field) => (
                        <option key={field.name} value={field.name}>
                            {field.name} ({convertTypeFormat(field.type)})
                        </option>
                    ))}
                </select>
            </div>

            {/* Y-Axis Selector */}
            <div>
                <span>Y Axis</span>
                <select
                    onChange={(e) => handleSelectChange('y', e.target.value)}
                >
                    <option value="">Select a Field</option>
                    {selectedFields.map((field) => (
                        <option key={field.name} value={field.name}>
                            {field.name} ({convertTypeFormat(field.type)})
                        </option>
                    ))}
                </select>
            </div>

            {/* Additional Property Channels */}
            {encodingProperties.map((enc, idx) => (
                <div
                    key={idx}
                >
                    <select
                        onChange={(e) => handlePropertyChange(idx, 'channel', e.target.value)}
                    >
                        <option value="">Select Property Channel</option>
                        {PROPERTY_CHANNELS.map((ch) => (
                            <option key={ch} value={ch}>{ch}</option>
                        ))}
                    </select>

                    <select
                        onChange={(e) => handlePropertyChange(idx, 'field', e.target.value)}
                    >
                        <option value="">Select Field</option>
                        {selectedFields.map((field) => (
                            <option key={field.name} value={field.name}>
                                {field.name} ({convertTypeFormat(field.type)})
                            </option>
                        ))}
                    </select>
                </div>
            ))}
            <pre>DSControllerPseudoState:{JSON.stringify({ mark, xField, yField, encodingProperties }, null, 2)}</pre>

        </div>
    );
};


export default DataEncodingSelection;
