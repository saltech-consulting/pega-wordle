# Dual Word Bank System Documentation

## Overview

The Pega-Wordle application now features a sophisticated dual word bank system that provides different vocabulary sets for the main educational game versus the AI versus mode, enhancing both educational value and gameplay challenge.

## System Architecture

### Word Bank Manager (`src/data/index.js`)

The `WordBankManager` class serves as the central coordinator for all word bank operations:

```javascript
import { WordBankManager } from '../data';

// Get word bank for specific mode
const wordBank = await WordBankManager.getWordBank('ai');    // or 'main'

// Validate words
const isValid = await WordBankManager.isValidWord('HELLO', 'ai');

// Get random words
const randomWord = await WordBankManager.getRandomWord('ai');

// Get statistics
const stats = await WordBankManager.getStats('ai');
```

### Word Banks

#### 1. Main Game Word Bank (`src/data/pegawords.json`)
- **Purpose**: Educational Pega terminology learning
- **Size**: ~300 words
- **Format**: `[{"word": "RULES", "def": "Pega rule container"}, ...]`
- **Features**: 
  - Includes definitions for hint system
  - No word validation (allows any 5-letter input)
  - Curated Pega-specific vocabulary

#### 2. AI Mode Word Bank (`src/data/ai-wordbank.json`)
- **Purpose**: Challenging AI versus gameplay
- **Size**: 14,855 words (160KB)
- **Format**: `["AAHED", "AALII", "AAPAS", ...]`
- **Features**:
  - Strict word validation
  - No definitions (not needed for AI mode)
  - Comprehensive English 5-letter word vocabulary

## Game Mode Behavior

### Main Game (Educational Mode)
```javascript
// No validation - accepts any 5-letter input
WordBankManager.isValidWord('ZZZZZ', 'main')  // → true

// Uses Pega words with definitions
const word = await WordBankManager.getRandomWord('main');
// → {word: "RULES", def: "Pega rule container"}
```

### AI Versus Mode
```javascript
// Strict validation against 14K+ words
WordBankManager.isValidWord('HELLO', 'ai')   // → true
WordBankManager.isValidWord('ZZZZZ', 'ai')   // → false

// Uses large vocabulary, plain words
const word = await WordBankManager.getRandomWord('ai');
// → "CRANE" (string only, no definition)
```

## Word Validation System

### AI Mode Validation Process

1. **User Input**: Player types 5-letter word and presses Enter
2. **Validation**: `WordBankManager.isValidWord(guess, 'ai')` called
3. **Feedback**:
   - **Valid**: Word processed normally, game continues
   - **Invalid**: Red shake toast shown, no guess consumed
4. **Caching**: Results cached for performance

### Performance Optimizations

- **Set-based Lookup**: O(1) word validation using JavaScript Sets
- **Smart Caching**: Word banks cached after first load
- **Lazy Loading**: AI word bank only loaded when needed
- **Memory Efficient**: Shared caches across game sessions

## User Interface Elements

### Validation Feedback

#### Invalid Word Toast
```css
.invalid-word-toast {
  /* Red background with shake animation */
  background: rgba(220, 38, 38, 0.9);
  animation: toast-appear 0.3s ease-out, shake 0.5s ease-in-out;
}
```

#### Validation Loading Indicator
```css
.validating-word-toast {
  /* Blue background with pulsing animation */
  background: rgba(59, 130, 246, 0.9);
  animation: pulse 1.5s ease-in-out infinite;
}
```

## Integration Points

### Component Updates

#### AIVersusMode.jsx
- Word validation in `processGuess()` function
- Async word selection using AI word bank
- Invalid word feedback state management

#### useAIPlayer.js
- AI initialization with large vocabulary
- Async word bank loading with fallback

#### App.css
- Validation toast styling and animations
- Mobile-responsive feedback elements

## Error Handling & Fallbacks

### Graceful Degradation
```javascript
try {
  // Attempt to use AI word bank
  const aiWordBank = await WordBankManager.getWordBank('ai');
  // ... use AI words
} catch (error) {
  console.error('Failed to load AI word bank, falling back:', error);
  // Fallback to Pega words
  const pegaWords = await WordBankManager.getWordBank('main');
  // ... use Pega words
}
```

### Common Failure Scenarios
- Network issues loading word bank
- Malformed JSON in word bank files
- Memory constraints with large vocabulary
- Browser compatibility with async/await

## Testing

### Test Suite (`src/data/test-wordbank.js`)
```javascript
import { testWordBankManager } from './src/data/test-wordbank.js';
await testWordBankManager();
```

### Test Coverage
- Word bank loading for both modes
- Word validation accuracy
- Random word generation
- Caching functionality
- Error handling scenarios

## Performance Metrics

### Bundle Impact
- **AI Word Bank**: 160KB additional load
- **Loading Time**: ~50ms on average connection
- **Memory Usage**: ~2MB for cached word sets
- **Validation Speed**: <1ms per word lookup

### Optimization Techniques
- Deferred loading until AI mode accessed
- Set-based data structures for fast lookups
- Shared caches across component instances
- Compressed JSON format

## Migration Notes

### Breaking Changes
- AI mode now requires valid English words
- Different random word format (string vs object)
- Async initialization for AI components

### Backward Compatibility
- Main game behavior unchanged
- Existing save data fully compatible
- Graceful fallback to original behavior

## Future Enhancements

### Potential Improvements
- Word frequency-based AI difficulty
- Custom word lists for different themes
- Offline word bank caching
- Word definition lookup API integration
- Advanced validation rules (no proper nouns, etc.)

### Performance Optimizations
- WebWorker-based validation for large batches
- IndexedDB caching for offline support
- Compression techniques for word bank storage
- Predictive loading based on user patterns

## Troubleshooting

### Common Issues

#### "Word bank failed to load"
- Check network connectivity
- Verify file paths are correct
- Ensure JSON format is valid

#### "Validation too slow"
- Check cache initialization
- Monitor memory usage
- Verify Set creation is working

#### "Invalid words being accepted"
- Confirm correct mode parameter
- Check word bank loading success
- Verify caching is working properly

### Debug Tools
```javascript
// Check word bank statistics
console.log(await WordBankManager.getStats('ai'));

// Clear caches for testing
WordBankManager.clearCache();

// Manual validation testing
console.log(await WordBankManager.isValidWord('TEST', 'ai'));
```