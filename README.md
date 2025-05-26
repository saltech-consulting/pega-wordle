# Pega-Wordle – Play it on Your Laptop

This guide will help you get the Pega-Wordle game running on your Windows or macOS laptop.

## 1 · One-Time Software Setup

Before you can run the game, you need to install Node.js. This is a software environment that Pega-Wordle needs to run. You only need to do this installation step once.

1.  **Install Node.js (version 20 LTS or newer):**
    *   **Windows:**
        1.  Open your web browser and go to <https://nodejs.org>.
        2.  Download the installer labelled **“20 LTS”** (Long-Term Support).
        3.  Once downloaded, run the installer. Accept the default options by clicking "Next" through the steps, and then "Finish".
    *   **macOS:**
        *   **Option 1 (if you use Homebrew):**
            1.  Open the Terminal application (you can find it by searching "Terminal" in Spotlight - press Command (⌘) + Spacebar).
            2.  In the Terminal window, type `brew install node` and press Enter.
        *   **Option 2 (standard installer):**
            1.  Open your web browser and go to <https://nodejs.org>.
            2.  Download the macOS installer for the current **20 LTS** release (it will be a `.pkg` file).
            3.  Once downloaded, run the installer and follow the on-screen instructions.
2.  **Restart your computer.** This is the simplest way to ensure that the new software (Node.js and its `npm` tool) is recognized by your system. Alternatively, you can close and reopen any open Command Prompt (Windows) or Terminal (macOS) windows.

3.  **Verify the installation (recommended):**
    *   Open a new Command Prompt or Terminal window and run:
        ```bash
        node -v
        npm -v
        ```
        You should see versions starting with `v20` (or higher) for Node and a matching `npm` version.

## 2 · Get the Game Files

1.  **Download the game project:**
    *   You'll need the link to the Pega-Wordle GitHub page. If you don't have it, please ask your technical contact for it.
    *   On the GitHub page, look for a green button that says **< > Code**. Click on it.
    *   In the menu that appears, select **Download ZIP**.
2.  **Unzip the game files:**
    *   Your browser will download a ZIP file (likely into your *Downloads* folder).
    *   Locate this file and unzip it. Most operating systems let you do this by right-clicking the file and selecting an "Extract All..." or "Unzip" option.
    *   Extract the files to a memorable location on your computer, for example, inside your *Documents* folder. You can create a new folder named `pega-wordle` for this (e.g., path would be *Documents\pega-wordle* on Windows or *Documents/pega-wordle* on macOS).

## 3 · Run the Game

Now that you have Node.js installed and the game files downloaded, here's how to start the game:

1.  **Open your command line tool:**
    *   **Windows:** Press the Windows key (or click the Start button), type `cmd`, and press Enter. This will open the **Command Prompt**.
    *   **macOS:** Press Command (⌘) + Spacebar to open Spotlight search. Type `Terminal` and press Enter. This will open the **Terminal**.

2.  **Navigate to the game folder in the command line tool:**
    *   In the Command Prompt or Terminal window, type `cd ` (note the space after `cd`).
    *   Now, find the `pega-wordle` folder that you unzipped in Step 2 (e.g., in your *Documents* folder). Drag this folder from your file explorer directly into the Command Prompt or Terminal window. This should paste the correct file path automatically.
    *   Alternatively, you can type the path manually. For example:
        *   On Windows, if you extracted it to *Documents\pega-wordle*, type: `cd Documents\pega-wordle`
        *   On macOS, if you extracted it to *Documents/pega-wordle*, type: `cd Documents/pega-wordle`
    *   Press Enter. The command line prompt should change to show you are now in the `pega-wordle` directory.

3.  **Install game dependencies:**
    *   This step tells your computer to download some additional small packages that the game needs to work. You generally only need to do this once after downloading the game files.
    *   In the Command Prompt or Terminal (ensure you are still in the `pega-wordle` directory), type the following command exactly and press Enter:
        ```bash
        npm install
        ```
    *   Wait for this command to finish. It might take a minute or two, and you'll see some text scrolling by.

4.  **Start the game server:**
    *   Once `npm install` is complete, type the following command exactly and press Enter:
        ```bash
        npm run dev
        ```
    *   This command starts a local web server on your computer that will serve the game. You should see some messages in the command line window, including one that looks like:
        `Local: http://localhost:5173`
        (The number after `localhost:` might be different, like `3000` or `8080`. This is normal.)

5.  **Play Pega-Wordle:**
    *   Open your preferred web browser (such as Chrome, Edge, Firefox, or Safari).
    *   Copy the `http://localhost:XXXX` address shown in your Command Prompt or Terminal (e.g., `http://localhost:5173`).
    *   Paste this address into your browser's address bar and press Enter.
    *   The Pega-Wordle game should now load and be ready to play!

6.  **(Optional) Build a standalone offline copy:**
    *   If you need to transfer the game to a machine that **doesn’t have Node.js installed**, you can create a static build that runs by simply opening an HTML file.
    *   In the same command-line window, press `Ctrl + C` to stop the dev server (if it’s still running), then run:
        ```bash
        npm run build
        ```
    *   When the build finishes, a new `dist` folder appears. Copy this folder to the target computer (e.g., a booth laptop) and open `dist/index.html` in any modern browser — **no server or internet connection required**.

**To stop the game server:**
*   Go back to the Command Prompt or Terminal window where you ran `npm run dev`.
*   Press `Ctrl + C` (hold down the Ctrl key and press C). You might be asked to confirm; if so, type `y` and press Enter.
*   You can close the command line window. The game will no longer be accessible in your browser until you start the server again (using `npm run dev` from the game folder).

## 4 · Update the Word Bank

Pega-Wordle’s list of valid solutions (and their on-screen hints) lives in
`src/data/pegawords.json`. Each object has two keys:

