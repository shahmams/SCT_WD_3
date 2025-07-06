// Game State Variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'pvc'
let difficulty = 'easy'; // 'easy' or 'hard'
let playAs = 'first'; // 'first' or 'second'
let scores = { x: 0, o: 0, draw: 0 };

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const resetButton = document.getElementById('reset-btn');
const pvpButton = document.getElementById('pvp-btn');
const pvcButton = document.getElementById('pvc-btn');
const pvcOptions = document.getElementById('pvc-options');
const easyButton = document.getElementById('easy-btn');
const hardButton = document.getElementById('hard-btn');
const firstButton = document.getElementById('first-btn');
const secondButton = document.getElementById('second-btn');
const xWinsElement = document.getElementById('x-wins');
const oWinsElement = document.getElementById('o-wins');
const drawsElement = document.getElementById('draws');
const moveSound = document.getElementById('move-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');

// Winning Conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// Initialize the game
function initGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    updateStatusMessage();
    renderBoard();
    
    // If playing against computer and computer goes first, make its move
    if (gameMode === 'pvc' && playAs === 'second') {
        setTimeout(() => makeComputerMove(), 500);
    }
}

// Update the status message
function updateStatusMessage() {
    if (gameActive) {
        statusMessage.textContent = `Player ${currentPlayer}'s turn`;
    } else {
        const winner = checkWinner();
        if (winner) {
            statusMessage.textContent = `Player ${winner} wins!`;
        } else {
            statusMessage.textContent = "Game ended in a draw!";
        }
    }
}

// Render the board
function renderBoard() {
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.className = 'cell';
        if (board[index] === 'X') cell.classList.add('x');
        if (board[index] === 'O') cell.classList.add('o');
    });
}

// Handle cell click
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.getAttribute('data-index'));
    
    // If cell is already filled or game is not active, ignore the click
    if (board[cellIndex] !== '' || !gameActive) return;
    
    // Make the move
    makeMove(cellIndex, currentPlayer);
    
    // If playing against computer and game is still active, make computer move
    if (gameMode === 'pvc' && gameActive) {
        setTimeout(() => makeComputerMove(), 500);
    }
}

// Make a move
function makeMove(index, player) {
    board[index] = player;
    playSound(moveSound);
    
    // Check for winner or draw
    const winner = checkWinner();
    if (winner) {
        handleGameEnd(winner);
    } else if (isBoardFull()) {
        handleGameEnd(null);
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatusMessage();
    }
    
    renderBoard();
}

// Check for winner
function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            // Highlight winning cells
            condition.forEach(index => cells[index].classList.add('win'));
            return board[a];
        }
    }
    return null;
}

// Check if board is full
function isBoardFull() {
    return board.every(cell => cell !== '');
}

// Handle game end
// Add these at the top with other DOM elements
const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay';
const modalContent = document.createElement('div');
modalContent.className = 'modal-content';
modalOverlay.appendChild(modalContent);
document.body.appendChild(modalOverlay);

// Updated handleGameEnd function
function handleGameEnd(winner) {
    gameActive = false;
    
    // Show modal
    modalContent.innerHTML = `
        <h2>${winner ? `Player ${winner} Wins!` : "It's a Draw!"}</h2>
        <button class="modal-button">Continue</button>
    `;
    
    modalOverlay.classList.add('active');
    
    // Play sound
    if (winner) playSound(winSound);
    else playSound(drawSound);
    
    // Reset game when Continue is clicked
    modalContent.querySelector('.modal-button').addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        initGame();
    });
}


// Make computer move
function makeComputerMove() {
    if (!gameActive) return;
    
    let move;
    if (difficulty === 'hard') {
        move = findBestMove();
    } else {
        move = findRandomMove();
    }
    
    if (move !== -1) {
        makeMove(move, currentPlayer);
    }
}

// Find a random valid move
function findRandomMove() {
    const emptyCells = board.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    
    if (emptyCells.length === 0) return -1;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Find best move using Minimax algorithm
function findBestMove() {
    // If board is empty, return center for optimal start
    if (board.every(cell => cell === '')) return 4;
    
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = currentPlayer;
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const winner = checkWinner();
    
    if (winner === currentPlayer) return 10 - depth;
    if (winner === (currentPlayer === 'X' ? 'O' : 'X')) return depth - 10;
    if (isBoardFull()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = currentPlayer;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = currentPlayer === 'X' ? 'O' : 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Update scoreboard
function updateScoreboard() {
    xWinsElement.textContent = scores.x;
    oWinsElement.textContent = scores.o;
    drawsElement.textContent = scores.draw;
}

// Play sound
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', initGame);

// Game mode selection
pvpButton.addEventListener('click', () => {
    gameMode = 'pvp';
    pvpButton.classList.add('active');
    pvcButton.classList.remove('active');
    pvcOptions.classList.add('hidden');
    initGame();
});

pvcButton.addEventListener('click', () => {
    gameMode = 'pvc';
    pvcButton.classList.add('active');
    pvpButton.classList.remove('active');
    pvcOptions.classList.remove('hidden');
    initGame();
});

// Difficulty selection
easyButton.addEventListener('click', () => {
    difficulty = 'easy';
    easyButton.classList.add('active');
    hardButton.classList.remove('active');
    initGame();
});

hardButton.addEventListener('click', () => {
    difficulty = 'hard';
    hardButton.classList.add('active');
    easyButton.classList.remove('active');
    initGame();
});

// Play as selection
firstButton.addEventListener('click', () => {
    playAs = 'first';
    firstButton.classList.add('active');
    secondButton.classList.remove('active');
    currentPlayer = 'X';
    initGame();
});

secondButton.addEventListener('click', () => {
    playAs = 'second';
    secondButton.classList.add('active');
    firstButton.classList.remove('active');
    currentPlayer = 'O';
    initGame();
});

// Initialize the game
initGame();