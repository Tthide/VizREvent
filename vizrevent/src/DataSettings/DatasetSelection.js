import React, { useState } from 'react';
import MatchInfo from './DatasetMatchInfo';
import './CSS/DatasetSelection.css';

const DatasetSelection = ({ datasetList, onDatasetSelect }) => {
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    if (!datasetList || datasetList.length === 0) {
        return <div>Loading...</div>;
    }

    const handleRowClick = (matchId) => {
        setSelectedMatchId(matchId);
    };

    const handleConfirmClick = () => {
        if (selectedMatchId) {
            onDatasetSelect(selectedMatchId);
        }
    };

    return (
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
            <button className="confirm-button" onClick={handleConfirmClick} disabled={!selectedMatchId}>
                Confirm Selection
            </button>
        </div>
    );
};

export default DatasetSelection;
