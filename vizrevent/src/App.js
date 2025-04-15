import React from 'react';
import { useStoreSelector } from './Store/VizreventStore';
import DSController from './DataSettings/DSController';
import RECController from './RECommender/RECController';
import VPController from './ViewPanel/VPController';

function App() {
  const { state, dispatch } = useStoreSelector();
  //console.log("useStoreSelector output:"+useStoreSelector());
  //console.log("useStoreSelector output:"+useStoreSelector());

  const handleUpdate = () => {
    dispatch.setRecSettings({ key: 'value' });
    dispatch.setVizParam({ param: 'value' });
    dispatch.setDataset('link_or_direct_dataset');
    dispatch.setInputViz({ input: 'value' });
  };

  return (
    <>
      <div>
        <button onClick={handleUpdate}>Reset Store</button>
        <pre>{JSON.stringify(state, null, 4)}</pre>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <DSController />
        </div>
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <RECController />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <VPController />
        </div>
      </div>

    </>
  );
};

export default App;
