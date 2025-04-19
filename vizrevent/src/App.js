import React from 'react';
import { useStoreSelector } from './Store/VizreventStore';
import DSController from './DataSettings/DSController';
import RECController from './RECommender/RECController';
import VPController from './ViewPanel/VPController';


function App() {
  const { state, dispatch } = useStoreSelector();
  //console.log("useStoreSelector output:"+useStoreSelector());
  //console.log("useStoreSelector output:"+useStoreSelector());

  const handleStoreReset = () => {
    dispatch.setRecSettings(null);
    dispatch.setVizParam(null);
    dispatch.setDataset(null);
    dispatch.setInputViz(null);
    dispatch.setSelectedViz(null);
  };

  return (
    <>
      <div>
        <button onClick={handleStoreReset}>Reset Store</button>
        <p>{JSON.stringify(state, null, 5)}</p>
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
