import React, { useEffect } from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega';
import { DatasetFetcher } from '../DataSettings/DatasetUtils';

const Viz = ({ spec, isSelected, data }) => {
    //Since Draco gives us direct visualizations specs, we handle the RecViz cases a bit differently

    console.log("Viz/spec:", spec);
    console.log("Viz/data:", data);


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
                spec ? (
                    <VegaLite data={data} spec={spec} />
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
