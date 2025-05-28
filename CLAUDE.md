# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:5173)
- **Build for production**: `npm run build` (creates `dist/` folder for offline deployment)
- **Lint code**: `npm run lint`
- **Preview production build**: `npm preview`
- **Install dependencies**: `npm install` (first-time setup)

## Project Architecture

This is a React-based Wordle game with Pega terminology, built for offline booth demonstrations at PegaWorld events.

### Key Architecture Components

**Game Logic Layer**:
- `src/logic/useWordle.js` - Core game mechanics, timer, and state management
- `src/utils/constants.js` - Game constants (word length, max guesses, tile statuses)
- Game states: IDLE → PLAYING → WON/LOST

**User Management**:
- `src/hooks/useUserProfile.js` - User authentication and profile management
- `src/utils/userProfileUtils.js` - localStorage-based user data persistence
- `src/utils/scoreboardUtils.js` - Series tracking and scoring logic
- Users play in 3-game series with performance tracking

**Data Management**:
- `src/data/pegawords.json` - Word bank with Pega terms and definitions
- Format: `{"word": "RULES", "def": "What Pega calls its reusable building blocks"}`
- All game data stored in localStorage (fully offline)

**Component Structure**:
- `src/App.jsx` - Main orchestrator managing user auth, game state, and UI routing
- `src/components/Board.jsx` - Game grid display
- `src/components/Keyboard.jsx` - Virtual keyboard with letter status
- `src/components/LoginForm.jsx` - User authentication interface
- `src/components/UserProfile.jsx` - Profile management and statistics

### Game Flow

1. User login/signup (email-based, stored locally)
2. Game starts in IDLE state, becomes PLAYING when user types first letter
3. 5-minute countdown timer, 6 attempts maximum
4. Hint available on final guess
5. Results tracked in user profile and series scoreboard
6. 3-game series system with performance metrics

### Data Persistence

All data stored in localStorage:
- User profiles: `pega-wordle-users`
- Active user: `pega-wordle-active-user`
- User scoreboards: `pega-wordle-user-scoreboards`

### Word List Management

Edit `src/data/pegawords.json` to update game vocabulary. Each entry requires:
- `word`: 5 uppercase letters, unique
- `def`: Concise definition (≤100 characters)

Hot-reload in development; rebuild for production deployment.