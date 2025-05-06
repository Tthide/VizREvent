import React from 'react'



const DataFieldSelection = ({dataFields,selectedFields,handleCheckboxChange,hasSelectedViz}) => {


    return (
        <>
            <div>
                {hasSelectedViz ? (
                    dataFields.map(field => (
                        <div key={field.name}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field)}
                                    onChange={() => handleCheckboxChange(field)}
                                />
                                <b>{field.type} - </b>
                                {field.name}
                            </label>
                        </div>
                    ))
                ) : (
                    <p>Loading data fields...</p>
                )}
            </div>
            <pre>Selected Fields: {JSON.stringify(selectedFields)}</pre>
        </>
    );
};

export default DataFieldSelection;
