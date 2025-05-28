import React from 'react';
import { getUserGlobalRankings, getUserTopPerformers } from '../utils/scoreboardUtils';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Leaderboard = ({ currentPlayerName, scoreboardData, userProfiles = {} }) => {
  const rankings = getUserGlobalRankings(scoreboardData, userProfiles);
  const topPerformers = getUserTopPerformers(scoreboardData, userProfiles);

  if (rankings.length === 0) {
    return (
      <div className="leaderboard">
        <h2>🏆 Global Leaderboard</h2>
        <p>No completed series yet. Be the first to complete a series of 3 games!</p>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return '';
    }
  };

  return (
    <div className="leaderboard">
      <h2>🏆 Global Leaderboard</h2>
      
      {/* Top Performers Section */}
      <div className="top-performers">
        <h3>🌟 Hall of Fame</h3>
        <div className="performers-grid">
          {topPerformers.bestOverall && (
            <div className="performer-card champion">
              <div className="performer-title">👑 Champion</div>
              <div className="performer-name">{topPerformers.bestOverall.playerName}</div>
              <div className="performer-stat">
                {topPerformers.bestOverall.bestSeries.totalAttempts} attempts, {formatTime(topPerformers.bestOverall.bestSeries.totalTime)}
              </div>
            </div>
          )}
          
          {topPerformers.fastestSolver && (
            <div className="performer-card speed">
              <div className="performer-title">⚡ Speed Demon</div>
              <div className="performer-name">{topPerformers.fastestSolver.playerName}</div>
              <div className="performer-stat">
                {formatTime(topPerformers.fastestSolver.fastestGame.timeTaken)} fastest solve
              </div>
            </div>
          )}
          
          {topPerformers.mostEfficient && (
            <div className="performer-card efficient">
              <div className="performer-title">🎯 Most Efficient</div>
              <div className="performer-name">{topPerformers.mostEfficient.playerName}</div>
              <div className="performer-stat">
                {topPerformers.mostEfficient.bestSingleGame.attempts} attempts in {formatTime(topPerformers.mostEfficient.bestSingleGame.timeTaken)}
              </div>
            </div>
          )}
          
          {topPerformers.mostActive && (
            <div className="performer-card active">
              <div className="performer-title">🔥 Most Active</div>
              <div className="performer-name">{topPerformers.mostActive.playerName}</div>
              <div className="performer-stat">
                {topPerformers.mostActive.totalSeriesCompleted} series completed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Rankings Table */}
      <div className="rankings-table">
        <h3>📊 Complete Rankings</h3>
        <div className="table-header">
          <div className="rank-col">Rank</div>
          <div className="player-col">Player</div>
          <div className="best-series-col">Best Series</div>
          <div className="stats-col">Stats</div>
        </div>
        
        {rankings.map((player) => (
          <div 
            key={player.playerName} 
            className={`ranking-row ${player.playerName === currentPlayerName ? 'current-player' : ''} ${getRankClass(player.rank)}`}
          >
            <div className="rank-col">
              <span className="rank-icon">{getRankIcon(player.rank)}</span>
            </div>
            
            <div className="player-col">
              <div className="player-name">
                {player.playerName}
                {player.playerName === currentPlayerName && <span className="you-indicator"> (You)</span>}
              </div>
            </div>
            
            <div className="best-series-col">
              <div className="series-main">
                <strong>{player.bestSeries.totalAttempts}</strong> attempts
              </div>
              <div className="series-time">
                {formatTime(player.bestSeries.totalTime)}
              </div>
            </div>
            
            <div className="stats-col">
              <div className="stat-item">
                <span className="stat-label">Series:</span>
                <span className="stat-value">{player.totalSeriesCompleted}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg:</span>
                <span className="stat-value">{player.averageAttempts} attempts</span>
              </div>
              {player.fastestGame && (
                <div className="stat-item">
                  <span className="stat-label">Fastest:</span>
                  <span className="stat-value">{formatTime(player.fastestGame.timeTaken)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="leaderboard-footer">
        <p>Rankings based on best series performance (fewest attempts, then fastest time)</p>
      </div>
    </div>
  );
};

export default Leaderboard;
