# Feature Request: AI Versus Mode

## Overview

Add a new competitive game mode where users play against an AI opponent in real-time, both trying to guess the same word simultaneously. This creates an engaging head-to-head experience that adds variety to the game while maintaining the core Wordle mechanics.

## Core Concept

- **Parallel Gameplay**: User and AI solve the same word side-by-side
- **Privacy Mechanics**: AI's letter guesses are hidden, only showing colored feedback
- **Real-time Competition**: See the AI make guesses as you play
- **Standalone Mode**: Separate from main game, doesn't affect leaderboard stats

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────┐
│              AI vs Player Mode              │
├─────────────────┬───────────────────────────┤
│                 │                           │
│   AI's Board    │    Player's Board         │
│                 │                           │
│  ┌─┬─┬─┬─┬─┐   │   ┌─┬─┬─┬─┬─┐           │
│  │?│?│?│?│?│   │   │ │ │ │ │ │           │
│  └─┴─┴─┴─┴─┘   │   └─┴─┴─┴─┴─┘           │
│  ┌─┬─┬─┬─┬─┐   │   ┌─┬─┬─┬─┬─┐           │
│  │?│?│?│?│?│   │   │ │ │ │ │ │           │
│  └─┴─┴─┴─┴─┘   │   └─┴─┴─┴─┴─┘           │
│                 │                           │
│  AI Status      │   [Virtual Keyboard]     │
│                 │                           │
└─────────────────┴───────────────────────────┘
```

### Key Visual Elements

1. **Split Screen Layout**
   - Left side: AI's game board
   - Right side: Player's game board
   - Clear visual separation between boards

2. **AI Board Display**
   - Show placeholder characters (? or ■) instead of actual letters
   - Display color feedback (green/yellow/gray) normally
   - Animate AI "thinking" between guesses
   - Show AI status: "Thinking...", "Guessed!", "Won!", "Lost"

3. **Player Board**
   - Standard Wordle interface
   - Virtual keyboard below
   - Normal letter display

4. **Game Header**
   - "AI vs Player" mode indicator
   - Timer (optional)
   - Current word number (if playing multiple rounds)

## AI Behavior

### Difficulty Levels

1. **Easy AI**
   - Makes occasional suboptimal guesses
   - 20% chance to pick a less common word
   - Average solve rate: 80%
   - Average attempts: 4.5

2. **Medium AI**
   - Uses frequency-based word selection
   - Follows basic Wordle strategy
   - Average solve rate: 90%
   - Average attempts: 3.8

3. **Hard AI**
   - Optimal information theory approach
   - Maximizes information gain per guess
   - Average solve rate: 95%
   - Average attempts: 3.3

### AI Strategy Implementation

```javascript
// Pseudo-code for AI logic
class WordleAI {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.possibleWords = [...];
    this.knownLetters = new Map();
    this.excludedLetters = new Set();
  }

  makeGuess() {
    // Filter possible words based on feedback
    this.filterPossibleWords();
    
    // Select word based on difficulty
    switch(this.difficulty) {
      case 'easy':
        return this.selectWithRandomness(0.2);
      case 'medium':
        return this.selectByFrequency();
      case 'hard':
        return this.selectByMaximumEntropy();
    }
  }

  simulateThinkingTime() {
    // Return delay in ms based on difficulty
    const baseTime = 1000;
    const variance = Math.random() * 500;
    return baseTime + variance;
  }
}
```

## User Experience Flow

1. **Mode Selection**
   - Add "Play vs AI" button on main menu
   - Select AI difficulty level
   - Optional: Choose number of rounds

2. **Game Start**
   - Both boards initialize empty
   - Countdown: "3... 2... 1... GO!"
   - Player can start typing immediately

3. **During Game**
   - AI makes guesses at realistic intervals (1-3 seconds)
   - Show "thinking" animation while AI processes
   - Real-time color feedback for both boards
   - Optional: Show AI's remaining possible words count

4. **Game End**
   - Display winner announcement
   - Show both solutions if AI won
   - Option to play again or return to menu
   - Display statistics (time taken, attempts)

## Technical Implementation

### Component Structure

```
src/
├── components/
│   ├── AIVersusMode.jsx       // Main container
│   ├── AIBoard.jsx            // AI's game board
│   ├── AIPlayer.jsx           // AI logic controller
│   └── VersusGameStats.jsx   // End game statistics
├── hooks/
│   └── useAIPlayer.js         // AI game logic hook
└── utils/
    ├── aiStrategy.js          // AI algorithms
    └── wordFrequency.js       // Word frequency data
```

### State Management

```javascript
const AIVersusGameState = {
  gameStatus: 'waiting' | 'playing' | 'playerWon' | 'aiWon' | 'tie',
  currentWord: string,
  aiDifficulty: 'easy' | 'medium' | 'hard',
  playerBoard: [...],
  aiBoard: [...],  // Store colors only, not letters
  aiGuessCount: number,
  playerGuessCount: number,
  startTime: Date,
  endTime: Date
};
```

### Key Features to Implement

1. **Asynchronous AI Moves**
   - Use setTimeout/setInterval for realistic timing
   - Add subtle animations during "thinking"
   - Ensure smooth UI updates

2. **Board Synchronization**
   - Both boards use same target word
   - Independent guess validation
   - Simultaneous win condition checking

3. **Privacy Protection**
   - Never expose AI's actual letter guesses in UI
   - Store AI guesses server-side or encrypted
   - Only transmit color feedback to display

## Additional Features (Future Enhancements)

1. **Tournament Mode**
   - Best of 3/5/7 rounds
   - Cumulative scoring
   - AI difficulty progression

2. **AI Personalities**
   - "Cautious Carl": Plays safe words
   - "Risky Rita": Goes for uncommon words
   - "Speedy Sam": Makes very fast guesses

3. **Spectator Mode**
   - Watch two AIs play against each other
   - Educational tool to learn strategies

4. **Achievements**
   - "David vs Goliath": Beat hard AI
   - "Speed Demon": Win in under 30 seconds
   - "Perfect Match": Tie with AI on same guess

## Benefits

1. **Increased Engagement**
   - New way to play for experienced users
   - Practice mode without affecting stats
   - Competitive element without multiplayer complexity

2. **Educational Value**
   - Learn optimal strategies by observing AI
   - Improve through competition
   - Immediate benchmark for performance

3. **Technical Showcase**
   - Demonstrates AI capabilities
   - Adds sophisticated feature with minimal server requirements
   - All processing can be client-side

## Success Metrics

- Percentage of users trying AI mode
- Average session length in AI mode
- Replay rate for AI matches
- User feedback on difficulty balance
- Feature usage retention over time

## Development Phases

### Phase 1: MVP (2-3 weeks)
- Basic split-screen UI
- Single difficulty AI
- Core game mechanics
- Win/loss detection

### Phase 2: Enhanced AI (1-2 weeks)
- Three difficulty levels
- Improved AI algorithms
- Thinking animations
- Basic statistics

### Phase 3: Polish (1 week)
- Refined animations
- Sound effects
- Tutorial/onboarding
- Performance optimizations

## Open Questions

1. Should AI mode have its own word list or use the same as regular play?
2. Should we show a hint about AI's strategy after the game?
3. Should there be a "revenge" feature to replay the same word?
4. How should we handle the timer - count up or count down?
5. Should we track AI mode statistics separately for users?

---

*This feature would significantly enhance the Pega-Wordle experience by adding a competitive single-player mode that's both entertaining and educational, while maintaining the game's offline-first approach.*