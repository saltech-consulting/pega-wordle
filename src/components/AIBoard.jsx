import React from 'react';
import { MAX_GUESSES, WORD_LENGTH } from '../utils/constants';

const AIBoard = ({ 
  guesses = [], 
  isThinking = false, 
  difficulty = 'medium',
  status = 'Ready',
  gameStatus = 'playing',
  isGameFinished = false
}) => {
  // Create empty rows for remaining guesses
  const emptyRows = MAX_GUESSES - guesses.length;
  
  const renderTile = (letter, status, index, isRevealed = true, showActualLetter = false) => {
    const tileClass = `tile ai-tile ${status || ''} ${isRevealed ? 'revealed' : ''}`;
    
    // Show actual letter if game is finished or if showActualLetter is true
    const displayText = isRevealed ? (letter ? (showActualLetter ? letter : '?') : '') : '';
    
    return (
      <div key={index} className={tileClass}>
        {displayText}
      </div>
    );
  };

  const renderGuessRow = (guess, rowIndex) => {
    const tiles = [];
    
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess.letters?.[i] || '';
      const status = guess.feedback?.[i] || '';
      // Show actual letters when game is finished
      tiles.push(renderTile(letter, status, i, guess.isRevealed, isGameFinished));
    }
    
    return (
      <div key={rowIndex} className="guess-row ai-guess-row">
        {tiles}
      </div>
    );
  };

  const renderEmptyRow = (rowIndex) => {
    const tiles = [];
    
    for (let i = 0; i < WORD_LENGTH; i++) {
      tiles.push(renderTile('', '', i, false));
    }
    
    return (
      <div key={`empty-${rowIndex}`} className="guess-row ai-guess-row">
        {tiles}
      </div>
    );
  };

  const getDifficultyColor = () => {
    const colors = {
      easy: '#4ade80',
      medium: '#fbbf24', 
      hard: '#ef4444'
    };
    return colors[difficulty] || colors.medium;
  };

  const getStatusMessage = () => {
    if (gameStatus === 'won') return '🎉 AI Won!';
    if (gameStatus === 'lost') return '😞 AI Lost';
    if (isThinking) return '🤔 Thinking...';
    return status;
  };

  return (
    <div className="ai-board-container">
      {/* AI Header */}
      <div className="ai-header">
        <div className="ai-title">
          <h3>AI Player</h3>
          <span 
            className="ai-difficulty-badge"
            style={{ backgroundColor: getDifficultyColor() }}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
        <div className="ai-status">
          {isThinking && <div className="thinking-animation">
            <div className="thinking-dot"></div>
            <div className="thinking-dot"></div>
            <div className="thinking-dot"></div>
          </div>}
          <span className="ai-status-text">{getStatusMessage()}</span>
        </div>
      </div>

      {/* AI Game Board */}
      <div className="board ai-board">
        {/* Render completed guesses */}
        {guesses.map((guess, index) => renderGuessRow(guess, index))}
        
        {/* Render empty rows */}
        {Array.from({ length: emptyRows }, (_, index) => 
          renderEmptyRow(guesses.length + index)
        )}
      </div>

      {/* AI Stats */}
      <div className="ai-stats">
        <div className="ai-stat">
          <span className="ai-stat-label">Guesses:</span>
          <span className="ai-stat-value">{guesses.length}/{MAX_GUESSES}</span>
        </div>
      </div>
    </div>
  );
};

export default AIBoard;