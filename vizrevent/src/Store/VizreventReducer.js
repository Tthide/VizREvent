import {
  SET_REC_SETTINGS,
  SET_VIZ_PARAM,
  SET_DATASETID,
  SET_INPUT_VIZ,
  SET_SELECTED_VIZ,
  SET_DATASET_DATA,
} from './VizreventActions';

// Initial state
export const initialState = {
  recSettings: null,
  vizParam: null,
  datasetId: null,
  inputViz: null,
  selectedViz: null, 
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case SET_REC_SETTINGS:
      return { ...state, recSettings: action.payload };
    case SET_VIZ_PARAM:
      return { ...state, vizParam: action.payload };
    case SET_DATASETID:
      return { ...state, datasetId: action.payload };
    case SET_DATASET_DATA:
      return { ...state, datasetData: action.payload };
    case SET_INPUT_VIZ:
      return { ...state, inputViz: action.payload };
    case SET_SELECTED_VIZ:
      return {
        ...state,
        selectedViz: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
