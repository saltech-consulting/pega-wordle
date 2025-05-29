# Pega-Wordle – Play it on Your Laptop

This guide will help you get the Pega-Wordle game running on your Windows or macOS laptop.

---

## 1 · One-Time Software Setup

Before you can run the game, you need to install Node.js. This is a software environment that Pega-Wordle needs to run. You only have to do this once on each computer.

1. **Install Node.js (version 20 LTS or newer):**  
   * **Windows:**  
     1. Open your web browser and go to <https://nodejs.org>.  
     2. Download the installer labelled **“20 LTS”** (Long-Term Support).  
     3. Run the installer and accept the defaults.  
   * **macOS:**  
     * **Option 1 (Homebrew users):**  
       1. Open **Terminal** (⌘ + Space → “Terminal”).  
       2. Run `brew install node`.  
     * **Option 2 (standard installer):**  
       1. Visit <https://nodejs.org>.  
       2. Download the macOS **20 LTS** `.pkg` file.  
       3. Run the installer and follow the prompts.

2. **Restart your computer.** This ensures the `node` and `npm` commands are on your PATH.

3. **Verify the installation (recommended):**
   ```bash
   node -v   # should start with v20
   npm  -v   # should print a matching npm version
   ```

---

## 2 Get the Game Files

1. **Download the project:**

   * On the Pega-Wordle GitHub page, click **< > Code → Download ZIP**.

2. **Unzip the files:**

   * Extract the ZIP to a convenient location, e.g. `Documents/pega-wordle`.

---

## 🔄 Updating to the Latest Version

If there's a newer version of the game available on GitHub, follow these steps to update your local copy:

### Method 1: Simple Download (Recommended for most users)

1. **Back up your current game data (if desired):**
   * Before updating, your game data is stored in your browser's local storage
   * This includes user profiles, scores, and game history
   * **Note:** This data will persist even after updating the game files

2. **Download the latest version:**
   * Go to the Pega-Wordle GitHub page
   * Click **< > Code → Download ZIP** to get the latest version

3. **Replace your old files:**
   * Delete your current `pega-wordle` folder
   * Extract the new ZIP to the same location
   * Your game data will automatically be available when you start the updated game

4. **Install any new dependencies:**
   ```bash
   cd path/to/pega-wordle
   npm install
   ```

5. **Start the updated game:**
   ```bash
   npm run dev
   ```

### Method 2: Using Git (For technical users)

If you're comfortable with Git commands:

1. **Navigate to your game folder:**
   ```bash
   cd path/to/pega-wordle
   ```

2. **Pull the latest changes:**
   ```bash
   git pull origin main
   ```

3. **Install any new dependencies:**
   ```bash
   npm install
   ```

4. **Start the updated game:**
   ```bash
   npm run dev
   ```

### ✅ Checking Your Version

To see what version you're running, look for the latest commit hash in your browser's developer console, or check the GitHub repository's latest commits to compare.

---

## 4 Run the Game

1. **Open a command-line window:**

   * **Windows:** Start → type `cmd` → Enter.
   * **macOS:** ⌘ + Space → type `Terminal` → Enter.

2. **Navigate to the game folder:**

   ```bash
   cd path/to/pega-wordle
   ```

3. **Install dependencies (first time only):**

   ```bash
   npm install
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   * Note the `http://localhost:5173` (or similar) address printed.

5. **Play Pega-Wordle:**

   * Open a browser and visit the `localhost` address from step 4.

6. **(Optional) Build a standalone offline copy:**

   * Stop the dev server (`Ctrl + C`).
   * Run:

     ```bash
     npm run build
     ```
   * Copy the new `dist` folder to any computer and open `dist/index.html` in a browser—no Node.js or internet required.

**To stop the game server:**
Press `Ctrl + C` in the command-line window (confirm with `y` if prompted). Close the window when done.

---

## 5 · Administrator Manual

For booth administrators and event organizers, a comprehensive administrator manual is available at [`docs/administrator-manual.md`](docs/administrator-manual.md). This manual covers:

- Complete setup and deployment instructions
- Admin panel access and features (restricted to `@saltech-consulting.com` users)
- User management and data administration
- Troubleshooting and technical reference
- Customization options for booth demonstrations

---

## 6 · Update the Word Bank

The list of valid solutions—and their on-screen hints—lives in **`src/data/pegawords.json`**. Each entry looks like this:

```json
{ "word": "RULES", "def": "What Pega calls its reusable building blocks" }
```

### Adding or editing words

1. Open `src/data/pegawords.json` in a text editor.
2. Insert, modify, or remove objects using the format above, following these rules:

   * **`word`** – 5 **UPPERCASE** letters, unique within the file.
   * **`def`** – a concise definition (≈ 1-2 lines, ≤ 100 characters).
3. Keep the JSON valid: comma-separate entries and avoid a trailing comma after the last one.
4. Save the file.

   * If `npm run dev` is running, the browser hot-reloads automatically.
   * Otherwise, restart the dev server or run `npm run build` again to include the updated list in the offline bundle.
