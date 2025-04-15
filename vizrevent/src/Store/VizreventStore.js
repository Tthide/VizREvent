import React, { useReducer, createContext, useContext, useMemo } from 'react';
import reducer, { initialState } from './VizreventReducer';
import {
  setRecSettings,
  setVizParam,
  setDataset,
  setInputViz,
  setSelectedViz,
} from './VizreventActions';

// Create a context for the store
const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = useMemo(() => ({
    state,
    dispatchMethods: {
      setRecSettings: (recSettings) => dispatch(setRecSettings(recSettings)),
      setVizParam: (vizParam) => dispatch(setVizParam(vizParam)),
      setDataset: (dataset) => dispatch(setDataset(dataset)),
      setInputViz: (inputViz) => dispatch(setInputViz(inputViz)),
      setSelectedViz: (selectedViz) => dispatch(setSelectedViz(selectedViz)),
    },
  }), [state]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};


// Custom hook to use the store with possible selection of relevant properties and dispatch methods
export const useStoreSelector = (stateSelector = state => state, dispatchSelector = dispatchMethods => dispatchMethods)=> {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreSelector must be used within a StoreProvider');
  }

  const { state, dispatchMethods } = context;
  const selectedState = stateSelector(state);
  const selectedDispatchMethods = dispatchSelector(dispatchMethods);
 // console.log('Dispatch Methods:', dispatchMethods);
 // console.log('Selected Dispatch Methods:', selectedDispatchMethods);

  return {
    state:selectedState,
    dispatch:selectedDispatchMethods,
  };
};