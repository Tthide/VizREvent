import React from 'react'
import Viz from './Viz';


const RecViz = (props) => {

    const { recItem, onRecItemSelect } = props;


      


    return (
        <div style={{ backgroundColor:"cyan",border: '1px solid black', display: 'flex', flexDirection:"column", justifyContent: 'center' }}>

            <button key={recItem.id} onClick={onRecItemSelect}>ADD</button>
            <Viz vizQuery={recItem.vizQuery}>
            </Viz>
        </div>
    )
}

export default RecViz;