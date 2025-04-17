import React from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega'

const Viz = (props) => {
    const { vizQuery } = props;


    // Connecting to store
    const { state } = useStoreSelector(state => ({
        dataset: state.dataset,
    }));

    const spec = {

        schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: state.dataset,
        ...vizQuery

    };





return (
    <>
        <pre>Viz</pre>
        {vizQuery && vizQuery !== null ? (
            <VegaLite data={state.dataset} spec={spec} />
        ) : ( //placeholder for empty viz
            <div style={{ border: '1px solid black', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>No Visualization Available</span>
            </div>
        )}
    </>
);

};

export default Viz;

