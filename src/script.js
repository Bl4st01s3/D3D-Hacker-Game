// --- SCI-FI / TECH DICTIONARY ---
const DICTIONARY = {
    4: ["CODE", "DATA", "NODE", "HACK", "TECH", "CORE", "BYTE", "WIFI", "DISK", "LINK", "CYAN", "TRON", "GRID"],
    5: ["ALIEN", "LASER", "ROBOT", "VIRUS", "CLONE", "SPACE", "LOGIC", "PROXY", "DRONE", "PULSE", "NEXUS"],
    6: ["CYBORG", "MATRIX", "HACKER", "SYSTEM", "ORACLE", "PLANET", "SERVER", "ENERGY", "PORTAL", "UPLOAD"],
    7: ["NETWORK", "ANDROID", "QUANTUM", "VIRTUAL", "DIGITAL", "WEBSITE", "ROBOTIC", "ENCRYPT", "CONSOLE"],
    8: ["TERMINAL", "DATABASE", "FIREWALL", "COMPUTER", "SOFTWARE", "HARDWARE", "INTERNET", "SPACESHIP", "MAINFRAM"],
    9: ["ALGORITHM", "SATELLITE", "CYBERPUNK", "INTERFACE", "PROCESSOR", "EMULATOR", "FRAMEWORK", "MEGABYTES"],
    10: ["HYPERDRIVE", "MULTIVERSE", "CYBERSPACE", "RESOLUTION", "TECHNOLOGY", "CONNECTION", "MOTHERBOARD"]
};

// --- GAME STATE ---
let currentWordLength = 4;
let targetWord = "";
let currentWordBaseScore = 100;

// Set to track hints we've already given points for this round
// Keys will be "index-letter" for greens, and "letter" for yellows
let revealedHints = new Set();

let scores = {}; // username -> score

// --- DOM ELEMENTS ---
const puzzleGrid = document.getElementById('puzzle-grid');
const guessList = document.getElementById('guess-list');
const scoreList = document.getElementById('score-list');
const wordLengthDisplay = document.getElementById('word-length-display');

// --- CORE LOGIC ---

function initRound() {
    // Pick a word
    const words = DICTIONARY[currentWordLength] || DICTIONARY[10];
    targetWord = words[Math.floor(Math.random() * words.length)].toUpperCase();

    // Set base score
    currentWordBaseScore = 100 + ((currentWordLength - 4) * 50);

    // Reset round state
    revealedHints.clear();
    puzzleGrid.innerHTML = '';
    guessList.innerHTML = '';

    wordLengthDisplay.textContent = currentWordLength;

    // Render initial empty row
    renderEmptyRow();

    console.log("New round started! Target:", targetWord, "Base Score:", currentWordBaseScore);
}

function renderEmptyRow() {
    const row = document.createElement('div');
    row.className = 'guess-row';
    for(let i = 0; i < currentWordLength; i++) {
        const box = document.createElement('div');
        box.className = 'letter-box empty';
        row.appendChild(box);
    }
    puzzleGrid.appendChild(row);
}

function processGuess(username, guess) {
    guess = guess.toUpperCase();

    if (guess.length !== currentWordLength) return; // Ignore invalid lengths

    const row = document.createElement('div');
    row.className = 'guess-row';

    let isCorrect = guess === targetWord;
    let guessPoints = 0;

    // Count letter occurrences in target word for accurate yellow hints
    let targetLetterCounts = {};
    for (let char of targetWord) {
        targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
    }

    // Array to hold evaluations: 'green', 'yellow', 'grey'
    let evaluations = new Array(currentWordLength).fill('grey');

    // First pass: check for Greens
    for (let i = 0; i < currentWordLength; i++) {
        if (guess[i] === targetWord[i]) {
            evaluations[i] = 'green';
            targetLetterCounts[guess[i]]--;

            const hintKey = `green-${i}-${guess[i]}`;
            if (!revealedHints.has(hintKey)) {
                revealedHints.add(hintKey);
                guessPoints += 10;
                currentWordBaseScore = Math.max(50, currentWordBaseScore - 10);
            }
        }
    }

    // Second pass: check for Yellows
    for (let i = 0; i < currentWordLength; i++) {
        if (evaluations[i] === 'grey' && targetLetterCounts[guess[i]] > 0) {
            evaluations[i] = 'yellow';
            targetLetterCounts[guess[i]]--;

            const hintKey = `yellow-${guess[i]}`;
            if (!revealedHints.has(hintKey)) {
                revealedHints.add(hintKey);
                guessPoints += 5;
                currentWordBaseScore = Math.max(50, currentWordBaseScore - 5);
            }
        }
    }

    // Add points for guess hints
    if (guessPoints > 0) {
        addScore(username, guessPoints);
    }

    // Render the row
    for (let i = 0; i < currentWordLength; i++) {
        const box = document.createElement('div');
        box.className = `letter-box ${evaluations[i]}`;
        box.textContent = guess[i];
        row.appendChild(box);
    }

    // Append to grid, replace empty row if it exists
    if (puzzleGrid.lastChild && puzzleGrid.lastChild.firstChild.classList.contains('empty')) {
        puzzleGrid.removeChild(puzzleGrid.lastChild);
    }
    puzzleGrid.appendChild(row);

    // Add to guess bank
    addGuessToBank(username, guess, evaluations);

    // Ensure an empty row is at the bottom if not won
    if (!isCorrect) {
        renderEmptyRow();
    } else {
        // Correct guess!
        clearInterval(timerInterval); // Stop the timer so it doesn't timeout during pause
        console.log(`${username} cracked the code! Payout: ${currentWordBaseScore}`);
        addScore(username, currentWordBaseScore);

        // Progress level
        if (currentWordLength < 10) {
            currentWordLength++;
        }

        // Brief pause then next round
        setTimeout(() => {
            initRound();
        }, 3000);
    }
}

function addScore(username, points) {
    scores[username] = (scores[username] || 0) + points;
    updateLeaderboard();
}

function updateLeaderboard() {
    scoreList.innerHTML = '';
    // Sort scores descending
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    for (let [user, score] of sortedScores) {
        const li = document.createElement('li');
        li.className = 'score-entry';
        li.innerHTML = `<span class="player-name">${user}</span> <span class="player-score">${score}</span>`;
        scoreList.appendChild(li);
    }
}

function addGuessToBank(username, guess, evaluations) {
    const li = document.createElement('li');
    li.className = 'guess-entry';

    // Colorize the guess word
    let coloredGuess = '';
    for(let i=0; i<guess.length; i++) {
        let color = 'var(--text-color)';
        if(evaluations[i] === 'green') color = 'var(--green)';
        else if (evaluations[i] === 'yellow') color = 'var(--yellow)';
        else color = 'var(--grey)';

        coloredGuess += `<span style="color: ${color}">${guess[i]}</span>`;
    }

    li.innerHTML = `<span class="player">${username}:</span> <span class="word">${coloredGuess}</span>`;
    guessList.appendChild(li);

    // Auto scroll
    guessList.scrollTop = guessList.scrollHeight;
}

// Start game initially
initRound();

// --- TIMER & RESET MECHANICS ---
const ROUND_TIME_SECONDS = 90;
let timeRemaining = ROUND_TIME_SECONDS;
let timerInterval = null;
const timerDisplay = document.getElementById('timer-display');

function startTimer() {
    clearInterval(timerInterval);
    timeRemaining = ROUND_TIME_SECONDS;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = timeRemaining;
    if (timeRemaining <= 10) {
        timerDisplay.style.color = 'red';
        timerDisplay.style.textShadow = '0 0 10px red';
    } else {
        timerDisplay.style.color = '';
        timerDisplay.style.textShadow = '';
    }
}

function handleTimeOut() {
    clearInterval(timerInterval);
    console.log("Time out! Restarting level...");

    // Show correct word briefly before restarting
    const row = document.createElement('div');
    row.className = 'guess-row';
    for (let i = 0; i < currentWordLength; i++) {
        const box = document.createElement('div');
        box.className = 'letter-box green';
        box.textContent = targetWord[i];
        row.appendChild(box);
    }

    if (puzzleGrid.lastChild && puzzleGrid.lastChild.firstChild.classList.contains('empty')) {
        puzzleGrid.removeChild(puzzleGrid.lastChild);
    }
    puzzleGrid.appendChild(row);

    setTimeout(() => {
        initRound(); // Re-init with same length
    }, 3000);
}

// Hook timer into initRound
const originalInitRound = initRound;
initRound = function() {
    originalInitRound();
    startTimer();
};

// Call startTimer initially since initRound was already called before hooking
startTimer();

function resetGame() {
    console.log("SYSTEM RESET INITIATED");
    currentWordLength = 4;
    initRound();
}

// --- TWITCH CHAT & TEST MODE INTEGRATION ---

const urlParams = new URLSearchParams(window.location.search);
const channelName = urlParams.get('channel');
const isTestMode = urlParams.get('test') === 'true';

// Setup Test Mode UI
if (isTestMode) {
    const testFooter = document.getElementById('test-mode-footer');
    const testInput = document.getElementById('test-input');
    const testSubmit = document.getElementById('test-submit');

    testFooter.style.display = 'flex';

    function handleTestSubmit() {
        const val = testInput.value.trim();
        if (!val) return;

        if (val.toLowerCase() === '!reset') {
            resetGame();
        } else {
            // Simulate chat message from Streamer
            processGuess('STREAMER', val);
        }
        testInput.value = '';
        testInput.focus();
    }

    testSubmit.addEventListener('click', handleTestSubmit);
    testInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleTestSubmit();
    });
}

// Setup tmi.js
if (channelName) {
    const client = new tmi.Client({
        channels: [channelName]
    });

    client.connect().catch(console.error);

    client.on('message', (channel, tags, message, self) => {
        if (self) return;

        const text = message.trim();

        // Handle streamer commands
        if (text.toLowerCase() === '!reset' && (tags.badges?.broadcaster || tags.mod || channelName.toLowerCase() === tags.username.toLowerCase())) {
            resetGame();
            return;
        }

        // Treat as guess if matches length and has no spaces
        if (text.length === currentWordLength && !text.includes(' ')) {
            processGuess(tags['display-name'] || tags.username, text);
        }
    });

    console.log(`Connected to Twitch channel: ${channelName}`);
} else if (!isTestMode) {
    console.warn("No channel provided. Add ?channel=YOUR_NAME to the URL.");
}
