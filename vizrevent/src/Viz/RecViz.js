import React from 'react'
import Viz from './Viz';


const RecViz = (props) => {

    const { recItem, onRecItemSelect } = props;


    console.log("in RecViz");


    return (
        <div style={{ backgroundColor:"cyan",border: '1px solid black', display: 'flex', flexDirection:"column", justifyContent: 'center' }}>

            <h3>Recommendation query: {recItem.name}</h3>
            <button key={recItem.id} onClick={onRecItemSelect}>ADD</button>
            <Viz spec={recItem.vizQuery.spec} data={recItem.vizQuery.data}>
            </Viz>
        </div>
    )
}

export default React.memo(RecViz);