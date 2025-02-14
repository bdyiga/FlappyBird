// js/Game.js
import Bird from './Bird.js';
import PipeManager from './PipeManager.js';
import { CONFIG } from './config.js';

export default class Game {
    constructor(canvas) {
        // Initialize canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.GAME_WIDTH;
        this.canvas.height = CONFIG.GAME_HEIGHT;

        // Initialize game components
        this.bird = new Bird(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        this.pipeManager = new PipeManager(CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        // Game state
        this.score = 0;
        this.isRunning = false;
        this.gameOver = false;
        this.debugMode = false;

        // Performance monitoring
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        // Audio elements
        this.initializeAudio();

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

        // Event listeners
        window.addEventListener('keydown', this.handleKeyPress);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
    }

    initializeAudio() {
        this.sounds = {
            jump: new Audio('sounds/jump.mp3'),
            score: new Audio('sounds/score.mp3'),
            hit: new Audio('sounds/hit.mp3')
        };

        // Set volume
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
    }

    start() {
        // Reset game state
        this.score = 0;
        this.gameOver = false;
        this.isRunning = true;
        
        // Reset components
        this.bird.reset();
        this.pipeManager.reset();
        
        // Update UI
        this.updateScore();
        document.getElementById('gameOver').classList.add('hidden');
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    handleKeyPress(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.handleJump();
        } else if (event.code === 'KeyD') {
            this.toggleDebug();
        }
    }

    handleJump() {
        if (this.gameOver) {
            this.start();
        } else if (this.isRunning) {
            this.bird.jump();
            this.sounds.jump.currentTime = 0;
            this.sounds.jump.play();
        }
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
    }

    update(deltaTime) {
        if (!this.isRunning || this.gameOver) return;

        // Update game objects
        this.bird.update(deltaTime);
        this.pipeManager.update(deltaTime);

        // Check for pipe passing (scoring)
        if (this.pipeManager.checkPassing(this.bird.x)) {
            this.score += 100;
            this.updateScore();
            this.sounds.score.play();
            
            // Increase difficulty
            this.pipeManager.adjustDifficulty(this.score);
        }

        // Check collisions
        if (this.checkCollisions()) {
            this.endGame();
        }
    }

    checkCollisions() {
        // Check if bird hits the ground or ceiling
        if (this.bird.y <= 0 || this.bird.y + this.bird.size >= CONFIG.GAME_HEIGHT) {
            return true;
        }

        // Check collision with pipes
        return this.pipeManager.checkCollision(this.bird);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        // Draw background
        this.drawBackground();

        // Draw game objects
        this.pipeManager.render(this.ctx);
        this.bird.render(this.ctx);

        // Draw debug information
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.GAME_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');  // Light blue
        gradient.addColorStop(1, '#E0F6FF');  // Lighter blue
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

        // Simple clouds if not in debug mode
        if (!this.debugMode) {
            this.drawClouds();
        }
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        // Draw some simple clouds (positions could be randomized/stored)
        [
            { x: 100, y: 100, size: 40 },
            { x: 400, y: 150, size: 50 },
            { x: 700, y: 80, size: 30 }
        ].forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    renderDebugInfo() {
        this.ctx.fillStyle = 'black';
        this.ctx.font = '12px Arial';
        
        // Display debug information
        const debugInfo = [
            `FPS: ${this.fps.toFixed(1)}`,
            `Bird Y: ${this.bird.y.toFixed(1)}`,
            `Bird Velocity: ${this.bird.velocity.toFixed(1)}`,
            `Score: ${this.score}`,
            `Pipes: ${this.pipeManager.pipes.length}`
        ];

        debugInfo.forEach((text, index) => {
            this.ctx.fillText(text, 10, 20 + (index * 20));
        });

        // Draw collision boxes
        this.drawCollisionBoxes();
    }

    drawCollisionBoxes() {
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 1;

        // Bird collision box
        const birdBox = this.bird.getBounds();
        this.ctx.strokeRect(birdBox.x, birdBox.y, birdBox.width, birdBox.height);

        // Pipe collision boxes
        this.pipeManager.debug(this.ctx);
    }

    gameLoop(timestamp) {
        // Calculate delta time and FPS
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.frameCount++;
        if (timestamp > 1000) {
            this.fps = Math.round((this.frameCount * 1000) / timestamp);
            this.frameCount = 0;
        }

        // Update and render
        this.update(deltaTime);
        this.render();

        // Continue game loop
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        this.sounds.hit.play();
        
        // Show game over screen
        const gameOverScreen = document.getElementById('gameOver');
        gameOverScreen.classList.remove('hidden');
        
        // Update high score
        this.updateHighScore();
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('finalScore').textContent = this.score;
    }

    updateHighScore() {
        const highScore = localStorage.getItem('highScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
        }
    }

    cleanup() {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyPress);
        this.canvas.removeEventListener('touchstart');
        
        // Stop the game loop
        this.isRunning = false;
    }
}
