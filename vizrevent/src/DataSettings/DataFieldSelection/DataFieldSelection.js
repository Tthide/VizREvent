import React from 'react';
import './DataFieldSelection.scss';

const DataFieldSelection = ({ dataFields, selectedFields, handleCheckboxChange }) => {
    return (
        <>
            {dataFields ? (
                dataFields.length > 0 ? (
                    <table className="data-field-table">
                        <thead>
                            <tr>
                                <th title={"Select"}>Select</th>
                                <th title={"Type"}>Type</th>
                                <th title={"Name"}>Name</th>
                                <th title={"Frequency"}>Frequency</th>
                                <th title={"Entropy"}>Entropy</th>
                                <th title={"Unique Values"}>Unique Values</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataFields.map((field) => {
                                const isSelected = selectedFields.includes(field);
                                return (
                                    <tr
                                        key={field.name}
                                        title={`Field: ${field.name}\nType: ${field.type}\nFrequency: ${field.freq}\nEntropy: ${field.entropy}\nUnique Values: ${field.unique}`}
                                        className={isSelected ? 'selected-row' : ''}
                                        onClick={() => handleCheckboxChange(field)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.includes(field)}
                                                onChange={() => handleCheckboxChange(field)}
                                            />
                                        </td>
                                        <td><b>{field.type}</b></td>
                                        <td>{field.name}</td>
                                        <td>{field.freq}</td>
                                        <td>{field.entropy}</td>
                                        <td>{field.unique}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="fallback-message">Loading data fields...</p>
                )
            ) : (
                <p className="fallback-message">Please select a dataset</p>
            )}
        </>
    );
};

export default DataFieldSelection;
