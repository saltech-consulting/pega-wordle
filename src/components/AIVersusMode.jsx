import React, { useState, useEffect, useRef } from 'react';
import { useAIPlayer } from '../hooks/useAIPlayer';
import Board from './Board';
import AIBoard from './AIBoard';
import Keyboard from './Keyboard';
import { AI_DIFFICULTIES } from '../utils/aiStrategy';

const AIVersusMode = ({ wordList, onBackToMenu }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('setup'); // setup, countdown, playing, finished
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null); // 'player', 'ai', 'tie', null
  const [gameTime, setGameTime] = useState(120); // 2 minutes in seconds
  const processingRef = useRef(false); // Prevent duplicate processing
  
  // Get random word for this game
  const [currentWord, setCurrentWord] = useState('');
  
  useEffect(() => {
    if (wordList && wordList.length > 0) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      setCurrentWord(randomWord.word.toUpperCase());
    }
  }, [wordList]);


  // Player game logic - simplified for AI mode
  const [playerGuesses, setPlayerGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [playerGameStatus, setPlayerGameStatus] = useState('idle');
  const [usedKeys, setUsedKeys] = useState({});
  const [turn, setTurn] = useState(0);

  // AI player logic
  const {
    aiGuesses,
    isThinking,
    gameStatus: aiGameStatus,
    aiStatus,
    initializeAI,
    startAIGame,
    resetAI
  } = useAIPlayer(selectedDifficulty, wordList, currentWord, gameState === 'finished', winner);

  // Initialize AI when difficulty or word changes
  useEffect(() => {
    if (wordList && currentWord) {
      initializeAI();
    }
  }, [wordList, currentWord, selectedDifficulty]);

  // Handle countdown
  useEffect(() => {
    if (gameState === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameState('playing');
            setPlayerGameStatus('playing');
            startAIGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, startAIGame]);

  // Game timer countdown
  useEffect(() => {
    if (gameState === 'playing' && gameTime > 0) {
      const timer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            // Time's up - both players lose
            setPlayerGameStatus('lost');
            setWinner('tie');
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, gameTime]);

  // Check for game end conditions
  useEffect(() => {
    if (gameState === 'playing') {
      const playerWon = playerGameStatus === 'won';
      const playerLost = playerGameStatus === 'lost';
      const aiWon = aiGameStatus === 'won';
      const aiLost = aiGameStatus === 'lost';

      if (playerWon && aiWon) {
        // Check who won by number of guesses
        if (turn < aiGuesses.length) {
          setWinner('player');
        } else if (aiGuesses.length < turn) {
          setWinner('ai');
        } else {
          setWinner('tie');
        }
        setGameState('finished');
      } else if (playerWon && !aiWon) {
        setWinner('player');
        setGameState('finished');
      } else if (aiWon && !playerWon) {
        setWinner('ai');
        setGameState('finished');
      } else if (playerLost && aiLost) {
        setWinner('tie');
        setGameState('finished');
      } else if (playerLost && !aiWon) {
        setWinner('ai');
        setGameState('finished');
      } else if (aiLost && !playerWon) {
        setWinner('player');
        setGameState('finished');
      }
    }
  }, [playerGameStatus, aiGameStatus, turn, aiGuesses.length, gameState]);

  const handleStartGame = () => {
    // Get new word for this game
    if (wordList && wordList.length > 0) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      const newWord = randomWord.word.toUpperCase();
      setCurrentWord(newWord);
    }
    
    // Reset AI state
    resetAI();
    
    setGameState('countdown');
    setCountdown(3);
    setWinner(null);
    setGameTime(120); // Reset timer to 2 minutes
  };

  const handlePlayAgain = () => {
    // Get new word
    if (wordList && wordList.length > 0) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      setCurrentWord(randomWord.word.toUpperCase());
    }
    
    // Reset both games
    setPlayerGuesses([]);
    setCurrentGuess('');
    setPlayerGameStatus('idle');
    setUsedKeys({});
    setTurn(0);
    resetAI();
    setGameState('setup');
    setWinner(null);
    setGameTime(120); // Reset timer
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  // Process a completed guess
  const processGuess = (guess) => {
    // Prevent duplicate processing
    if (processingRef.current) return;
    processingRef.current = true;
    
    // Allow any 5-letter word (removed vocabulary restriction)
    
    // Update used keys based on the guess
    const newUsedKeys = { ...usedKeys };
    const guessLetters = guess.split('');
    const targetLetters = currentWord.split('');
    
    // First pass: mark correct positions
    guessLetters.forEach((letter, i) => {
      if (letter === targetLetters[i]) {
        newUsedKeys[letter] = 'correct';
        targetLetters[i] = null;
      }
    });
    
    // Second pass: mark present/absent letters
    guessLetters.forEach((letter, i) => {
      if (targetLetters[i] !== null) { // Not already marked as correct
        if (targetLetters.includes(letter)) {
          if (newUsedKeys[letter] !== 'correct') {
            newUsedKeys[letter] = 'present';
          }
          targetLetters[targetLetters.indexOf(letter)] = null;
        } else {
          if (!newUsedKeys[letter]) {
            newUsedKeys[letter] = 'absent';
          }
        }
      }
    });
    
    setUsedKeys(newUsedKeys);
    
    // Update guesses and check win condition in the same update
    setPlayerGuesses(prevGuesses => {
      const newGuesses = [...prevGuesses, guess];
      
      // Check win/loss condition with the updated guesses
      if (guess === currentWord) {
        setPlayerGameStatus('won');
      } else if (newGuesses.length >= 6) {
        setPlayerGameStatus('lost');
      }
      
      return newGuesses;
    });
    
    setCurrentGuess('');
    setTurn(prev => prev + 1);
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      processingRef.current = false;
    }, 100);
  };

  // Simple player game logic
  const handleKeyup = (key) => {
    if (gameState !== 'playing' || playerGameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        processGuess(currentGuess);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key.match(/^[A-Z]$/)) {
      setCurrentGuess(prev => {
        if (prev.length < 5) {
          return prev + key;
        }
        return prev;
      });
    }
  };

  // Keyboard event handling - but only for physical keyboard
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore if the event is from a button click (avoid double processing)
      if (event.target.tagName === 'BUTTON') return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        handleKeyup('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyup('BACKSPACE');
      } else if (key.length === 1 && key.match(/^[A-Z]$/)) {
        handleKeyup(key);
      }
    };

    if (gameState === 'playing') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, handleKeyup]);

  // Create statuses for the Board component
  const createStatuses = () => {
    const statuses = Array(6).fill(null).map(() => Array(5).fill('empty'));
    
    // Calculate statuses for submitted guesses
    playerGuesses.forEach((guess, rowIndex) => {
      const guessLetters = guess.split('');
      const targetLetters = currentWord.split('');
      const rowStatuses = Array(5).fill('absent');
      
      // First pass: mark correct positions
      guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
          rowStatuses[i] = 'correct';
          targetLetters[i] = null; // Mark as used
        }
      });
      
      // Second pass: mark present letters
      guessLetters.forEach((letter, i) => {
        if (rowStatuses[i] !== 'correct' && letter) {
          const targetIndex = targetLetters.indexOf(letter);
          if (targetIndex !== -1) {
            rowStatuses[i] = 'present';
            targetLetters[targetIndex] = null; // Mark as used
          }
        }
      });
      
      statuses[rowIndex] = rowStatuses;
    });
    
    return statuses;
  };

  const getWinnerMessage = () => {
    switch (winner) {
      case 'player':
        return '🎉 You Won!';
      case 'ai':
        return '🤖 AI Won!';
      case 'tie':
        return '🤝 It\'s a Tie!';
      default:
        return '';
    }
  };

  const getCurrentWordDef = () => {
    if (!currentWord || !wordList) return '';
    const wordEntry = wordList.find(entry => entry.word === currentWord);
    return wordEntry ? wordEntry.def : '';
  };

  return (
    <div className="ai-versus-mode">
      {/* Header */}
      <div className="ai-versus-header">
        <button className="back-button" onClick={onBackToMenu}>
          ← Back to Menu
        </button>
        <h1>AI vs Player</h1>
        {gameState === 'playing' && (
          <div className="game-timer">
            {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
          </div>
        )}
        <div className="spacer"></div>
      </div>

      {/* Setup Screen */}
      {gameState === 'setup' && (
        <div className="ai-setup-screen">
          <h2>Choose AI Difficulty</h2>
          <div className="difficulty-selector">
            {Object.entries(AI_DIFFICULTIES).map(([key, config]) => (
              <button
                key={key}
                className={`difficulty-button ${selectedDifficulty === key ? `selected ${key}` : ''}`}
                onClick={() => handleDifficultyChange(key)}
              >
                <span className="difficulty-name">{config.name}</span>
                <span className="difficulty-desc">{config.description}</span>
              </button>
            ))}
          </div>
          <button className="start-game-button" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      )}

      {/* Countdown Screen */}
      {gameState === 'countdown' && (
        <div className="countdown-screen">
          <h2>Get Ready!</h2>
          <div className="countdown-number">{countdown}</div>
        </div>
      )}

      {/* Game Screen */}
      {(gameState === 'playing' || gameState === 'finished') && (
        <div className="ai-versus-game">
          {/* Game Status */}
          {gameState === 'finished' && (
            <div className="game-result">
              <h2>{getWinnerMessage()}</h2>
              <p>The word was: <strong>{currentWord}</strong></p>
              <p className="word-definition">{getCurrentWordDef()}</p>
            </div>
          )}

          {/* Split Screen Game Boards */}
          <div className="game-boards">
            {/* AI Side */}
            <div className="ai-side">
              <AIBoard
                guesses={aiGuesses}
                isThinking={isThinking}
                difficulty={selectedDifficulty}
                status={aiStatus}
                gameStatus={aiGameStatus}
              />
              <div style={{fontSize: '12px', color: '#666'}}>
                AI Debug: {aiGuesses.length} guesses, Status: {aiGameStatus}, Thinking: {isThinking.toString()}
              </div>
            </div>

            {/* VS Divider */}
            <div className="vs-divider">
              <span>VS</span>
            </div>

            {/* Player Side */}
            <div className="player-side">
              <div className="player-header">
                <h3>You</h3>
                <div className="player-status">
                  <span>Guesses: {playerGuesses.length}/6</span>
                </div>
              </div>
              
              <Board 
                submittedGuesses={playerGuesses} 
                currentGuess={currentGuess} 
                statuses={createStatuses()}
                currentRow={playerGuesses.length}
              />
              <div style={{fontSize: '12px', color: '#666'}}>
                Player Debug: {playerGuesses.length} guesses, Current: "{currentGuess}", CurrentRow: {playerGuesses.length}
                <br/>Guesses: {JSON.stringify(playerGuesses)}
              </div>
              
              <Keyboard 
                keyStatuses={usedKeys} 
                onKey={handleKeyup}
              />
            </div>
          </div>

          {/* Game Controls */}
          {gameState === 'finished' && (
            <div className="game-controls">
              <button className="play-again-button" onClick={handlePlayAgain}>
                Play Again
              </button>
              <button className="back-to-menu-button" onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIVersusMode;