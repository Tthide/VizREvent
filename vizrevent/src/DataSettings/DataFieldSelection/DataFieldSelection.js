import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './DataFieldSelection.scss';
import DataFieldViz from './DataFieldViz';

const DataFieldSelection = ({ dataFields, selectedFields, handleCheckboxChange }) => {
    return (
        <>
            {dataFields ? (
                dataFields.length > 0 ? (
                    <table className="data-field-table">
                        <thead>
                            <tr>
                                <th title="Select">Select</th>
                                <th title="Type">Type</th>
                                <th title="Name">Name</th>
                                <th title="Distribution">Distribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataFields.map((field) => {
                                const isSelected = selectedFields.includes(field);
                                const tooltipId = `tooltip-${field.name}`;
                                const tooltipContent = `Field: ${field.name}
                                                        Type: ${field.type}
                                                        Frequency: ${field.freq}
                                                        Entropy: ${field.entropy}
                                                        Unique Values: ${field.unique}`;

                                return (
                                    <React.Fragment key={field.name}>
                                        <tr
                                            className={isSelected ? 'selected-row' : ''}
                                            onClick={() => handleCheckboxChange(field)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {/* Tooltip wrapper cells */}
                                            <td
                                                data-tooltip-id={tooltipId}
                                                data-tooltip-content={tooltipContent}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleCheckboxChange(field)}
                                                />
                                            </td>
                                            <td data-tooltip-id={tooltipId} data-tooltip-content={tooltipContent}>
                                                <b>{field.type}</b>
                                            </td>
                                            <td data-tooltip-id={tooltipId} data-tooltip-content={tooltipContent}>
                                                {field.name}
                                            </td>
                                            <td>
                                                <DataFieldViz distribution={field.distribution} />
                                            </td>
                                        </tr>
                                        <Tooltip
                                            id={tooltipId}
                                            place="right"
                                            multiline
                                            positionStrategy="fixed"
                                            style={{ whiteSpace: 'pre-line', zIndex: 9999 }}
                                        />
                                    </React.Fragment>
                                );
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
