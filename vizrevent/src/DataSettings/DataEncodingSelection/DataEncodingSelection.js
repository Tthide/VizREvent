import React from 'react';
import { MARK_OPTIONS, PROPERTY_CHANNELS, convertTypeFormat } from './DataEncodingUtils'


const DataEncodingSelection = ({ dataEncodingState, onEncodingChange, hasSelectedViz }) => {

  const {dataFields,selectedFields,mark,xField,yField,encodingProperties}=dataEncodingState;


  const handleDropdownChange = (category, payload) => {
    onEncodingChange(category, payload);
  };

  // Render fallback
  if (!hasSelectedViz) return (
    <div>
      <p>Visualization type not selected</p>
      <p>Please choose a visualization type before encoding data.</p>
    </div>
  );

  // Main render: dropdowns for mark, x, y, and additional properties
  return (
    <div>
      {/* Mark selector */}
      <div>
        <span>Mark</span>
        <select value={mark ? (mark.type ? mark.type : mark) : ''} onChange={e => handleDropdownChange('mark', e.target.value)}>
          {MARK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* X-axis selector */}
      <div>
        <span>X Axis</span>
        <select value={xField.name || ''} onChange={e => handleDropdownChange('x', e.target.value)}>
          <option value="">No specific Field</option>
          {[
            ...selectedFields,
            ...dataFields.filter(f => !selectedFields.find(sf => sf.name === f.name))
          ].map(f => (
            <option
              key={f.name}
              value={f.name}
              style={selectedFields.find(sf => sf.name === f.name) ? { backgroundColor: '#d3f9d8' } : {}}>
              {f.name} ({convertTypeFormat(f.type)})
            </option>
          ))}
        </select>
      </div>

      {/* Y-axis selector */}
      <div>
        <span>Y Axis</span>
        <select value={yField.name || ''} onChange={e => handleDropdownChange('y', e.target.value)}>
          <option value="">No specific Field</option>
          {[
            ...selectedFields,
            ...dataFields.filter(f => !selectedFields.find(sf => sf.name === f.name))
          ].map(f => (
            <option
              key={f.name}
              value={f.name}
              style={selectedFields.find(sf => sf.name === f.name) ? { backgroundColor: '#d3f9d8' } : {}}>
              {f.name} ({convertTypeFormat(f.type)})
            </option>
          ))}
        </select>
      </div>
      {/* Additional property channels */}
      {encodingProperties.map((enc, i) => (
        <div key={i}>
          <select value={enc.channel || ''} onChange={e => handleDropdownChange('property', { index: i, key: 'channel', value: e.target.value })}>
            <option value="">Select Property Channel</option>
            {PROPERTY_CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
          </select>
          <select value={enc.field || ''} onChange={e => handleDropdownChange('property', { index: i, key: 'field', value: e.target.value })}>
            <option value="">No specific Field</option>
            {[
              ...selectedFields,
              ...dataFields.filter(f => !selectedFields.find(sf => sf.name === f.name))
            ].map(f => (
              <option
                key={f.name}
                value={f.name}
                style={selectedFields.find(sf => sf.name === f.name) ? { backgroundColor: '#d3f9d8' } : {}}>
                {f.name} ({convertTypeFormat(f.type)})
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* debug state preview */}
      <pre>DSControllerPseudoState:{JSON.stringify({ mark, xField, yField, encodingProperties }, null, 2)}</pre>
    </div>
  );
};

export default DataEncodingSelection;