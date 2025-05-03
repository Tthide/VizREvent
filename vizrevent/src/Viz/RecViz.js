import React from 'react'
import Viz from './Viz';


const RecViz = (props) => {

    const { recItem, onRecItemSelect } = props;

    //to be able to use react-vega, we need to format the chart specs given by draco
    function splitVegaLiteSpec(chartRecItem) {
        const { dataset, ...specWithoutData } = chartRecItem;
        return {
          dataset,
          spec: specWithoutData
        };
      }
    
      


    return (
        <div style={{ backgroundColor:"cyan",border: '1px solid black', display: 'flex', flexDirection:"column", justifyContent: 'center' }}>

            <button key={recItem.id} onClick={onRecItemSelect}>ADD</button>
            <Viz chartRecItem={splitVegaLiteSpec(recItem.vizQuery)}>
            </Viz>
        </div>
    )
}

export default RecViz;