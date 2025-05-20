import React, { useState } from 'react';
import DatasetSelection from './DatasetSelection/DatasetSelection.js';
import DataFieldSelection from './DataFieldSelection/DataFieldSelection.js';
import DataEncodingSelection from './DataEncodingSelection/DataEncodingSelection.js';
import './DSView.scss'; // Import the DSView SASS file

const DSView = (props) => {

    const { hasSelectedViz, datasetList, datasetMetaData, dataFields, selectedFields, dataEncodingState, onDatasetChange, onDatafieldSelect, onEncoderSelect } = props;
    // State to manage the visibility of the DatasetSelection component
    const [isDatasetSelectionOpen, setIsDatasetSelectionOpen] = useState(false);

    //when Change dataset button is pressed, this make isDatasetSelectionOpen true
    //when a dataset is selected in DatasetSelection, this make it false and closes DatasetSelection
    const handleDatasetSelectionOpen = () => {
        setIsDatasetSelectionOpen(prevState => !prevState);
    };


    const handleDatasetSelect = (datasetId) => {
        onDatasetChange(datasetId);
    };

    const handleDataFieldSelect = (dataField) => {
        onDatafieldSelect(dataField);
    };

    const handleVizEncoderSelect = (category, payload) => {
        onEncoderSelect(category, payload);
    };
    return (
        <div className="ds-view-container">
            <h1>DSView</h1>

            <button className={`change-dataset-button ${datasetMetaData === null ? ' no-dataset' : ''}`} onClick={handleDatasetSelectionOpen}>

                {datasetMetaData && datasetMetaData !== null ?
                    <>
                        <span >{datasetMetaData.match_id}</span>
                        <span >
                            {datasetMetaData.competition.competition_name} {datasetMetaData.season.season_name} {datasetMetaData.competition_stage.name}
                        </span>
                        <span >
                            {datasetMetaData.home_team.home_team_name} {datasetMetaData.home_score} - {datasetMetaData.away_score} {datasetMetaData.away_team.away_team_name}
                        </span>
                        <span >{datasetMetaData.match_date}</span>
                    </>
                    : 'Select Dataset' //id :${datasetMetaData.match_id} | da `

                }

            </button>

            {isDatasetSelectionOpen && (
                <DatasetSelection datasetList={datasetList} onDatasetSelect={handleDatasetSelect} onSelectionConfirm={handleDatasetSelectionOpen} />
            )}

            {/* only displayed when selectedViz !== null */}
            <DataFieldSelection
                dataFields={dataFields}
                selectedFields={selectedFields}
                handleCheckboxChange={handleDataFieldSelect}
            />

            <DataEncodingSelection
                dataEncodingState={dataEncodingState}
                onEncodingChange={handleVizEncoderSelect}
                hasSelectedViz={hasSelectedViz}
            />
        </div>
    );
};
export default React.memo(DSView);
