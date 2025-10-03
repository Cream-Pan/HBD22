// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const levelClearScreen = document.getElementById('level-clear-screen');
const finalClearScreen = document.getElementById('final-clear-screen');
const startButton = document.getElementById('start-button');
const nextStageButton = document.getElementById('next-stage-button');
const restartButton = document.getElementById('restart-button');
const stageNumberDisplay = document.getElementById('stage-number');
const puzzleDisplay = document.getElementById('puzzle-display');
const acquiredLetterDisplay = document.getElementById('acquired-letter');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
// Touch controls
const touchLeft = document.getElementById('touch-left');
const touchRight = document.getElementById('touch-right');
const touchJump = document.getElementById('touch-jump');


// --- Game Constants ---
const PUZZLE_WORD = "PUZZLE";
const GRAVITY = 0.6;
const PLAYER_SPEED = 5;
const JUMP_POWER = -12;

// --- Game State ---
let gameState = {
    currentStage: 0,
    collectedLetters: [],
    player: {
        x: 100,
        y: 100,
        width: 32,
        height: 48,
        vx: 0,
        vy: 0,
        onGround: false,
        color: '#ff6347' // Tomato
    },
    keys: {},
    gameLoopId: null,
    paused: false,
};

// --- Stages Data (内容は変更なし) ---
const stages = [
    // Stage 1
    {
        platforms: [
            { x: 0, y: 360, width: 800, height: 40, color: '#8b4513' },
            { x: 200, y: 280, width: 100, height: 20, color: '#d2691e' },
            { x: 400, y: 220, width: 100, height: 20, color: '#d2691e' },
            { x: 600, y: 160, width: 100, height: 20, color: '#d2691e' },
        ],
        goal: { x: 720, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 2
    {
        platforms: [
            { x: 0, y: 360, width: 200, height: 40, color: '#8b4513' },
            { x: 300, y: 300, width: 200, height: 20, color: '#d2691e' },
            { x: 600, y: 360, width: 200, height: 40, color: '#8b4513' },
            { x: 500, y: 200, width: 80, height: 20, color: '#d2691e' },
        ],
        goal: { x: 720, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 3
    {
        platforms: [
            { x: 0, y: 360, width: 100, height: 40, color: '#8b4513' },
            { x: 180, y: 320, width: 80, height: 20, color: '#d2691e' },
            { x: 350, y: 280, width: 80, height: 20, color: '#d2691e' },
            { x: 520, y: 240, width: 80, height: 20, color: '#d2691e' },
            { x: 700, y: 360, width: 100, height: 40, color: '#8b4513' },
        ],
        goal: { x: 730, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 4
    {
         platforms: [
            { x: 0, y: 360, width: 800, height: 40, color: '#8b4513' },
            { x: 100, y: 280, width: 30, height: 20, color: '#d2691e' },
            { x: 200, y: 220, width: 30, height: 20, color: '#d2691e' },
            { x: 300, y: 280, width: 30, height: 20, color: '#d2691e' },
            { x: 450, y: 180, width: 150, height: 20, color: '#d2691e' },
        ],
        goal: { x: 720, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 5
    {
        platforms: [
            { x: 0, y: 360, width: 150, height: 40, color: '#8b4513' },
            { x: 250, y: 300, width: 30, height: 20, color: '#d2691e' },
            { x: 350, y: 240, width: 30, height: 20, color: '#d2691e' },
            { x: 450, y: 180, width: 30, height: 20, color: '#d2691e' },
            { x: 550, y: 240, width: 30, height: 20, color: '#d2691e' },
            { x: 650, y: 300, width: 30, height: 20, color: '#d2691e' },
            { x: 750, y: 360, width: 50, height: 40, color: '#8b4513' },
        ],
        goal: { x: 755, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 6
    {
        platforms: [
            { x: 0, y: 360, width: 80, height: 40, color: '#8b4513' },
            { x: 120, y: 300, width: 80, height: 20, color: '#d2691e' },
            { x: 240, y: 240, width: 80, height: 20, color: '#d2691e' },
            { x: 360, y: 180, width: 80, height: 20, color: '#d2691e' },
            { x: 480, y: 240, width: 80, height: 20, color: '#d2691e' },
            { x: 600, y: 300, width: 80, height: 20, color: '#d2691e' },
            { x: 720, y: 360, width: 80, height: 40, color: '#8b4513' },
        ],
        goal: { x: 40, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
];

// --- Functions (内容はほぼ変更なし) ---
function showScreen(screenId) {
    [startScreen, gameScreen, levelClearScreen, finalClearScreen].forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function updatePuzzleDisplay() {
    puzzleDisplay.innerHTML = '';
    const collectedLettersSet = new Set(gameState.collectedLetters);
    for (let i = 0; i < PUZZLE_WORD.length; i++) {
        const letter = PUZZLE_WORD[i];
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-box';
        letterDiv.textContent = collectedLettersSet.has(letter) ? letter : '?';
        if (collectedLettersSet.has(letter)) {
             letterDiv.classList.add('collected-letter');
        }
        puzzleDisplay.appendChild(letterDiv);
    }
}

function resetPlayer() {
    gameState.player.x = 100;
    gameState.player.y = 100;
    gameState.player.vx = 0;
    gameState.player.vy = 0;
    gameState.player.onGround = false;
}

function loadStage(stageIndex) {
    gameState.currentStage = stageIndex;
    stageNumberDisplay.textContent = stageIndex + 1;
    resetPlayer();
    updatePuzzleDisplay();
    showScreen('game-screen');
    gameState.paused = false;
    if (gameState.gameLoopId) cancelAnimationFrame(gameState.gameLoopId);
    gameLoop();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentStageData = stages[gameState.currentStage];
    currentStageData.platforms.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
    ctx.fillStyle = currentStageData.goal.color;
    ctx.fillRect(currentStageData.goal.x, currentStageData.goal.y, currentStageData.goal.width, currentStageData.goal.height);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("GOAL", currentStageData.goal.x + currentStageData.goal.width / 2, currentStageData.goal.y + 25);
    ctx.fillStyle = gameState.player.color;
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
}

function update() {
    if (gameState.paused) return;
    gameState.player.vx = 0;
    if (gameState.keys.ArrowLeft) gameState.player.vx = -PLAYER_SPEED;
    if (gameState.keys.ArrowRight) gameState.player.vx = PLAYER_SPEED;
    gameState.player.x += gameState.player.vx;
    gameState.player.vy += GRAVITY;
    gameState.player.y += gameState.player.vy;
    gameState.player.onGround = false;
    const currentStageData = stages[gameState.currentStage];
    currentStageData.platforms.forEach(p => {
        if (gameState.player.x < p.x + p.width && gameState.player.x + gameState.player.width > p.x && gameState.player.y < p.y + p.height && gameState.player.y + gameState.player.height > p.y) {
            if (gameState.player.vy > 0 && gameState.player.y + gameState.player.height - gameState.player.vy <= p.y) {
                gameState.player.y = p.y - gameState.player.height;
                gameState.player.vy = 0;
                gameState.player.onGround = true;
            }
        }
    });
    const goal = currentStageData.goal;
    if (gameState.player.x < goal.x + goal.width && gameState.player.x + gameState.player.width > goal.x && gameState.player.y < goal.y + goal.height && gameState.player.y + gameState.player.height > goal.y) {
        levelClear();
    }
    if (gameState.player.y > canvas.height) {
        resetPlayer();
    }
    if (gameState.player.x < 0) gameState.player.x = 0;
    if (gameState.player.x + gameState.player.width > canvas.width) gameState.player.x = canvas.width - gameState.player.width;
}

function gameLoop() {
    update();
    draw();
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
}

function levelClear() {
    gameState.paused = true;
    cancelAnimationFrame(gameState.gameLoopId);
    const newLetter = PUZZLE_WORD[gameState.currentStage];
    const collectedLettersSet = new Set(gameState.collectedLetters);
    if (!collectedLettersSet.has(newLetter)) {
        gameState.collectedLetters.push(newLetter);
    }
    if (gameState.currentStage >= PUZZLE_WORD.length - 1) {
        showScreen('final-clear-screen');
    } else {
        acquiredLetterDisplay.textContent = newLetter;
        showScreen('level-clear-screen');
    }
}

// --- Event Listeners ---
startButton.addEventListener('click', () => {
    loadStage(0);
});
nextStageButton.addEventListener('click', () => {
    loadStage(gameState.currentStage + 1);
});
restartButton.addEventListener('click', () => {
    gameState.collectedLetters = [];
    loadStage(0);
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    if (e.code === 'ArrowUp' && gameState.player.onGround) {
        gameState.player.vy = JUMP_POWER;
        gameState.player.onGround = false;
    }
});
window.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
});

// --- Touch Controls Setup ---
function setupTouchControls() {
    // Left
    touchLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        gameState.keys.ArrowLeft = true;
    });
    touchLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        gameState.keys.ArrowLeft = false;
    });

    // Right
    touchRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        gameState.keys.ArrowRight = true;
    });
    touchRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        gameState.keys.ArrowRight = false;
    });

    // Jump
    touchJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.player.onGround) {
            gameState.player.vy = JUMP_POWER;
            gameState.player.onGround = false;
        }
    });
}


// --- Initial Call ---
showScreen('start-screen');
setupTouchControls();

