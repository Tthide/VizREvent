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

const DataEncodingSelection = ({ selectedFields, currentSpec, handleEncodingChange, hasSelectedViz }) => {
    const [mark, setMark] = useState(null);
    const [xField, setXField] = useState({});
    const [yField, setYField] = useState({});
    const [encodingProperties, setEncodingProperties] = useState([{}]);

    //Draco and Vega-lite don't exactly use the same type format for their data, thus we need to convert it
    function convertTypeFormat(measurementType) {
        const typeMapping = {
            "number": "quantitative",
            "datetime": "temporal",
            "string": "nominal"  // Assuming nominal data is represented as strings
        };

        return typeMapping[measurementType] || "unknown";
    }

    //if no fields are selected, we reset the state
    useEffect(() => {
        if (selectedFields.length === 0) {
            setMark(null);
            setXField({});
            setYField({});
            setEncodingProperties([{}]);

        }
    }, [selectedFields])

    // parse incoming currentSpec to update local state
    useEffect(() => {
        if (!currentSpec || !currentSpec.encoding) return;

        // mark
        if (currentSpec.mark) {
            setMark(currentSpec.mark);
        } else {
            setMark(null);
        }

        // encoding.x
        const enc = currentSpec.encoding;
        if (enc.x) {
            const name = enc.x.field;
            const fieldObj = selectedFields.find(f => f.name === name) || { name, type: 'unknown' };
            setXField(fieldObj);
        } else {
            setXField({});
        }

        // encoding.y
        if (enc.y) {
            const name = enc.y.field;
            const fieldObj = selectedFields.find(f => f.name === name) || { name, type: 'unknown' };
            setYField(fieldObj);
        } else {
            setYField({});
        }

        // other encoding properties
        const otherProps = [];
        Object.entries(enc).forEach(([channel, spec]) => {
            if (['x', 'y'].includes(channel)) return;
            if (spec.field) {
                otherProps.push({ channel, field: spec.field });
            }
        });
        // always keep an empty row for new property
        setEncodingProperties([...otherProps, {}]);
    }, [currentSpec]);


  // Helper to build and dispatch spec
  const buildAndDispatch = (newMark, newX, newY, newProps) => {

    //building new spec
    if (!hasSelectedViz || selectedFields.length === 0) return;

    const newSpec = { mark: newMark || undefined, encoding: {} };

    if (newX.name) newSpec.encoding.x = { field: newX.name, type: convertTypeFormat(newX.type) };

    if (newY.name) newSpec.encoding.y = { field: newY.name, type: convertTypeFormat(newY.type) };

    newProps.forEach(p => {
      if (p.channel && p.field) newSpec.encoding[p.channel] = { field: p.field };
    });

    //dispatching newSpec to DSController
    handleEncodingChange(newSpec);
  };

  const handleSelectChange = (type, value) => {
    const selectedField = selectedFields.find(f => f.name === value) || {};
    if (type === 'mark') {
      setMark(value || null);
      buildAndDispatch(value || null, xField, yField, encodingProperties);
    } else if (type === 'x') {
      setXField(selectedField);
      buildAndDispatch(mark, selectedField, yField, encodingProperties);
    } else if (type === 'y') {
      setYField(selectedField);
      buildAndDispatch(mark, xField, selectedField, encodingProperties);
    }
  };

  const handlePropertyChange = (index, key, value) => {
    const updated = [...encodingProperties];
    updated[index] = { ...updated[index], [key]: value };
    setEncodingProperties(updated);
    // if last row filled, append new empty row
    const last = updated[updated.length - 1];
    if (last.channel && last.field) setEncodingProperties([...updated, {}]);
    buildAndDispatch(mark, xField, yField, updated);
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
            <div>
                <span>Mark</span>
                <select value={mark || ''} onChange={e => handleSelectChange('mark', e.target.value)}>
                    {MARK_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* X-Axis Selector */}
            <div>
                <span>X Axis</span>
                <select value={xField.name || ''} onChange={e => handleSelectChange('x', e.target.value)}>
                    <option value="">Select a Field</option>
                    {selectedFields.map(field => (
                        <option key={field.name} value={field.name}>{field.name} ({convertTypeFormat(field.type)})</option>
                    ))}
                </select>
            </div>

            {/* Y-Axis Selector */}
            <div>
                <span>Y Axis</span>
                <select value={yField.name || ''} onChange={e => handleSelectChange('y', e.target.value)}>
                    <option value="">Select a Field</option>
                    {selectedFields.map(field => (
                        <option key={field.name} value={field.name}>{field.name} ({convertTypeFormat(field.type)})</option>
                    ))}
                </select>
            </div>

            {/* Additional Property Channels */}
            {encodingProperties.map((enc, idx) => (
                <div key={idx}>
                    <select value={enc.channel || ''} onChange={e => handlePropertyChange(idx, 'channel', e.target.value)}>
                        <option value="">Select Property Channel</option>
                        {PROPERTY_CHANNELS.map(ch => (
                            <option key={ch} value={ch}>{ch}</option>
                        ))}
                    </select>

                    <select value={enc.field || ''} onChange={e => handlePropertyChange(idx, 'field', e.target.value)}>
                        <option value="">Select Field</option>
                        {selectedFields.map(field => (
                            <option key={field.name} value={field.name}>{field.name} ({convertTypeFormat(field.type)})</option>
                        ))}
                    </select>
                </div>
            ))}

            <pre>DSControllerPseudoState:{JSON.stringify({ mark, xField, yField, encodingProperties }, null, 2)}</pre>
        </div>
    );
};


export default DataEncodingSelection;
