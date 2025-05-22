import React, { useEffect, useRef, useState } from 'react'
import DSView from './DSView'
import { useStoreSelector } from '../Store/VizreventStore';
import { DatasetListFetcher, DatafieldsList } from './DatasetUtils';
import { buildNewSpec, parseSpec } from './DataEncodingSelection/DataEncodingUtils';

const DSController = () => {

    //connecting to store
    const { state, dispatch } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        datasetId: state.datasetId,
        selectedViz: state.selectedViz,
    }));

    const [datasetList, setDatasetList] = useState([]);
    const [dataFields, setDataFields] = useState(null);
    const [selectedFields, setSelectedFields] = useState([]);
    const [mark, setMark] = useState(null);
    const [xField, setXField] = useState({});
    const [yField, setYField] = useState({});
    const [xAgr, setXAgr] = useState({});
    const [yAgr, setYAgr] = useState({});
    const [encodingProperties, setEncodingProperties] = useState([{}]);


    // ref to skip our own dispatch updates
    const skipNextVizSelectEffect = useRef(false);

    // Reset all local encoding state
    const resetEncodingLocal = () => {
        setMark(null);
        setXField({});
        setYField({});
        setXAgr({});
        setYAgr({});
        setEncodingProperties([{}]);
        setSelectedFields([]);
    };

    const encodingState = { dataFields, selectedFields, mark, xField, yField, xAgr, yAgr, encodingProperties }
    const encodingStateSetters = {
        setDataFields, setSelectedFields, setMark, setXField, setYField, setXAgr,
        setYAgr, setEncodingProperties, resetEncodingLocal
    }



    /**
     * Unified change handler for mark, x, y, and property dropdowns.
     * Updates local state and then re-dispatches a new spec.
     */
    const handleEncoderChange = (category, payload) => {
        //we use a state copy so that the spec is actually built on the futur state and not on the current one
        let newEncoding = null;
        let copyState = { ...encodingState };

        if (category === 'mark') {
            newEncoding = payload;
            setMark(newEncoding);

            copyState.mark = newEncoding;
        }
        if (category === 'x') {
            const newEncoding = dataFields.find(f => f.name === payload) || {};
            setXField(newEncoding);

            copyState.xField = newEncoding;
        }
        if (category === 'y') {
            const newEncoding = dataFields.find(f => f.name === payload) || {};
            setYField(newEncoding);

            copyState.yField = newEncoding;
        }
        if (category === 'xAgr') {
            newEncoding =  payload!==""? JSON.parse(payload):{};
            setXAgr(newEncoding);

            copyState.xAgr = newEncoding;
        }
        if (category === 'yAgr') {
            newEncoding =  payload!==""? JSON.parse(payload):{};
            setYAgr(newEncoding);

            copyState.yAgr = newEncoding;
        }
        if (category === 'property') {
            let newEncoding = [...encodingProperties];
            const { index, key, value } = payload;
            newEncoding[index] = { ...newEncoding[index], [key]: value };
            // auto-add an empty row if the last one has at least a channel chosen
            const last = newEncoding[newEncoding.length - 1];
            if (last.channel) newEncoding = [...newEncoding, {}];
            setEncodingProperties(newEncoding);

            copyState.encodingProperties = newEncoding;
        }
        if (category === 'deleteProperty') {
            const newEncoding = [...encodingProperties];
            newEncoding.splice(payload.index, 1);
            setEncodingProperties(newEncoding);

            copyState.encodingProperties = newEncoding;

          }
        // before dispatching, tell the effect to skip once
        skipNextVizSelectEffect.current = true;

        const newSpec = buildNewSpec(state.selectedViz !== null, copyState);
        dispatch.setVizParam(newSpec);

    };


    useEffect(() => {

        // if this change was triggered by our own dispatch, ignore it once
        if (skipNextVizSelectEffect.current) {
            skipNextVizSelectEffect.current = false;
            return;
        }
        //resetting local encoding just to be sure
        resetEncodingLocal();
        if (state.selectedViz !== null) {
            // parse the new vizParam and update it
            parseSpec(state.selectedViz.vizQuery, dataFields, selectedFields, encodingStateSetters);

        }

    }, [state.selectedViz]);


    // Getting dataset list when mounting the component 
    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const data = await DatasetListFetcher();
                setDatasetList(data);
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchDatasets();
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    /**
    *Takes selected datasetId and dispatch it to store.
    */
    const handleDatasetSelect = (datasetId) => {
        dispatch.setDatasetId(datasetId);
    };

    //fetching the dataFields only when the dataset changes
    useEffect(() => {
        const getFieldList = async () => {
            try {
                if (state.datasetId) {
                    console.log('Fetching data fields...');
                    const fieldList = await DatafieldsList(state.datasetId);
                    console.log('Fetched data fields:', fieldList);
                    setDataFields(fieldList.field);
                }
            } catch (error) {
                console.error("Error fetching data fields:", error);
            }
        };

        getFieldList();
    }, [state.datasetId]);



    /**
    *Takes selected datafield and updates local state.
    */
    const handleDatafieldSelect = (field) => {
        //this function will only be called by UI interaction that are displayed when a viz is selected
        setSelectedFields(prevSelectedFields => {
            //deselection case
            if (prevSelectedFields.includes(field)) {

                //otherwise just remove it
                return prevSelectedFields.filter(f => f !== field);
            }
            //selection case
            else {
                return [...prevSelectedFields, field];
            }
        });

    };

    return (
        <>
            <DSView
                hasSelectedViz={state.selectedViz !== null}
                datasetList={datasetList}
                datasetMetaData={state.datasetId !==null? datasetList.find(dataset => dataset.match_id === state.datasetId) : null}
                dataFields={dataFields}
                selectedFields={selectedFields}
                dataEncodingState={encodingState}
                onDatasetChange={handleDatasetSelect}
                onDatafieldSelect={handleDatafieldSelect}
                onEncoderSelect={handleEncoderChange} />
           {/* <pre>Local state:{JSON.stringify(selectedFields, null, 2)}</pre>

            <pre>DSControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>*/}
        </>
    )
}

export default DSController