import React from 'react';

const MatchInfo = ({ dataset }) => {
    if (!dataset) {
        return null;
    }

    const {
        match_id,
        match_date,
        competition,
        season,
        home_team,
        away_team,
        home_score,
        away_score,
        competition_stage
    } = dataset;

    return (
        <>
            <td >{match_id}</td>
            <td >
                {competition.competition_name} {season.season_name} {competition_stage.name}
            </td>
            <td >
                {home_team.home_team_name} {home_score} - {away_score} {away_team.away_team_name}
            </td>
            <td >{match_date}</td>
        </>
    );
};

export default MatchInfo;
