/**
 * Word Bank Manager
 * Handles different word banks for main game vs AI mode
 */

// Cache for loaded word banks to avoid repeated imports
const wordBankCache = new Map();
const validationCache = new Map();

export class WordBankManager {
  /**
   * Get word bank for specified mode
   * @param {string} mode - 'main' or 'ai'
   * @returns {Promise<Object>} Word bank configuration
   */
  static async getWordBank(mode = 'main') {
    if (wordBankCache.has(mode)) {
      return wordBankCache.get(mode);
    }

    let wordBank;
    
    switch(mode) {
      case 'ai':
        try {
          const aiWords = await import('./ai-words.json');
          wordBank = {
            words: aiWords.default,
            hasValidation: true,
            hasDefinitions: false,
            count: aiWords.default.length,
            mode: 'ai'
          };
        } catch (error) {
          console.error('Failed to load AI word bank:', error);
          // Fallback to main word bank
          const pegaWords = await import('./pegawords.json');
          wordBank = {
            words: pegaWords.default,
            hasValidation: false,
            hasDefinitions: true,
            count: pegaWords.default.length,
            mode: 'main'
          };
        }
        break;
        
      case 'main':
      default:
        const pegaWords = await import('./pegawords.json');
        wordBank = {
          words: pegaWords.default,
          hasValidation: false,
          hasDefinitions: true,
          count: pegaWords.default.length,
          mode: 'main'
        };
        break;
    }

    wordBankCache.set(mode, wordBank);
    return wordBank;
  }

  /**
   * Get optimized word set for fast validation
   * @param {string} mode - 'main' or 'ai' 
   * @returns {Promise<Set>} Set of valid words
   */
  static async getWordSet(mode = 'main') {
    const cacheKey = `${mode}_set`;
    
    if (validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey);
    }

    const wordBank = await this.getWordBank(mode);
    const wordSet = new Set(
      wordBank.words.map(item => 
        typeof item === 'string' ? item.toUpperCase() : item.word.toUpperCase()
      )
    );

    validationCache.set(cacheKey, wordSet);
    return wordSet;
  }

  /**
   * Validate if a word is in the word bank
   * @param {string} word - Word to validate
   * @param {string} mode - 'main' or 'ai'
   * @returns {Promise<boolean>} Whether word is valid
   */
  static async isValidWord(word, mode = 'main') {
    if (mode !== 'ai') {
      // No validation for main game - allow any 5-letter word
      return word.length === 5 && /^[A-Z]+$/i.test(word);
    }
    
    try {
      const wordSet = await this.getWordSet(mode);
      return wordSet.has(word.toUpperCase());
    } catch (error) {
      console.error('Word validation failed:', error);
      // Fallback: allow word if validation fails
      return true;
    }
  }

  /**
   * Get a random word from the word bank
   * @param {string} mode - 'main' or 'ai'
   * @returns {Promise<string|Object>} Random word
   */
  static async getRandomWord(mode = 'main') {
    const wordBank = await this.getWordBank(mode);
    const randomIndex = Math.floor(Math.random() * wordBank.words.length);
    return wordBank.words[randomIndex];
  }

  /**
   * Get word bank statistics
   * @param {string} mode - 'main' or 'ai'
   * @returns {Promise<Object>} Statistics
   */
  static async getStats(mode = 'main') {
    const wordBank = await this.getWordBank(mode);
    return {
      mode: wordBank.mode,
      wordCount: wordBank.count,
      hasDefinitions: wordBank.hasDefinitions,
      hasValidation: wordBank.hasValidation,
      cacheSize: wordBankCache.size + validationCache.size
    };
  }

  /**
   * Clear all caches (useful for testing)
   */
  static clearCache() {
    wordBankCache.clear();
    validationCache.clear();
  }
}

// Legacy exports for backward compatibility
export const getWordBank = WordBankManager.getWordBank;
export const isValidWord = WordBankManager.isValidWord;
export const getRandomWord = WordBankManager.getRandomWord;

export default WordBankManager;