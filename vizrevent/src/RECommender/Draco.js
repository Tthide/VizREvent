import React, { useEffect, useState } from 'react';
import DracoRecProcess from './DracoUtils'; // Adjust the path as needed
import { useStoreSelector } from '../Store/VizreventStore';

const DracoComponent = (props) => {

  //connecting to store
  const { state, dispatch } = useStoreSelector(state => ({
    dataset: state.dataset,
  }));


  const [solutionSet, setSolutionSet] = useState(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    setStatus('Processing...');
    DracoRecProcess(state.dataset)
      .then((solutionSet) => {
        setSolutionSet(solutionSet);
        setStatus('Processing completed.');
      })
      .catch((error) => {
        setStatus(error);
      });
  }, [state.dataset]);

  return (
    <div>
      <h1>Draco-Vis Example</h1>
      <p>{status}</p>
      {solutionSet && (
        <div>
          <h2>Solution Set:</h2>
          <pre>{JSON.stringify(solutionSet, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DracoComponent;
