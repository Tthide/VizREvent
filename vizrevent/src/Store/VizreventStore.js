import React, { useReducer, createContext, useContext } from 'react';
import reducer, { initialState } from './VizreventReducer';
import {
  setRecSettings,
  setVizParam,
  setDataset,
  setInputViz,
} from './VizreventActions';

// Create a context for the store
const StoreContext = createContext();

// StoreProvider component
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider
      value={{
        state,
        setRecSettings: (recSettings) => dispatch(setRecSettings(recSettings)),
        setVizParam: (vizParam) => dispatch(setVizParam(vizParam)),
        setDataset: (dataset) => dispatch(setDataset(dataset)),
        setInputViz: (inputViz) => dispatch(setInputViz(inputViz)),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
