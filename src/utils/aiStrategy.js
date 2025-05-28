import { WORD_LENGTH } from './constants';

/**
 * AI Strategy implementation for Wordle AI versus mode
 * Uses the same word bank as the main game
 */

// Common starting words for different difficulty levels
const STARTING_WORDS = {
  easy: ['AROSE', 'ADIEU', 'AUDIO', 'ABOUT', 'PLACE'],
  medium: ['SLATE', 'CRANE', 'CRATE', 'TRACE', 'SLATE'],
  hard: ['SALET', 'REAST', 'CRATE', 'TRACE', 'SLATE']
};

/**
 * WordleAI class that implements different difficulty levels
 */
export class WordleAI {
  constructor(difficulty = 'medium', possibleWords = []) {
    this.difficulty = difficulty;
    this.allWords = possibleWords.map(entry => entry.word); // Extract words from pegawords format
    this.possibleWords = [...this.allWords];
    this.guessHistory = [];
    this.knownPositions = new Array(WORD_LENGTH).fill(null);
    this.knownLetters = new Set();
    this.excludedLetters = new Set();
    this.excludedPositions = new Map();
    this.isFirstGuess = true;
  }

  /**
   * Make the next guess based on current game state
   */
  async makeGuess() {
    // Simulate thinking time
    await this.simulateThinking();

    let guess;
    if (this.isFirstGuess) {
      guess = this.getStartingWord();
      this.isFirstGuess = false;
    } else {
      guess = this.selectBestGuess();
    }

    this.guessHistory.push(guess);
    return guess;
  }

  /**
   * Update AI's knowledge based on feedback from a guess
   */
  updateFromFeedback(guess, feedback) {
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i];
      const status = feedback[i];

      switch (status) {
        case 'correct':
          this.knownPositions[i] = letter;
          this.knownLetters.add(letter);
          break;
        case 'present':
          this.knownLetters.add(letter);
          if (!this.excludedPositions.has(letter)) {
            this.excludedPositions.set(letter, []);
          }
          this.excludedPositions.get(letter).push(i);
          break;
        case 'absent':
          this.excludedLetters.add(letter);
          break;
      }
    }

    this.filterPossibleWords();
  }

  /**
   * Filter possible words based on current knowledge
   */
  filterPossibleWords() {
    this.possibleWords = this.possibleWords.filter(word => {
      // Check known positions
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (this.knownPositions[i] && word[i] !== this.knownPositions[i]) {
          return false;
        }
      }

      // Check known letters are present
      for (const letter of this.knownLetters) {
        if (!word.includes(letter)) {
          return false;
        }
      }

      // Check excluded letters
      for (const letter of this.excludedLetters) {
        if (word.includes(letter)) {
          return false;
        }
      }

      // Check excluded positions
      for (const [letter, positions] of this.excludedPositions) {
        for (const pos of positions) {
          if (word[pos] === letter) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Get starting word based on difficulty
   */
  getStartingWord() {
    const startingWords = STARTING_WORDS[this.difficulty];
    const availableStarters = startingWords.filter(word => this.allWords.includes(word));
    
    if (availableStarters.length > 0) {
      return availableStarters[Math.floor(Math.random() * availableStarters.length)];
    }
    
    // Fallback to random word from available words
    return this.allWords[Math.floor(Math.random() * this.allWords.length)];
  }

  /**
   * Select the best guess based on difficulty level
   */
  selectBestGuess() {
    if (this.possibleWords.length === 0) {
      return this.allWords[Math.floor(Math.random() * this.allWords.length)];
    }

    switch (this.difficulty) {
      case 'easy':
        return this.selectWithRandomness();
      case 'medium':
        return this.selectStrategically();
      case 'hard':
        return this.selectOptimally();
      default:
        return this.selectStrategically();
    }
  }

  /**
   * Easy AI: Pick with some randomness (makes mistakes)
   */
  selectWithRandomness() {
    if (Math.random() < 0.3) {
      // 30% chance to pick suboptimal word
      return this.possibleWords[Math.floor(Math.random() * this.possibleWords.length)];
    }
    return this.selectStrategically();
  }

  /**
   * Medium AI: Strategic but not perfect
   */
  selectStrategically() {
    // Prefer words with more common letters if we don't know much yet
    if (this.knownLetters.size < 2) {
      return this.selectWordWithCommonLetters();
    }
    
    // Otherwise pick from remaining possibilities
    return this.possibleWords[0];
  }

  /**
   * Hard AI: Near-optimal play
   */
  selectOptimally() {
    if (this.possibleWords.length <= 2) {
      return this.possibleWords[0];
    }

    // Try to pick word that eliminates the most possibilities
    return this.selectWordWithMaximumElimination();
  }

  /**
   * Select word with common letters (for early guesses)
   */
  selectWordWithCommonLetters() {
    const commonLetters = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R'];
    
    let bestWord = this.possibleWords[0];
    let bestScore = 0;

    for (const word of this.possibleWords.slice(0, 20)) { // Check first 20 to avoid lag
      let score = 0;
      const uniqueLetters = new Set(word);
      
      for (const letter of uniqueLetters) {
        const commonIndex = commonLetters.indexOf(letter);
        if (commonIndex !== -1) {
          score += (commonLetters.length - commonIndex);
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestWord = word;
      }
    }

    return bestWord;
  }

  /**
   * Select word that eliminates maximum possibilities
   */
  selectWordWithMaximumElimination() {
    if (this.possibleWords.length < 10) {
      return this.possibleWords[0];
    }

    let bestWord = this.possibleWords[0];
    let minMaxRemaining = this.possibleWords.length;

    // Check a subset to avoid performance issues
    const wordsToCheck = this.possibleWords.slice(0, Math.min(15, this.possibleWords.length));

    for (const candidateWord of wordsToCheck) {
      const maxRemaining = this.calculateMaxRemainingWords(candidateWord);
      if (maxRemaining < minMaxRemaining) {
        minMaxRemaining = maxRemaining;
        bestWord = candidateWord;
      }
    }

    return bestWord;
  }

  /**
   * Calculate maximum remaining words after a guess
   */
  calculateMaxRemainingWords(candidateWord) {
    const patterns = new Map();

    for (const possibleAnswer of this.possibleWords) {
      const pattern = this.getPattern(candidateWord, possibleAnswer);
      const patternKey = pattern.join('');
      patterns.set(patternKey, (patterns.get(patternKey) || 0) + 1);
    }

    return Math.max(...patterns.values());
  }

  /**
   * Get the pattern (feedback) for a guess against a target word
   */
  getPattern(guess, target) {
    const pattern = new Array(WORD_LENGTH).fill('absent');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');

    // Mark correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        pattern[i] = 'correct';
        targetLetters[i] = null;
        guessLetters[i] = null;
      }
    }

    // Mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] !== null) {
        const letterIndex = targetLetters.indexOf(guessLetters[i]);
        if (letterIndex !== -1) {
          pattern[i] = 'present';
          targetLetters[letterIndex] = null;
        }
      }
    }

    return pattern;
  }

  /**
   * Simulate thinking time based on difficulty
   */
  async simulateThinking() {
    const baseTime = this.getThinkingTime();
    const variance = Math.random() * 1000;
    const thinkingTime = baseTime + variance;
    
    return new Promise(resolve => setTimeout(resolve, thinkingTime));
  }

  /**
   * Get base thinking time based on difficulty
   */
  getThinkingTime() {
    const times = {
      easy: 2500,   // 2.5 seconds
      medium: 2000, // 2 seconds  
      hard: 1500    // 1.5 seconds
    };
    return times[this.difficulty] || times.medium;
  }

  /**
   * Reset the AI for a new game
   */
  reset(newPossibleWords = []) {
    if (newPossibleWords.length > 0) {
      this.allWords = newPossibleWords.map(entry => entry.word);
    }
    this.possibleWords = [...this.allWords];
    this.guessHistory = [];
    this.knownPositions = new Array(WORD_LENGTH).fill(null);
    this.knownLetters = new Set();
    this.excludedLetters = new Set();
    this.excludedPositions = new Map();
    this.isFirstGuess = true;
  }

  /**
   * Get current AI status
   */
  getStatus() {
    if (this.isFirstGuess) {
      return 'Ready';
    }
    return `${this.possibleWords.length} words left`;
  }
}

/**
 * Create a new AI instance
 */
export const createAI = (difficulty, possibleWords) => {
  return new WordleAI(difficulty, possibleWords);
};

/**
 * Difficulty configurations
 */
export const AI_DIFFICULTIES = {
  easy: {
    name: 'Easy',
    description: 'Makes occasional mistakes',
    color: '#4ade80'
  },
  medium: {
    name: 'Medium', 
    description: 'Balanced strategy',
    color: '#fbbf24'
  },
  hard: {
    name: 'Hard',
    description: 'Near-optimal play',
    color: '#ef4444'
  }
};