import React from 'react'
import Viz from './Viz';
import './RecViz.scss';
import { CirclePlus, CircleFadingArrowUp } from 'lucide-react';


const RecViz = (props) => {

    const { recItem, hasSelectedViz, onRecItemAdd, onRecItemUpdate } = props;


    console.log("in RecViz");

    return (
        <div className="RecViz-container">
            {recItem.name !== "" &&
                <h3 className="RecViz-heading">Recommendation query: {recItem.name}</h3>}

            <div key={recItem.id} className="RecViz-button-container">
                <button onClick={onRecItemAdd} className="RecViz-button">
                    <CirclePlus /> ADD
                </button>
                {hasSelectedViz &&
                    <button onClick={onRecItemUpdate} className="RecViz-button">
                        <CircleFadingArrowUp /> UPDATE CURRENT
                    </button>}
            </div>
            <div className='RecViz-Viz-container'>
                <Viz spec={recItem.vizQuery.spec} data={recItem.vizQuery.data} />
            </div>
        </div>
    )
}


export default React.memo(RecViz);