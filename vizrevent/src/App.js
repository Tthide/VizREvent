import React from 'react';
import { useStore } from './Store/VizreventStore';
import DSController from './DS/DSController';
import RECController from './REC/RECController';
import VPController from './VP/VPController';

function App() {
  const { state, setRecSettings, setVizParam, setDataset, setInputViz } = useStore();

  const handleUpdate = () => {
    setRecSettings({ key: 'value' });
    setVizParam({ param: 'value' });
    setDataset('link_or_direct_dataset');
    setInputViz({ input: 'value' });
  };

  return (
    <>
      <div>
        <button onClick={handleUpdate}>Update Store</button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
      <div>
        <DSController />
        <RECController/>
        <VPController/>
      </div>
    </>
  );
};

export default App;
