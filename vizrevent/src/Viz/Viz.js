import React, { useEffect, useState } from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega';
import { DatasetFetcher } from '../DataSettings/DatasetUtils';

const Viz = ({ vizQuery, isSelected, chartRecItem }) => {
    //Since Draco gives us direct visualizations specs, we handle the RecViz cases a bit differently



    // Connecting to store
    const { state } = useStoreSelector(state => ({
        datasetId: state.datasetId,
    }));


    const [data, setData] = useState(null);

    //fetching the data on creation
    //only for non RecViz
    useEffect(() => {

        if (!chartRecItem) {
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
        }
    }, [state.datasetId]);

    console.log("Viz/vizQuery:", vizQuery);
    console.log("Viz/chartRecItem:", chartRecItem);


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
            {
                chartRecItem ? (
                    <VegaLite {...chartRecItem} />
                ) : vizQuery ? (
                    <VegaLite data={data.data} spec={spec} />
                ) : (
                    <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span>No Visualization</span>
                    </div>
                )
            }
        </div>
    );
};

export default React.memo(Viz);
