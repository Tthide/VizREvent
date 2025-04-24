import React, { useEffect, useState } from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega'
import { DatasetFetcher } from '../DataSettings/DatasetUtils';

const Viz = (props) => {
    const { vizQuery } = props;


    // Connecting to store
    const { state } = useStoreSelector(state => ({
        datasetId: state.datasetId,
    }));

    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await DatasetFetcher(state.datasetId);
                setData(result);
            } catch (err) {
                console.error('Error fetching dataset:', err);
            }
        };

        if (state.datasetId) {
            fetchData();
        }
    }, []);

    console.log("Viz/data:", data);
    //Ensuring data format for Vega - Lite, Draco and Vega-lite requires different data format so we convert it here to fit Vega-lite
    const spec = {

        schema: "https://vega.github.io/schema/vega-lite/v3.json",
        data: {
            values: data
        },
        ...vizQuery,


    };






    return (
        <>
            {vizQuery && vizQuery !== null ? (
                <VegaLite data={data} spec={spec} />
            ) : ( //placeholder for empty viz
                <div style={{ border: '1px solid black', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>No Visualization Available</span>
                </div>
            )}
        </>
    );

};

export default Viz;

