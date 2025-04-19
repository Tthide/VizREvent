import React from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import { VegaLite } from 'react-vega'

const Viz = (props) => {
    const { vizQuery } = props;


    // Connecting to store
    const { state } = useStoreSelector(state => ({
        dataset: state.dataset,
    }));

    //Ensuring data format for Vega - Lite, Draco and Vega-lite requires different data format so we convert it here to fit Vega-lite
    const spec = {

        schema: "https://vega.github.io/schema/vega-lite/v3.json",
        data: {
            values: state.dataset
        },
        ...vizQuery,


    };






    return (
        <>
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

