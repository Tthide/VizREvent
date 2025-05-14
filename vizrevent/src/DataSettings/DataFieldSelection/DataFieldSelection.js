import React from 'react'



const DataFieldSelection = ({ dataFields, selectedFields, handleCheckboxChange }) => {


    return (
        <>
            <div>
                {dataFields ?
                    (
                        dataFields.length > 0 ? (
                            dataFields.map(field => (
                                <div key={field.name}
                                    title={`Field: ${field.name}
                                            \nType: ${field.type}
                                            \nFrequency: ${field.freq}
                                            \nEntropy: ${field.entropy}
                                            \nUnique Values: ${field.unique}`}>
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
                        )
                    )
                    : (
                        <p>Please select a dataset...</p>
                    )}
            </div>
        </>
    );
};

export default DataFieldSelection;
