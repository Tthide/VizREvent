import React from 'react';
import { useStoreSelector } from './Store/VizreventStore';
import DSController from './DS/DSController';
import RECController from './REC/RECController';
import VPController from './VP/VPController';

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
