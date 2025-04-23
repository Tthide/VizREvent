import React from 'react';
import MatchInfo from './DatasetMatchInfo';
import './CSS/DatasetSelection.css';

const DatasetSelection = ({ datasetList, onDatasetSelect }) => {
    if (!datasetList || datasetList.length === 0) {
        return <div>Loading...</div>;
    }

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
                        <tr key={dataset.match_id} onClick={() => onDatasetSelect(dataset.match_id)}>
                            <MatchInfo
                                key={dataset.match_id}
                                dataset={dataset}
                            />
                        </tr>

                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DatasetSelection;
