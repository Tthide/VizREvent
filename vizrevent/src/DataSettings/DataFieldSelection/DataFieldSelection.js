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
                                const tooltipLineId = `tooltip-${field.name}`;
                                const vizTooltipId = `viz-tooltip-${field.name}`;
                                const tooltipLineContent = `Field: ${field.name}
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
                                                data-tooltip-id={tooltipLineId}
                                                data-tooltip-content={tooltipLineContent}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleCheckboxChange(field)}
                                                />
                                            </td>
                                            <td data-tooltip-id={tooltipLineId} data-tooltip-content={tooltipLineContent}>
                                                <b>{field.type}</b>
                                            </td>
                                            <td data-tooltip-id={tooltipLineId} data-tooltip-content={tooltipLineContent}>
                                                {field.name}
                                            </td>
                                            <td data-tooltip-id={vizTooltipId} data-tooltip-content={tooltipLineContent}
                                                data-tooltip-delay-hide={1000}>
                                                <DataFieldViz distribution={field.distribution} />
                                            </td>

                                        </tr>
                                        {/* Regular text line tooltip */}
                                        <Tooltip
                                            id={tooltipLineId}
                                            place="right"
                                            multiline
                                            positionStrategy="fixed"
                                            style={{ whiteSpace: 'pre-line', zIndex: 9999 }}
                                        />
                                        {/* BIGGER viz tooltip */}
                                        <Tooltip
                                            id={vizTooltipId}
                                            place="right"
                                            positionStrategy="fixed"
                                            delayShow={400}
                                            delayHide={0}
                                            clickable
                                            className='viz-tooltip'
                                            render={() => (
                                                <DataFieldViz distribution={field.distribution} showRectTooltips/>
                                            )}
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
