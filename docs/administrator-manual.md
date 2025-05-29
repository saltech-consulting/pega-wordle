# Pega Wordle Administrator Manual

This manual is designed for booth administrators running Pega Wordle at PegaWorld events and demonstrations.

## Quick Start Guide

### System Requirements
- Node.js (version 14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Laptop/computer for running the game server

### Setup Instructions
1. Open terminal/command prompt in the project directory
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open browser to http://localhost:5173
5. Game is ready for players!

### First Launch
- The game runs completely offline once started
- All player data is stored locally on your machine
- No internet connection required during gameplay

## Game Administration

### Starting the Game Server
```bash
npm run dev
```
The server will start on http://localhost:5173. Keep this terminal window open during your event.

### Stopping the Server
Press `Ctrl+C` in the terminal window to stop the server.

### Admin Panel Access

The admin panel provides comprehensive management tools for booth administrators:

**Accessing the Admin Panel:**

- While logged in with a `@saltech-consulting.com` email address, press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
- Admin panel opens as an overlay on the current game screen
- **Access restricted**: Only Saltech Consulting staff can access admin functions
- Other users will see "Admin access restricted to Saltech Consulting staff only" message

**Admin Panel Features:**

*Overview Tab:*

- Real-time statistics dashboard
- Total users, active players, games played
- Top 5 performers leaderboard
- Series completion metrics

*Users Tab:*

- Complete user management interface
- View all registered players with game statistics
- Individual user deletion (except current user)
- Bulk user selection and deletion
- Join dates and activity tracking

*Actions Tab:*

- Data management operations:
  - Clear All Scores: Reset leaderboard while keeping user accounts
  - Clear All Data: Complete reset of all game data
- Export functionality:
  - Download complete backup as JSON file
  - Includes users, scoreboards, and export timestamp

**Important Admin Notes:**

- Cannot delete the currently logged-in user
- All admin actions require confirmation
- Data export creates timestamped backup files
- Complete data clear requires app reload

### During Events
- Leave the terminal window open and running
- Players access the game through your laptop's browser
- Monitor the terminal for any error messages
- Game data persists between server restarts

### Troubleshooting Common Issues

**Server won't start:**
- Ensure Node.js is installed
- Run `npm install` to install dependencies
- Check if port 5173 is already in use

**Game appears broken:**
- Refresh the browser page
- Check browser console for errors (F12)
- Restart the development server

**Players can't access the game:**
- Verify the server is running (check terminal)
- Confirm correct URL: http://localhost:5173
- Try opening in a different browser

## Game Modes

### Standard Wordle Mode
- Default single-player experience
- 5-minute timer per game
- 6 attempts maximum
- Hint available on final guess
- Players compete in 3-game series

### AI Versus Mode
- Split-screen player vs AI gameplay
- AI uses intelligent strategy patterns
- Real-time head-to-head competition
- Both players see each other's progress

### Switching Between Modes
Players can switch modes using the navigation buttons in the game interface. No administrator action required.

## User Management

### Understanding User Profiles
- Players create profiles with email addresses
- All data stored locally on your machine
- Profiles persist between game sessions
- No personal data is transmitted anywhere

### Viewing Player Statistics
- Players can view their own stats in the game
- Series performance tracking
- Win/loss records maintained
- Leaderboard shows top performers

### Managing Leaderboards
- Leaderboards update automatically
- Based on series completion and performance
- Reset by clearing browser localStorage (see Technical Reference)

## Customization

### Updating the Word List
Edit `src/data/pegawords.json` to modify game vocabulary:

```json
{
  "word": "RULES",
  "def": "What Pega calls its reusable building blocks"
}
```

**Requirements:**
- Words must be exactly 5 letters
- Words must be uppercase
- Definitions should be ≤100 characters
- Each word must be unique

**After editing:**
- Development server will auto-reload
- For production builds, run `npm run build`

### Modifying Game Settings
Key settings in `src/utils/constants.js`:
- `WORD_LENGTH`: Number of letters (default: 5)
- `MAX_GUESSES`: Maximum attempts (default: 6)
- `GAME_TIME_MINUTES`: Timer duration (default: 5)

### Branding/Appearance Changes
- Main styles in `src/App.css`
- Component-specific styles in individual component files
- Colors, fonts, and layout can be customized

## Technical Reference

### File Structure Overview
```
src/
├── components/          # React components
├── data/               # Word lists and game data
├── hooks/              # Custom React hooks
├── logic/              # Core game mechanics
└── utils/              # Helper functions and constants
```

### Data Storage
All game data stored in browser's localStorage:
- `pega-wordle-users`: Player profiles
- `pega-wordle-active-user`: Current logged-in user
- `pega-wordle-user-scoreboards`: Game statistics

**To reset all data:** Open browser console (F12) and run:
```javascript
localStorage.clear()
```

### Building for Production
For offline deployment or distribution:
```bash
npm run build
```
This creates a `dist/` folder with all files needed to run the game.

### Development Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Check code quality
- `npm run preview`: Preview production build

## Support

For technical issues or questions:
- Check the browser console for error messages (F12)
- Verify all dependencies are installed (`npm install`)
- Ensure Node.js is properly installed
- Review this manual for common solutions

---

*Game designed for offline booth demonstrations at PegaWorld events.*