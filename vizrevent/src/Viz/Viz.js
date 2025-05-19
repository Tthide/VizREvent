import React from 'react';
import { VegaLite } from 'react-vega';
import './Viz.scss'; // Import the DSView SASS file

const Viz = ({ spec, data }) => {
    //enhancing the spec by resizing the viz
    const enhancedSpec = spec ? {
        ...spec,
        width: 'container',
        height: 'container',
        autosize: {
            type: 'fit',
            contains: 'padding',
        }
    } : null;

    return (
        <div className="Viz-chart-container">
            {
                enhancedSpec ? (
                    <VegaLite data={data} spec={enhancedSpec} />
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
