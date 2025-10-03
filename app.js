// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const goalScreen = document.getElementById('goal-screen');
const letterRevealScreen = document.getElementById('letter-reveal-screen');
const finalClearScreen = document.getElementById('final-clear-screen');
const startButton = document.getElementById('start-button');
const showLetterButton = document.getElementById('show-letter-button');
const nextStageButton = document.getElementById('next-stage-button');
const restartButton = document.getElementById('restart-button');
const stageNumberDisplay = document.getElementById('stage-number');
const puzzleDisplay = document.getElementById('puzzle-display');
const acquiredLetterDisplay = document.getElementById('acquired-letter');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const soundNotice = document.getElementById('sound-notice');

// Audio elements
const bgm = document.getElementById('bgm');
const goalSE = document.getElementById('goal-se');
const hitSE = document.getElementById('hit-se');
const clearSE = document.getElementById('clear-se');
const buttonSE = document.getElementById('button-se');
const coinSE = document.getElementById('coin-se'); // Coin sound effect

// Touch controls
const touchLeft = document.getElementById('touch-left');
const touchRight = document.getElementById('touch-right');
const touchJump = document.getElementById('touch-jump');

// --- Asset Images ---
const playerImage = new Image();
playerImage.src = 'Images/girl.png';
const enemyImage = new Image();
enemyImage.src = 'Images/enemy.png';
const coinImage = new Image();
coinImage.src = 'Images/coin.png';

// --- Game Constants ---
const PUZZLE_WORD = "PUZZLE";
const ACQUIRE_ORDER = "UZZELP"; // Order of acquiring letters
const GRAVITY = 0.6;
const PLAYER_SPEED = 5;
const JUMP_POWER = -12;

// --- Game State ---
let gameState = {
    currentStage: 0,
    collectedLetters: [],
    player: {
        x: 100, y: 100, width: 38, height: 48,
        vx: 0, vy: 0, onGround: false, color: '#ff6347'
    },
    camera: {
        x: 0
    },
    keys: {},
    gameLoopId: null,
    paused: false,
};

// --- Stages Data (User's version with added coin in Stage 4) ---
const stages = [
    // Stage 1
    {
        width: 800,
        platforms: [
            { x: 0, y: 360, width: 800, height: 40, color: '#8b4513' },
            { x: 200, y: 280, width: 100, height: 20, color: '#d2691e' },
            { x: 450, y: 220, width: 100, height: 20, color: '#d2691e' },
            { x: 660, y: 160, width: 100, height: 20, color: '#d2691e' },
        ],
         coins: [
            { x: 270, y: 100, width: 30, height: 30, collected: false }
        ],
        enemies: [
            { x: 450, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 2, moveX: 200, currentMove: 0, direction: 1 }
        ],
        goal: { x: 720, y: 100, width: 40, height: 60, color: '#ffd700' } 
    },
    // Stage 2 (with coin)
    {
        width: 1600,
        platforms: [
            { x: 0, y: 360, width: 300, height: 40, color: '#8b4513' },
            { x: 400, y: 300, width: 100, height: 20, color: '#d2691e' },
            { x: 650, y: 240, width: 100, height: 20, color: '#d2691e' },
            { x: 900, y: 360, width: 700, height: 40, color: '#8b4513' },
            { x: 1000, y: 280, width: 70, height: 20, color: '#d2691e' },
            { x: 1200, y: 220, width: 50, height: 20, color: '#d2691e' },
            { x: 1400, y: 160, width: 50, height: 20, color: '#d2691e' },
        ],
        coins: [
            { x: 200, y: 220, width: 30, height: 30, collected: false },
            { x: 1420, y: 120, width: 30, height: 30, collected: false }
        ],
        enemies: [
            { x: 100, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 1.5, moveX: 100, currentMove: 0, direction: 1 },
            { x: 1300, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 2.5, moveX: 300, currentMove: 0, direction: -1 }
        ],
        goal: { x: 1520, y: 300, width: 40, height: 60, color: '#ffd700' } 
    },
    // Stage 3
    {
        width: 2000,
        platforms: [
            { x: 0, y: 360, width: 100, height: 40, color: '#8b4513' },
            { x: 180, y: 320, width: 80, height: 20, color: '#d2691e' },
            { x: 350, y: 280, width: 80, height: 20, color: '#d2691e' },
            { x: 520, y: 240, width: 80, height: 20, color: '#d2691e' },
            { x: 800, y: 360, width: 400, height: 40, color: '#8b4513' },
            { x: 850, y: 280, width: 30, height: 20, color: '#d2691e' },
            { x: 950, y: 220, width: 30, height: 20, color: '#d2691e' },
            { x: 1050, y: 280, width: 30, height: 20, color: '#d2691e' },
            { x: 1400, y: 360, width: 600, height: 40, color: '#8b4513' },
            { x: 1500, y: 280, width: 100, height: 20, color: '#d2691e' },
            { x: 1700, y: 200, width: 100, height: 20, color: '#d2691e' },
        ],
        coins: [
            { x: 950, y: 280, width: 30, height: 30, collected: false }
        ],
        enemies: [
            { x: 820, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 2.5, moveX: 200, currentMove: 0, direction: 1 },
            { x: 1700, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 3, moveX: 300, currentMove: 0, direction: -1 }
        ],
        goal: { x: 1920, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 4 (with two coins)
    {
        width: 1800,
         platforms: [
            { x: 0, y: 360, width: 800, height: 40, color: '#8b4513' },
            { x: 100, y: 280, width: 30, height: 20, color: '#d2691e' },
            { x: 200, y: 220, width: 30, height: 20, color: '#d2691e' },
            { x: 300, y: 280, width: 30, height: 20, color: '#d2691e' },
            { x: 450, y: 180, width: 150, height: 20, color: '#d2691e' },
            { x: 900, y: 360, width: 900, height: 40, color: '#8b4513' },
            { x: 1000, y: 280, width: 50, height: 20, color: '#d2691e' },
            { x: 1200, y: 220, width: 100, height: 20, color: '#d2691e' },
            { x: 1400, y: 160, width: 100, height: 20, color: '#d2691e' },
        ],
        coins: [
            { x: 670, y: 100, width: 30, height: 30, collected: false },
            { x: 1435, y: 120, width: 30, height: 30, collected: false }
        ],
        enemies: [
             { x: 350, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 3, moveX: 250, currentMove: 0, direction: 1 },
             { x: 1130, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 3.5, moveX: 230, currentMove: 0, direction: -1 },
             { x: 1680, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 3, moveX: 100, currentMove: 0, direction: -1 }
        ],
        goal: { x: 1720, y: 300, width: 40, height: 60, color: '#ffd700' }
    },
    // Stage 5
    {
        width: 1600,
        platforms: [
            { x: 0, y: 360, width: 150, height: 40, color: '#8b4513' },
            { x: 250, y: 300, width: 30, height: 20, color: '#d2691e' },
            { x: 250, y: 180, width: 30, height: 20, color: '#d2691e' },
            { x: 350, y: 240, width: 30, height: 20, color: '#d2691e' },
            { x: 450, y: 180, width: 30, height: 20, color: '#d2691e' },
            { x: 550, y: 240, width: 30, height: 20, color: '#d2691e' },
            { x: 650, y: 300, width: 30, height: 20, color: '#d2691e' },
            { x: 750, y: 360, width: 850, height: 40, color: '#8b4513' },
            { x: 950, y: 280, width: 100, height: 20, color: '#d2691e' },
            { x: 950, y: 220, width: 20, height: 20, color: '#d2691e' },
            { x: 1150, y: 220, width: 100, height: 20, color: '#d2691e' },
            { x: 1350, y: 160, width: 20, height: 20, color: '#d2691e' },
        ],
        coins: [
            { x: 250, y: 90, width: 30, height: 30, collected: false },
            { x: 950, y: 50, width: 30, height: 30, collected: false }
        ],
        enemies: [
             { x: 750, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 3, moveX: 200, currentMove: 0, direction: 1 },
             { x: 1100, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 1, moveX: 50, currentMove: 0, direction: 1 },
             { x: 1500, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 2, moveX: 50, currentMove: 0, direction: 1 }
        ],
        goal: { x: 1520, y: 100, width: 40, height: 60, color: '#ffd700' } 
    },
    // Stage 6 (with coin)
    {
        width: 1600,
        platforms: [
            { x: 0, y: 360, width: 80, height: 40, color: '#8b4513' },
            { x: 120, y: 300, width: 50, height: 20, color: '#d2691e' },
            { x: 240, y: 240, width: 50, height: 20, color: '#d2691e' },
            { x: 240, y: 360, width: 50, height: 20, color: '#d2691e' },
            { x: 480, y: 240, width: 50, height: 20, color: '#d2691e' },
            { x: 630, y: 360, width: 30, height: 20, color: '#d2691e' },
            { x: 1200, y: 360, width: 400, height: 40, color: '#8b4513' },
            { x: 800, y: 280, width: 50, height: 20, color: '#d2691e' },
            { x: 1000, y: 220, width: 100, height: 20, color: '#d2691e' },
            { x: 1250, y: 160, width: 50, height: 20, color: '#d2691e' },
        ],
        coins: [
            { x: 240, y: 330, width: 30, height: 30, collected: false },
            { x: 630, y: 330, width: 30, height: 30, collected: false },
            { x: 1250, y: 120, width: 30, height: 30, collected: false }
        ],
        enemies: [
            { x: 1470, y: 322, width: 38, height: 38, color: '#e53e3e', speed: 3, moveX: 230, currentMove: 0, direction: -1 }
        ],
        goal: { x: 1520, y: 300, width: 40, height: 60, color: '#ffd700' } 
    },
];

// --- Functions ---
function playSE(se) {
    se.currentTime = 0;
    se.play();
}

function showScreen(screenId) {
    [startScreen, gameScreen, goalScreen, letterRevealScreen, finalClearScreen].forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function updatePuzzleDisplay() {
    puzzleDisplay.innerHTML = '';
    const collectedLettersCopy = [...gameState.collectedLetters];

    for (let i = 0; i < PUZZLE_WORD.length; i++) {
        const char = PUZZLE_WORD[i];
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-box';
        
        const foundIndex = collectedLettersCopy.indexOf(char);
        if (foundIndex > -1) {
            letterDiv.textContent = char;
            letterDiv.classList.add('collected-letter');
            collectedLettersCopy.splice(foundIndex, 1); // Mark as used
        } else {
            letterDiv.textContent = '?';
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
    gameState.camera.x = 0;

    const currentStageData = stages[gameState.currentStage];
    if (currentStageData.coins) {
        currentStageData.coins.forEach(c => {
            c.collected = false;
        });
    }
}

function loadStage(stageIndex) {
    // Reset coins for the stage if they exist
    if(stages[stageIndex].coins) {
        // Deep copy to avoid mutation issues on restart
        stages[stageIndex].coins.forEach((c, i) => {
            const originalCoin = JSON.parse(JSON.stringify(stages[stageIndex].coins))[i];
             Object.assign(c, originalCoin);
        });
    }

    gameState.currentStage = stageIndex;
    stageNumberDisplay.textContent = stageIndex + 1;
    resetPlayer();
    updatePuzzleDisplay();
    showScreen('game-screen');
    gameState.paused = false;
    if (gameState.gameLoopId) cancelAnimationFrame(gameState.gameLoopId);
    gameLoop();
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentStageData = stages[gameState.currentStage];

    ctx.save();
    ctx.translate(-gameState.camera.x, 0);

    // Draw platforms
    currentStageData.platforms?.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
    
    // Draw coins
    currentStageData.coins?.forEach(c => {
        if (!c.collected && coinImage.complete && coinImage.naturalHeight !== 0) {
            ctx.drawImage(coinImage, c.x, c.y, c.width, c.height);
        }
    });

    // Draw enemies
    currentStageData.enemies?.forEach(e => {
        if (enemyImage.complete && enemyImage.naturalHeight !== 0) {
            ctx.drawImage(enemyImage, e.x, e.y, e.width, e.height);
        } else {
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x, e.y, e.width, e.height);
        }
    });

    // Draw goal
    const goal = currentStageData.goal;
    const goalIsActive = !currentStageData.coins || currentStageData.coins.every(c => c.collected);
    ctx.fillStyle = goalIsActive ? goal.color : '#808080'; // Gray if locked
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("GOAL", goal.x + goal.width / 2, goal.y + 25);
    
    // Draw player
    if (playerImage.complete && playerImage.naturalHeight !== 0) {
        ctx.drawImage(playerImage, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    } else {
        ctx.fillStyle = gameState.player.color;
        ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    }

    ctx.restore();
}

function update() {
    if (gameState.paused) return;
    const currentStageData = stages[gameState.currentStage];

    // Update enemies
    currentStageData.enemies?.forEach(e => {
        e.x += e.speed * e.direction;
        e.currentMove += e.speed;
        if (e.currentMove >= e.moveX) {
            e.currentMove = 0;
            e.direction *= -1;
        }
    });

    // Update player movement
    gameState.player.vx = 0;
    if (gameState.keys.ArrowLeft) gameState.player.vx = -PLAYER_SPEED;
    if (gameState.keys.ArrowRight) gameState.player.vx = PLAYER_SPEED;
    gameState.player.x += gameState.player.vx;
    gameState.player.vy += GRAVITY;
    gameState.player.y += gameState.player.vy;
    gameState.player.onGround = false;

    // --- Collisions ---
    // Platforms
    currentStageData.platforms?.forEach(p => {
        if (gameState.player.x < p.x + p.width && gameState.player.x + gameState.player.width > p.x && gameState.player.y < p.y + p.height && gameState.player.y + gameState.player.height > p.y) {
            if (gameState.player.vy > 0 && gameState.player.y + gameState.player.height - gameState.player.vy <= p.y + 1) {
                gameState.player.y = p.y - gameState.player.height;
                gameState.player.vy = 0;
                gameState.player.onGround = true;
            }
        }
    });

    // Coins
    currentStageData.coins?.forEach(c => {
        if (!c.collected && isColliding(gameState.player, c)) {
            c.collected = true;
            playSE(coinSE);
        }
    });

    // Enemies
    currentStageData.enemies?.forEach(e => {
        if (isColliding(gameState.player, e)) {
            playSE(hitSE);
            resetPlayer();
        }
    });
    
    // Goal
    const goal = currentStageData.goal;
    const goalIsActive = !currentStageData.coins || currentStageData.coins.every(c => c.collected);
    if (goalIsActive && (gameState.player.x < goal.x + goal.width && gameState.player.x + gameState.player.width > goal.x && gameState.player.y < goal.y + goal.height && gameState.player.y + gameState.player.height > goal.y)) {
        levelClear();
    }
    
    // Falling off
    if (gameState.player.y > canvas.height) {
        playSE(hitSE);
        resetPlayer();
    }

    // Stage boundaries
    if (gameState.player.x < 0) gameState.player.x = 0;
    if (gameState.player.x + gameState.player.width > currentStageData.width) {
        gameState.player.x = currentStageData.width - gameState.player.width;
    }

    // --- Update Camera ---
    let targetX = gameState.player.x - canvas.width / 2 + gameState.player.width / 2;
    targetX = Math.max(0, Math.min(currentStageData.width - canvas.width, targetX));
    gameState.camera.x = targetX;
}


function gameLoop() {
    update();
    draw();
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
}

function levelClear() {
    gameState.paused = true;
    cancelAnimationFrame(gameState.gameLoopId);
    
    const newLetter = ACQUIRE_ORDER[gameState.currentStage];
    gameState.collectedLetters.push(newLetter);
    
    if (gameState.currentStage >= PUZZLE_WORD.length - 1) {
        bgm.pause();
        playSE(clearSE);
        showScreen('final-clear-screen');
    } else {
        playSE(goalSE);
        acquiredLetterDisplay.textContent = newLetter;
        showScreen('goal-screen');
    }
}

// --- Event Listeners ---
startButton.addEventListener('click', () => {
    playSE(buttonSE);
    loadStage(0);
});

showLetterButton.addEventListener('click', () => {
    playSE(buttonSE);
    showScreen('letter-reveal-screen');
});

nextStageButton.addEventListener('click', () => {
    playSE(buttonSE);
    loadStage(gameState.currentStage + 1);
});

restartButton.addEventListener('click', () => {
    playSE(buttonSE);
    clearSE.pause();
    clearSE.currentTime = 0;
    bgm.currentTime = 0;
    bgm.play();
    gameState.collectedLetters = [];
    loadStage(0);
});

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

function setupTouchControls() {
    touchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); gameState.keys.ArrowLeft = true; });
    touchLeft.addEventListener('touchend', (e) => { e.preventDefault(); gameState.keys.ArrowLeft = false; });
    touchRight.addEventListener('touchstart', (e) => { e.preventDefault(); gameState.keys.ArrowRight = true; });
    touchRight.addEventListener('touchend', (e) => { e.preventDefault(); gameState.keys.ArrowRight = false; });
    touchJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.player.onGround) {
            gameState.player.vy = JUMP_POWER;
            gameState.player.onGround = false;
        }
    });
}

// --- Initial Call & BGM Handling ---
function playBgmOnFirstInteraction() {
    bgm.play().then(() => {
        soundNotice.style.display = 'none';
    }).catch(error => {
        console.log("BGM autoplay failed:", error);
    });
    window.removeEventListener('click', playBgmOnFirstInteraction);
    window.removeEventListener('touchstart', playBgmOnFirstInteraction);
    window.removeEventListener('keydown', playBgmOnFirstInteraction);
}

window.addEventListener('click', playBgmOnFirstInteraction);
window.addEventListener('touchstart', playBgmOnFirstInteraction);
window.addEventListener('keydown', playBgmOnFirstInteraction);

showScreen('start-screen');
setupTouchControls();

