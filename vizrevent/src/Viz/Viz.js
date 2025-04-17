import React, { useEffect, useRef } from 'react';
import { useStoreSelector } from '../Store/VizreventStore';
import embed from 'vega-embed';

const Viz = (props) => {
    const { vizQuery } = props;
    const ref = useRef();

    // Connecting to store
    const { state } = useStoreSelector(state => ({
        dataset: state.dataset,
    }));

    useEffect(() => {
        const spec = {
            $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
            description: 'A simple bar chart',
            data: state.dataset, // Use the dataset from the store

            mark: 'bar',
            encoding: {
                x: { field: 'a', type: 'ordinal' },
                y: { field: 'b', type: 'quantitative' },
            }
        };

        embed(ref.current, spec);
    }, [state.dataset]);

    return (
        <>
            <pre>Viz</pre>
            <div ref={ref}></div>
        </>
    );
};

export default Viz;

