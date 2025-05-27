import React from 'react';
import { getFormattedScoreboard } from '../utils/scoreboardUtils';
import { GAME_STATE } from '../utils/constants'; // For individual game status if needed

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Scoreboard = ({ currentPlayerName, scoreboardData }) => {
  const formattedScores = getFormattedScoreboard(scoreboardData);

  if (Object.keys(formattedScores).length === 0) {
    return <div className="scoreboard"><p>No scores recorded yet. Play some games!</p></div>;
  }

  return (
    <div className="scoreboard">
      <h2>Scoreboard (Best of 3 Series)</h2>
      {Object.entries(formattedScores).map(([playerName, seriesList]) => (
        <div key={playerName} className={`player-scores ${playerName === currentPlayerName ? 'current-player' : ''}`}>
          <h3>{playerName} {playerName === currentPlayerName ? '(You)' : ''}</h3>
          {seriesList.length === 0 ? (
            <p>No completed series for this player yet.</p>
          ) : (
            <ul>
              {seriesList.map((series, index) => (
                <li key={series.seriesId || index}>
                  <p>
                    <strong>Series {index + 1}:</strong> Total Attempts: {series.totalAttempts}, Total Time: {formatTime(series.totalTime)}
                  </p>
                  <details>
                    <summary>View Games ({series.games.length})</summary>
                    <ul>
                      {series.games.map((game, gameIndex) => (
                        <li key={gameIndex}>
                          Game {gameIndex + 1}: Word: {game.word}, Attempts: {game.attempts}, Time: {formatTime(game.timeTaken)}, Status: {game.status}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
