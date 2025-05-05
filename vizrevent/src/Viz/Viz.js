import React, { useEffect, useState } from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega';
import { DatasetFetcher } from '../DataSettings/DatasetUtils';

const Viz = ({ vizQuery, isSelected }) => {
    //Since Draco gives us direct visualizations specs, we handle the RecViz cases a bit differently



    // Connecting to store
    const { state } = useStoreSelector(state => ({
        datasetId: state.datasetId,
    }));


    const [data, setData] = useState(null);

    //fetching the data on creation
    //only for non RecViz
  /*  useEffect(() => {

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

    }, [state.datasetId]);*/

    console.log("Viz/vizQuery:", vizQuery);


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
                vizQuery ? (
                    <VegaLite data={vizQuery.data} spec={vizQuery.spec} />
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
