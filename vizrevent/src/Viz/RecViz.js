import React from 'react'
import Viz from './Viz';


const RecViz = (props) => {

    const { recItem,hasSelectedViz, onRecItemAdd, onRecItemUpdate } = props;


    console.log("in RecViz");


    return (
        <div style={{ backgroundColor: "cyan", border: '1px solid black', display: 'flex', flexDirection: "column", justifyContent: 'center' }}>

            {recItem.name !== "" &&
                <h3>Recommendation query: {recItem.name}</h3>}
            <div key={recItem.id} style={{ display: 'flex', flexDirection: "row", width: '100%' }}>
                <button onClick={onRecItemAdd} style={{ width: '100%' }}>ADD</button>
                {hasSelectedViz && <button onClick={onRecItemUpdate} style={{ width: '100%' }}>UPDATE VIZ</button>}
            </div>
            <Viz spec={recItem.vizQuery.spec} data={recItem.vizQuery.data}>
            </Viz>
        </div>
    )
}

export default React.memo(RecViz);