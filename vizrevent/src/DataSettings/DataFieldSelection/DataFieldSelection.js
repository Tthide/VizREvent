import React, { useEffect, useState } from 'react'
import { useStoreSelector } from '../../Store/VizreventStore';
import { DatafieldsList } from '../DatasetUtils';


const DataFieldSelection = () => {

    const [dataFields, setDataFields] = useState(null);
    const [selectedFields, setSelectedFields] = useState([]);

    //connecting to store
    const { state } = useStoreSelector(state => ({
        vizParam: state.vizParam,
        datasetId: state.datasetId,
        selectedViz: state.selectedViz,
    }));


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



    //computing the dataFields only when the component is Mounted
    useEffect(() => {

        getFieldList();
    }, [state.datasetId]);

    //Updating the selectedFields in accordance with the selectedViz
    useEffect(() => {

    }, [state.selectedViz]);

    const handleCheckboxChange = (field) => {
        setSelectedFields(prevSelectedFields => {
            if (prevSelectedFields.includes(field)) {
                return prevSelectedFields.filter(f => f !== field);
            } else {
                return [...prevSelectedFields, field];
            }
        });
    };

    return (
        <>
            <div>
                {dataFields && state.selectedViz !== null ? (
                    dataFields.map(field => (
                        <div key={field.name}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field)}
                                    onChange={() => handleCheckboxChange(field)}
                                />
                                <b>{field.type} - </b>
                                {field.name}
                            </label>
                        </div>
                    ))
                ) : (
                    <p>Loading data fields...</p>
                )}
            </div>
            <pre>Selected Fields: {JSON.stringify(selectedFields)}</pre>
        </>
    );
};

export default DataFieldSelection;
