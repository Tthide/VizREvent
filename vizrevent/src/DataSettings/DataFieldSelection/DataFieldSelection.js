import React from 'react'
import './DataFieldSelection.scss'



const DataFieldSelection = ({ dataFields, selectedFields, handleCheckboxChange }) => {


    return (
        <div className="data-field-selection">
            {dataFields ? (
                dataFields.length > 0 ? (
                    dataFields.map((field) => (
                        <div
                            key={field.name}
                            className="field-item"
                            title={`Field: ${field.name}
                                    Type: ${field.type}
                                    Frequency: ${field.freq}
                                    Entropy: ${field.entropy}
                                    Unique Values: ${field.unique}`}
                        >
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
                    <p className="fallback-message">Loading data fields...</p>
                )
            ) : (
                <p className="fallback-message">Please select a dataset</p>
            )}
        </div>
    );
};


export default DataFieldSelection;
