import { useState, useCallback, useRef } from 'react';
import { createAI } from '../utils/aiStrategy';
import { MAX_GUESSES } from '../utils/constants';

export const useAIPlayer = (difficulty, wordList, targetWord) => {
  const [aiGuesses, setAiGuesses] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, won, lost
  const [aiStatus, setAiStatus] = useState('Ready');
  
  const aiRef = useRef(null);
  const gameStartedRef = useRef(false);
  const targetWordRef = useRef(targetWord);
  const gameStatusRef = useRef(gameStatus);
  
  // Update the refs whenever values change
  targetWordRef.current = targetWord;
  gameStatusRef.current = gameStatus;

  /**
   * Initialize the AI player
   */
  const initializeAI = useCallback(() => {
    if (!wordList || wordList.length === 0) return;
    
    aiRef.current = createAI(difficulty, wordList);
    setAiGuesses([]);
    setGameStatus('idle');
    setAiStatus('Ready');
    setIsThinking(false);
    gameStartedRef.current = false;
  }, [difficulty, wordList]);

  /**
   * Start the AI game
   */
  const startAIGame = useCallback(async () => {
    if (!aiRef.current || gameStartedRef.current) return;
    
    gameStartedRef.current = true;
    setGameStatus('playing');
    
    // Start AI thinking for first move after a brief delay
    setTimeout(() => {
      makeAIGuess();
    }, 1000);
  }, []);

  /**
   * Make an AI guess
   */
  const makeAIGuess = useCallback(async () => {
    if (!aiRef.current || gameStatusRef.current === 'won' || gameStatusRef.current === 'lost') {
      return;
    }
    
    if (aiGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      setAiStatus('Lost');
      return;
    }
    
    setIsThinking(true);
    setAiStatus('Thinking...');
    
    try {
      // AI makes its guess
      const guess = await aiRef.current.makeGuess();
      
      if (!guess) {
        setIsThinking(false);
        return;
      }
      
      if (!targetWordRef.current) {
        setIsThinking(false);
        return;
      }

      // Calculate feedback for AI's guess
      const feedback = calculateFeedback(guess, targetWordRef.current);
      
      // Update AI's knowledge
      aiRef.current.updateFromFeedback(guess, feedback);
      
      // Create guess object for display (without revealing letters)
      const guessObj = {
        letters: guess.split(''), // We store letters but don't show them
        feedback: feedback,
        isRevealed: true
      };
      
      // Update AI guesses
      setAiGuesses(prev => {
        const newGuesses = [...prev, guessObj];
        return newGuesses;
      });
      
      // Check if AI won
      const isCorrect = feedback.every(status => status === 'correct');
      const guessCount = aiGuesses.length + 1;
      
      if (isCorrect) {
        setGameStatus('won');
        setAiStatus('Won!');
        setIsThinking(false);
        return;
      }
      
      // Check if AI lost (max guesses reached)
      if (guessCount >= MAX_GUESSES) {
        setGameStatus('lost');
        setAiStatus('Lost');
        setIsThinking(false);
        return;
      }
      
      // Update status and continue
      setAiStatus(aiRef.current.getStatus());
      setIsThinking(false);
      
      // Schedule next guess
      setTimeout(() => {
        if (gameStatusRef.current === 'playing') {
          makeAIGuess();
        }
      }, 500); // Brief pause between guesses
      
    } catch (error) {
      console.error('AI guess error:', error);
      setIsThinking(false);
      setAiStatus('Error');
    }
  }, [targetWord]);

  /**
   * Calculate feedback for a guess against target word
   */
  const calculateFeedback = (guess, target) => {
    const feedback = new Array(5).fill('absent');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');

    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        feedback[i] = 'correct';
        targetLetters[i] = null; // Mark as used
        guessLetters[i] = null; // Mark as used
      }
    }

    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] !== null) {
        const letterIndex = targetLetters.indexOf(guessLetters[i]);
        if (letterIndex !== -1) {
          feedback[i] = 'present';
          targetLetters[letterIndex] = null; // Mark as used
        }
      }
    }

    return feedback;
  };

  /**
   * Reset the AI game
   */
  const resetAI = useCallback(() => {
    if (aiRef.current) {
      aiRef.current.reset(wordList);
    }
    setAiGuesses([]);
    setGameStatus('idle');
    setAiStatus('Ready');
    setIsThinking(false);
    gameStartedRef.current = false;
  }, [wordList]);

  /**
   * Get AI statistics
   */
  const getAIStats = useCallback(() => {
    return {
      guesses: aiGuesses.length,
      status: gameStatus,
      isThinking,
      difficulty
    };
  }, [aiGuesses.length, gameStatus, isThinking, difficulty]);

  return {
    // State
    aiGuesses,
    isThinking,
    gameStatus,
    aiStatus,
    
    // Actions
    initializeAI,
    startAIGame,
    makeAIGuess,
    resetAI,
    getAIStats
  };
};