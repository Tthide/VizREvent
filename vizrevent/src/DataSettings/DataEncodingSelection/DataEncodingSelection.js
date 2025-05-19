import React from 'react';
import { MARK_OPTIONS, PROPERTY_CHANNELS, OPERATION_OPTIONS, convertTypeFormat } from './DataEncodingUtils'
import './DataEncodingSelection.scss'

const DataEncodingSelection = ({ dataEncodingState, onEncodingChange, hasSelectedViz }) => {

  const { dataFields, selectedFields, mark, xField, yField, xAgr, yAgr, encodingProperties } = dataEncodingState;


  const handleDropdownChange = (category, payload) => {
    onEncodingChange(category, payload);
  };
  const handleDeleteProperty = (index) => {
    onEncodingChange('deleteProperty', index);
  };


  // Helper to render field options
  const renderFieldOptions = () => [
    <option key="" value="">No specific Field</option>,
    ...[
      ...selectedFields,
      ...dataFields.filter(f => !selectedFields.find(sf => sf.name === f.name))
    ].map(f => (
      <option
        key={f.name}
        value={f.name}
        className={selectedFields.find(sf => sf.name === f.name) ? 'option-selected' : ''}
      >
        {f.name} ({convertTypeFormat(f)})
      </option>
    ))
  ];

  // Render fallback
  if (!hasSelectedViz) return (
    <div className="data-encoding-selection">

        <p className="fallback-message">Please choose a visualization instance to encode data.</p>

    </div>

  );

  // Main render: dropdowns for mark, x, y, and additional properties
  return (
    <div className="data-encoding-selection">
      {/* Mark selector */}
      <div className="form-group">
        <span className="label">Mark</span>
        <div className="form-group-input">
          <select
            className="select"
            value={(mark && (mark.type ? mark.type : mark)) || ''}
            onChange={e => handleDropdownChange('mark', { type: e.target.value })}
          >
            {MARK_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* X-axis selector and aggregation */}
      <div className="form-group">
        <span className="label">X Axis</span>
        <div className="form-group-input">
          <select
            className="select"
            value={xField.name || ''}
            onChange={e => handleDropdownChange('x', e.target.value)}
          >
            {renderFieldOptions()}
          </select>
          <select
            className="select"
            value={JSON.stringify(xAgr) || 'none'}
            onChange={e => handleDropdownChange('xAgr', e.target.value)}
          >
            <option value="">Select Aggregation/Bin method</option>
            {OPERATION_OPTIONS.map(op => (
              <option key={op.param} value={JSON.stringify(op)}>{op.type}:{op.param}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Y-axis selector and aggregation */}
      <div className="form-group">
        <span className="label">Y Axis</span>
        <div className="form-group-input">
          <select
            className="select"
            value={yField.name || ''}
            onChange={e => handleDropdownChange('y', e.target.value)}
          >
            {renderFieldOptions()}
          </select>
          <select
            className="select"
            value={JSON.stringify(yAgr) || 'none'}
            onChange={e => handleDropdownChange('yAgr', e.target.value)}
          >
            <option value="">Select Aggregation/Bin method</option>
            {OPERATION_OPTIONS.map(op => (
              <option key={op.param} value={JSON.stringify(op)}>{op.type}:{op.param}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <span className="label">Additional encoding properties</span>
        <div className="additional-property">
          {/* Additional property channels */}
          {encodingProperties.map((enc, i) => (
            <div key={i}>
              <div className="form-group-input">
                <select
                  className="select"
                  value={enc.channel || ''}
                  onChange={e => handleDropdownChange('property', { index: i, key: 'channel', value: e.target.value })}
                >
                  <option value="">Select Property Channel</option>
                  {PROPERTY_CHANNELS.map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>

                {enc.channel && (
                  <>
                    <select
                      className="select"
                      value={enc.field || ''}
                      onChange={e => handleDropdownChange('property', { index: i, key: 'field', value: e.target.value })}
                    >
                      {renderFieldOptions()}
                    </select>
                    <select
                      className="select"
                      value={enc.aggregate || ''}
                      onChange={e => handleDropdownChange('property', { index: i, key: 'aggregate', value: e.target.value })}
                    >
                      <option value="">Select Aggregation/Bin method</option>
                      {OPERATION_OPTIONS.map(op => (
                        <option key={op.param} value={op.param}>{op.type}:{op.param}</option>
                      ))}
                    </select>
                  </>
                )}
                {encodingProperties.length - 1 > i && enc.channel && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteProperty(i)}
                  >
                    Delete
                  </button>
                )}
              </div>


            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


export default DataEncodingSelection;