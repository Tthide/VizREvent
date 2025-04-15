// Define action types
export const SET_REC_SETTINGS = 'SET_REC_SETTINGS';
export const SET_VIZ_PARAM = 'SET_VIZ_PARAM';
export const SET_DATASET = 'SET_DATASET';
export const SET_INPUT_VIZ = 'SET_INPUT_VIZ';
export const SET_SELECTED_VIZ = 'SET_SELECTED_VIZ';


// Action creators
export const setRecSettings = (recSettings) => ({
  type: SET_REC_SETTINGS,
  payload: recSettings,
});

export const setVizParam = (vizParam) => ({
  type: SET_VIZ_PARAM,
  payload: vizParam,
});

export const setDataset = (dataset) => ({
  type: SET_DATASET,
  payload: dataset,
});

export const setInputViz = (inputViz) => ({
  type: SET_INPUT_VIZ,
  payload: inputViz,
});

export const setSelectedViz = (selectedViz) => {
  return {
    type: SET_SELECTED_VIZ,
    payload: selectedViz,
  };
};
