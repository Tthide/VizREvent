import React, { useState } from 'react';
import MatchInfo from './DatasetMatchInfo';
import './DatasetSelection.scss';

const DatasetSelection = ({ datasetList, onDatasetSelect, onSelectionConfirm }) => {
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    if (!datasetList || datasetList.length === 0) {
        return <div>Loading...</div>;
    }

    const handleRowClick = (matchId) => {
        if (selectedMatchId === matchId) {
            setSelectedMatchId(null); // Deselect if the same row is clicked again
        } else {
            setSelectedMatchId(matchId); // Select the row
        }
    };

    const handleConfirmClick = () => {
        if (selectedMatchId) {
            onSelectionConfirm();
            onDatasetSelect(selectedMatchId);
        }
    };

    return (
        <div className="dataset-selection-container">

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Match ID</th>
                            <th>Competition, Season, Stage</th>
                            <th>Home Team vs Away Team</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datasetList.map(dataset => (
                            <tr
                                key={dataset.match_id}
                                onClick={() => handleRowClick(dataset.match_id)}
                                className={selectedMatchId === dataset.match_id ? 'selected' : ''}
                            >
                                <MatchInfo
                                    key={dataset.match_id}
                                    dataset={dataset}
                                />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className="confirm-button" onClick={handleConfirmClick} disabled={!selectedMatchId}>
                Confirm Selection
            </button>
        </div>

    );
};

export default DatasetSelection;
