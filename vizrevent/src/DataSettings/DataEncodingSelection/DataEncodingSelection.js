import React, { useEffect, useState, useRef } from 'react';

// Options for the chart mark type selector
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

// Channels available for additional encodings
const PROPERTY_CHANNELS = ['color', 'opacity', 'fillOpacity', 'size', 'angle', 'shape', 'facet'];

const DataEncodingSelection = ({ dataFields, selectedFields, currentSpec, handleEncodingChange, hasSelectedViz }) => {
  const [mark, setMark] = useState(null);
  const [xField, setXField] = useState({});
  const [yField, setYField] = useState({});
  const [encodingProperties, setEncodingProperties] = useState([{}]);
  // Buffer incoming spec updates until fields are loaded
  const [pendingSpec, setPendingSpec] = useState(null);

  // Flags to avoid parsing our own dispatched spec
  const skipParse = useRef(false);
  const prevSpec = useRef();

  // Map raw data types to Vega-Lite types
  const convertTypeFormat = (type) => ({ number: 'quantitative', datetime: 'temporal', string: 'nominal' }[type] || 'unknown');

  // Reset all local selections
  const resetLocal = () => {
    setMark(null);
    setXField({});
    setYField({});
    setEncodingProperties([{}]);
  };

  /**
   * Parse a complete spec object into our local state.
   * Handles mark, x/y channels, and any additional property channels.
   */
  const parseSpec = (spec) => {
    //if spec is empty, then we are facing a empty viz so we reset the local state
    if (!spec) {
      resetLocal();
      return;
    }

    //Mark
    setMark(spec.mark || null);

    //When building viz, we might leave one instance with just a mark value, but we could still want to
    //modify it later on, so we still allow the code to progress, at least to this point
    if(!spec.encoding) return;
    const enc = spec.encoding;

    // X field
    if (enc.x && enc.x.field) {
      const found = dataFields.find(f => f.name === enc.x.field);
      if (found) {
        setXField(found);
      } else {
        setXField({ name: enc.x.field, type: 'unknown' });
      }
    } else {
      setXField({});
    }

    // Y field
    if (enc.y && enc.y.field) {
      const found = dataFields.find(f => f.name === enc.y.field);
      if (found) {
        setYField(found);
      } else {
        setYField({ name: enc.y.field, type: 'unknown' });
      }
    } else {
      setYField({});
    }

    // Other property channels
    const otherProps = [];
    Object.entries(enc).forEach(([channel, specObj]) => {
      if (channel !== 'x' && channel !== 'y' && specObj && specObj.field) {
        otherProps.push({ channel, field: specObj.field });
      }
    });
    setEncodingProperties([...otherProps, {}]);
  };

  /**
   * Effect: queue up any external spec changes for later parsing.
   * We skip parsing when skipParse is true (i.e. our own dispatch).
   */
  useEffect(() => {
    if (skipParse.current) {
      skipParse.current = false;
      return;
    }
    //resetting if empty viz
    if(!currentSpec)return resetLocal();
    if (currentSpec !== prevSpec.current) {
      setPendingSpec(currentSpec);
      prevSpec.current = currentSpec;
    }
  }, [currentSpec]);

  /**
   * Effect: once we have both pendingSpec loaded,
   * and all required fields are available, parse the spec.
   */
  useEffect(() => {
    if (!pendingSpec) return;
    const enc = pendingSpec.encoding || {};
    const fieldsNeeded = Object.values(enc).map(sp => sp.field).filter(Boolean);
    const ready = fieldsNeeded.every(name => dataFields.some(sf => sf.name === name));
    if (ready) {
      parseSpec(pendingSpec);
      setPendingSpec(null);
    }
  }, [dataFields, pendingSpec]);

  /**
   * Build a new spec object from local state and dispatch it upstream.
   * Sets skipParse to avoid re-parsing our own update.
   */
  const buildAndDispatch = (newMark, newX, newY, newProps) => {
    //building new spec
    if (!hasSelectedViz) return;
    const spec = { mark: { "type": newMark } || undefined, encoding: {} };
    if (newX.name) spec.encoding.x = { field: newX.name, type: convertTypeFormat(newX.type) };
    if (newY.name) spec.encoding.y = { field: newY.name, type: convertTypeFormat(newY.type) };
    newProps.forEach(p => p.channel && p.field && (spec.encoding[p.channel] = { field: p.field }));
    skipParse.current = true;
    //dispatching it
    handleEncodingChange(spec);
  };

  /**
   * Unified change handler for mark, x, y, and property dropdowns.
   * Updates local state and then re-dispatches a new spec.
   */
  const handleChange = (category, payload) => {
    let nm = mark, nx = xField, ny = yField, np = [...encodingProperties];
    if (category === 'mark') {
      nm = payload;
      setMark(payload);
    }
    if (category === 'x') {
      nx = dataFields.find(f => f.name === payload) || {};
      setXField(nx);
    }
    if (category === 'y') {
      ny = dataFields.find(f => f.name === payload) || {};
      setYField(ny);
    }
    if (category === 'property') {
      const { index, key, value } = payload;
      np[index] = { ...np[index], [key]: value };
      // auto-add an empty row if the last one is filled
      const last = np[np.length - 1];
      if (last.channel && last.field) np = [...np, {}];
      setEncodingProperties(np);
    }
    buildAndDispatch(nm, nx, ny, np);
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
        <select value={mark ? (mark.type ? mark.type : mark) : ''} onChange={e => handleChange('mark', e.target.value)}>
          {MARK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* X-axis selector */}
      <div>
        <span>X Axis</span>
        <select value={xField.name || ''} onChange={e => handleChange('x', e.target.value)}>
          <option value="">No specific Field</option>
          {dataFields.map(f => <option key={f.name} value={f.name}>{f.name} ({convertTypeFormat(f.type)})</option>)}
        </select>
      </div>

      {/* Y-axis selector */}
      <div>
        <span>Y Axis</span>
        <select value={yField.name || ''} onChange={e => handleChange('y', e.target.value)}>
          <option value="">No specific Field</option>
          {dataFields.map(f => <option key={f.name} value={f.name}>{f.name} ({convertTypeFormat(f.type)})</option>)}
        </select>
      </div>

      {/* Additional property channels */}
      {encodingProperties.map((enc, i) => (
        <div key={i}>
          <select value={enc.channel || ''} onChange={e => handleChange('property', { index: i, key: 'channel', value: e.target.value })}>
            <option value="">Select Property Channel</option>
            {PROPERTY_CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
          </select>
          <select value={enc.field || ''} onChange={e => handleChange('property', { index: i, key: 'field', value: e.target.value })}>
            <option value="">No specific Field</option>
            {dataFields.map(f => <option key={f.name} value={f.name}>{f.name} ({convertTypeFormat(f.type)})</option>)}
          </select>
        </div>
      ))}

      {/* debug state preview */}
      <pre>DSControllerPseudoState:{JSON.stringify({ mark, xField, yField, encodingProperties }, null, 2)}</pre>
    </div>
  );
};

export default DataEncodingSelection;