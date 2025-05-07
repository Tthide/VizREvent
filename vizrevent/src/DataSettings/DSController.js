import React, { useEffect, useState } from 'react'
import DSView from './DSView'
import { useStoreSelector } from '../Store/VizreventStore';
import { DatasetListFetcher, DatafieldsList } from './DatasetUtils';
import { extractFieldsFromSpec } from './DataFieldSelection/DataFieldUtils';


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


    // Takes selected dataset and dispatch it to store
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
                    setDataFields(fieldList);
                }
            } catch (error) {
                console.error("Error fetching data fields:", error);
            }
        };

        getFieldList();
    }, [state.datasetId]);


    //Updating the selectedFields in accordance with the selectedViz
    useEffect(() => {
        if (state.selectedViz && dataFields) {

            //getting list of field names used in current viz
            const vizCurrentFields = extractFieldsFromSpec(state.selectedViz.vizQuery);

            //adding all data fields to local state selectedFields
            var newSelectedFields = [];
            dataFields.forEach(field => {
                if (vizCurrentFields.includes(field.name)) { newSelectedFields.push(field); }
            });
            setSelectedFields(newSelectedFields);

        }
    }, [state.selectedViz]);

    const handleDatafieldSelect = (field) => {
        //this function will only be called by UI interaction that are displayed when a viz is selected

        setSelectedFields(prevSelectedFields => {
            if (prevSelectedFields.includes(field)) {
                return prevSelectedFields.filter(f => f !== field);
            } else {
                return [...prevSelectedFields, field];
            }
        });

        //use case new empty viz created
        if (state.selectedViz.vizQuery===null) {
            const newSpec =   {"$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json",
            "config": {"view": {"continuousHeight": 300, "continuousWidth": 300}},
            "data": {"name": "dataset"},"encoding": {},  "mark": {},
        };
            
        }
        //modifying existing or partial viz
        else {
            const newSpec = state.selectedViz;

        }
    };

    //Convert selected Visualization Encoder to new vizParam and recSettings value
    const handleEncoderSelect = (vizEncoder) => {
        dispatch.setRecSettings(vizEncoder);
    };


    return (
        <>
            <DSView
                hasSelectedViz={state.selectedViz !== null}
                datasetList={datasetList}
                dataFields={dataFields}
                selectedFields={selectedFields}
                onDatasetChange={handleDatasetSelect}
                onDatafieldSelect={handleDatafieldSelect}
                onEncoderSelect={handleEncoderSelect} />
            <pre>Local state:{JSON.stringify(selectedFields, null, 2)}</pre>

            <pre>DSControllerPseudoState:{JSON.stringify(state, null, 2)}</pre>
        </>
    )
}

export default DSController