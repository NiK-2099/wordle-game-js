// GAME STATE
let words = [];
let answer = "";
let score = 0;

let currentRow = 0;
let currentGuess = "";
const maxRows = 6;
const wordLength = 6;

// Loads words from text file and assigns one in "answer" variable with Math.Random
async function loadWords() {
    const res = await fetch("resources/wordle-6letter-words.txt");
    const text = await res.text();

    words = text
        .split("\n")
        .map(w => w.trim())
        .filter(w => w.length > 0);
}

// Creates dynamic grid based on rows & col. grid is edited in css #grid
function createGrid() {
    const grid = document.getElementById("grid");

    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < wordLength; col++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.dataset.row = row;
            tile.dataset.col = col;
            grid.appendChild(tile);
        }
    }
}

// Creates tiles functionality
function getTile(row, col) {
    return document.querySelector(
        `.tile[data-row='${row}'][data-col='${col}']`
    );
}

// Handles keyboard input function
document.addEventListener("keydown", handleKey);

function handleKey(e) {

    if (currentRow >= maxRows) return;

    if (e.key === "Backspace") {
        removeLetter();
        updateTiles();
    }
    else if (e.key === "Enter") {
        e.preventDefault(); // stop form/button default behavior
        e.stopPropagation(); // stop other handlers

        submitGuess();
    }

    else if (/^[a-zA-Z]$/.test(e.key)) {
        addLetter(e.key.toLowerCase());
        updateTiles();
    }
}

// Adding and removing letter function
function addLetter(letter) {
    if (currentGuess.length >= wordLength) return;

    currentGuess += letter;
    updateTiles();
}

function removeLetter() {
    currentGuess = currentGuess.slice(0, -1);
    updateTiles();
}

// Update grid display function
function updateTiles() {
    for (let col = 0; col < wordLength; col++) {
        const tile = getTile(currentRow, col);
        tile.textContent = currentGuess[col] || "";
    }
}

// Submit function. Checks for wordlength, correct/false inputs. Increments row and ends game on max row. Shows end-message.
function submitGuess() {
    if (!roundActive) return; // 🚫 prevents spam
    if (currentGuess.length !== wordLength) {
        showMessage("Enter 6 letters");
        return;
    }

    // if (!words.includes(currentGuess)) {
    //     showMessage("Not in dictionary");
    //     return;
    // }

    checkGuess(currentGuess);
    if (currentGuess === answer) {
        // showWord("win");
        score++;
        showMessage("You win!");
        document.getElementById("guessBtn").disabled = true;
        roundActive = false; // 🔒 lock round
        scoreCounter();
        return;
    }

    currentRow++;
    currentGuess = "";

    if (currentRow === maxRows) {
        // showWord("lose");
        showMessage("Game Over! Word was: " + answer.toUpperCase());
        document.getElementById("guessBtn").disabled = true;
        roundActive = false; // 🔒 lock round
    }
}

// New game function
function newGame() {

    roundActive = true;
    document.getElementById("guessBtn").disabled = false;
    currentRow = 0;
    currentGuess = "";

    // Pick new word
    answer = words[Math.floor(Math.random() * words.length)];

    // Clear tiles
    const tiles = document.querySelectorAll(".tile");

    tiles.forEach(tile => {
        tile.textContent = "";
        tile.classList.remove("correct", "present", "absent");
    });

    // Clear message
    showMessage("");
    console.log("Answer:", answer.toUpperCase()); // debug
}

// Checks letters in guess word
function checkGuess(guess) {
    const result = new Array(wordLength).fill("absent");
    const counts = {};

    // count letters in answer
    for (let char of answer) {
        counts[char] = (counts[char] || 0) + 1;
    }

    // greens
    for (let i = 0; i < wordLength; i++) {
        if (guess[i] === answer[i]) {
            result[i] = "correct";
            counts[guess[i]]--;
        }
    }

    // yellows
    for (let i = 0; i < wordLength; i++) {
        if (result[i] === "correct") continue;

        if (counts[guess[i]] > 0) {
            result[i] = "present";
            counts[guess[i]]--;
        }
    }

    // apply classes
    for (let i = 0; i < wordLength; i++) {
        const tile = getTile(currentRow, i);
        tile.classList.add(result[i]);
    }
}

// Show message function
function showMessage(msg) {
    document.getElementById("message").textContent = msg;
}

// Score counter function
function scoreCounter() {
    document.getElementById("score").textContent =
        ("Score " + score);
}

// Show words function
// function showWord(color) {
//     const word = document.getElementById("words");
//     word.innerHTML = answer + "<br>" + word.innerHTML;
//     word.classList.remove("win", "lose"); // reset
//     word.classList.add(color); // "win" or "lose"
// }


// Init game
async function init() {
    scoreCounter();
    await loadWords();
    createGrid();
    newGame();
}

init();