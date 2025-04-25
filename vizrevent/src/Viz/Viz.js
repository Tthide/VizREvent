import React, { useEffect, useState } from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega';
import { DatasetFetcher } from '../DataSettings/DatasetUtils';

const Viz = ({ vizQuery, isSelected }) => {
    // Connecting to store
    const { state } = useStoreSelector(state => ({
        datasetId: state.datasetId,
    }));

    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await DatasetFetcher(state.datasetId);
                console.log("Viz/Data Fetched");
                setData(result);
            } catch (err) {
                console.error('Error fetching dataset:', err);
            }
        };

        if (state.datasetId) {
            fetchData();
        }
    }, [state.datasetId]);

    console.log("Viz/vizQuery:", vizQuery);

    // Ensuring data format for Vega-Lite, Draco and Vega-lite requires different data format so we convert it here to fit Vega-lite
    const spec = {
        schema: "https://vega.github.io/schema/vega-lite/v3.json",
        data: {
            values: data
        },
        ...vizQuery,
    };


    return (
        <div
            style={{
                backgroundColor: isSelected ? 'blue' : 'white',
                color: isSelected ? 'white' : 'black',
                padding: '10px',
                border: '1px solid black',
                cursor: 'pointer',
            }}
        >
            {vizQuery && vizQuery !== null ? (
                <VegaLite data={data} spec={spec} />
            ) : ( // placeholder for empty viz
                <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>No Visualization Available</span>
                </div>
            )}
        </div>
    );
};

export default React.memo(Viz);
