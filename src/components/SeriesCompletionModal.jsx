import React, { useState, useEffect } from 'react';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AnimatedCounter = ({ from, to, duration = 1000 }) => {
  const [count, setCount] = useState(from);
  
  useEffect(() => {
    if (from === to) return;
    
    const steps = Math.abs(to - from);
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const currentValue = from + (to - from) * progress;
      
      setCount(Math.round(currentValue));
      
      if (currentStep >= steps) {
        setCount(to);
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [from, to, duration]);
  
  return <span className="animated-counter">{count > 0 ? `#${count}` : '--'}</span>;
};

const SeriesCompletionModal = ({ 
  isVisible, 
  onClose, 
  seriesData, 
  rankingData, 
  onViewLeaderboard, 
  onPlayAgain 
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Staggered animation sequence
      setTimeout(() => setShowStats(true), 300);
      setTimeout(() => setShowRanking(true), 800);
      setTimeout(() => setShowActions(true), 1500);
    } else {
      // Reset animation states
      setShowStats(false);
      setShowRanking(false);
      setShowActions(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const {
    totalAttempts,
    totalTime,
    gamesWon,
    totalGames,
    isPerfectSeries
  } = seriesData;

  const {
    previousRank,
    currentRank,
    positionChange,
    beatPlayers,
    isNewPersonalBest,
    achievedTopThree,
    isFirstSeries
  } = rankingData;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const getPositionChangeIcon = () => {
    if (positionChange > 0) return '↗️';
    if (positionChange < 0) return '↘️';
    return '➡️';
  };

  const getPositionChangeText = () => {
    if (positionChange > 0) {
      return `Moved up ${positionChange} position${positionChange > 1 ? 's' : ''}!`;
    }
    if (positionChange < 0) {
      return `Moved down ${Math.abs(positionChange)} position${Math.abs(positionChange) > 1 ? 's' : ''}`;
    }
    return 'Position unchanged';
  };

  return (
    <div className="series-completion-overlay">
      <div className="series-completion-modal">
        <div className="completion-header">
          <h2>🏆 Series Complete!</h2>
          {isPerfectSeries && <div className="perfect-badge">Perfect Series! 🌟</div>}
        </div>

        {showStats && (
          <div className="series-stats animate-slide-in">
            <h3>📊 Your Performance</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Attempts:</span>
                <span className="stat-value">{totalAttempts}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Time:</span>
                <span className="stat-value">{formatTime(totalTime)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Games Won:</span>
                <span className="stat-value">{gamesWon}/{totalGames}</span>
              </div>
            </div>
          </div>
        )}

        {showRanking && (
          <div className="ranking-achievement animate-slide-in">
            <h3>📈 Leaderboard Update</h3>
            
            <div className="ranking-display">
              <div className="rank-comparison">
                <div className="rank-item previous">
                  <span className="rank-label">Previous:</span>
                  <span className="rank-value">
                    {previousRank > 0 ? `#${previousRank}` : '--'}
                  </span>
                </div>
                
                <div className="rank-arrow">
                  {getPositionChangeIcon()}
                </div>
                
                <div className="rank-item current">
                  <span className="rank-label">Current:</span>
                  <AnimatedCounter 
                    from={previousRank || currentRank} 
                    to={currentRank} 
                    duration={1000} 
                  />
                </div>
              </div>

              <div className="position-change">
                {positionChange !== 0 && (
                  <span className={`change-text ${positionChange > 0 ? 'positive' : 'negative'}`}>
                    {getPositionChangeText()}
                  </span>
                )}
              </div>

              {beatPlayers > 0 && (
                <div className="beat-players">
                  🎯 You beat {beatPlayers} other player{beatPlayers > 1 ? 's' : ''}!
                </div>
              )}
            </div>

            {/* Achievement Badges */}
            <div className="achievement-badges">
              {achievedTopThree && (
                <div className="achievement-badge top-three">
                  {getRankIcon(currentRank)} You're in the Top 3!
                </div>
              )}
              
              {isNewPersonalBest && (
                <div className="achievement-badge personal-best">
                  ⭐ New Personal Best!
                </div>
              )}
              
              {isFirstSeries && (
                <div className="achievement-badge first-series">
                  🎉 First Series Completed!
                </div>
              )}
            </div>
          </div>
        )}

        {showActions && (
          <div className="completion-actions animate-fade-in">
            <button 
              onClick={onViewLeaderboard}
              className="action-button secondary"
            >
              View Full Leaderboard
            </button>
            <button 
              onClick={onPlayAgain}
              className="action-button primary"
            >
              Play Another Series
            </button>
          </div>
        )}

        <button 
          onClick={onClose}
          className="close-button"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SeriesCompletionModal;