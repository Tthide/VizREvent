// Define action types
export const SET_REC_SETTINGS = 'SET_REC_SETTINGS';
export const SET_VIZ_PARAM = 'SET_VIZ_PARAM';
export const SET_DATASETID = 'SET_DATASETID';
export const SET_INPUT_VIZ = 'SET_INPUT_VIZ';
export const SET_SELECTED_VIZ = 'SET_SELECTED_VIZ';
export const SET_DATASET_DATA = 'SET_DATASET_DATA';


// Action creators
export const setRecSettings = (recSettings) => ({
  type: SET_REC_SETTINGS,
  payload: recSettings,
});

export const setVizParam = (vizParam) => ({
  type: SET_VIZ_PARAM,
  payload: vizParam,
});

export const setDatasetId = (datasetId) => ({
  type: SET_DATASETID,
  payload: datasetId,
});
export const setDatasetData = (datasetData) => ({
  type: SET_DATASET_DATA,
  payload: datasetData,
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
