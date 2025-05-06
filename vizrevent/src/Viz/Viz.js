import React from 'react';
import { VegaLite } from 'react-vega';

const Viz = ({ spec, data }) => {
    //Since Draco gives us direct visualizations specs, we handle the RecViz cases a bit differently

    /*console.log("In Viz");
    console.log("Viz/spec:", spec);
    console.log("Viz/data:", data);*/


    return (
        <>
            {
                spec ? (
                    <VegaLite data={data} spec={spec} />
                ) : (
                    <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span>No Visualization</span>
                    </div>
                )
            }
    
        </>
    );
};

export default React.memo(Viz);
