import Bird from './Bird.js';
import PipeManager from './PipeManager.js';
import { CONFIG } from './config.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = CONFIG.GAME_WIDTH;
        this.height = CONFIG.GAME_HEIGHT;
        
        // Set canvas dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Initialize game objects
        this.bird = new Bird(this.width, this.height);
        this.pipeManager = new PipeManager(this.width, this.height);
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.debugMode = false;
        this.fps = 0;
        this.lastTime = 0;
        this.frameCount = 0;
        
        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        
        // Event listeners
        window.addEventListener('keydown', this.handleKeyPress);
    }

    start() {
        this.reset();
        requestAnimationFrame(this.gameLoop);
    }

    reset() {
        this.bird.reset();
        this.pipeManager.reset();
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
    }

    handleKeyPress(event) {
        if (event.code === 'Space') {
            if (this.gameOver) {
                this.start();
            } else {
                this.bird.jump();
            }
        } else if (event.code === 'KeyD') {
            this.debugMode = !this.debugMode;
        }
    }

    update() {
        if (this.gameOver) return;

        this.bird.update();
        this.pipeManager.update();

        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }

        // Update score
        if (this.pipeManager.checkPassing(this.bird.x)) {
            this.score += 100;
            this.updateScore();
        }
    }

    checkCollisions() {
        // Check if bird hits the ground or ceiling
        if (this.bird.y <= 0 || this.bird.y + this.bird.size >= this.height) {
            return true;
        }

        // Check collision with pipes
        return this.pipeManager.checkCollision(this.bird);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw game objects
        this.pipeManager.render(this.ctx);
        this.bird.render(this.ctx);

        // Draw debug info
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }

    renderDebugInfo() {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${this.fps.toFixed(2)}`, this.width - 100, 20);
        this.ctx.fillText(`Bird Y: ${this.bird.y.toFixed(2)}`, this.width - 100, 40);
        this.ctx.fillText(`Bird Velocity: ${this.bird.velocity.toFixed(2)}`, this.width - 100, 60);
        this.ctx.fillText(`Pipes: ${this.pipeManager.pipes.length}`, this.width - 100, 80);
    }

    gameLoop(timestamp) {
        // Calculate FPS
        this.frameCount++;
        const elapsed = timestamp - this.lastTime;
        if (elapsed > 1000) {
            this.fps = this.frameCount * 1000 / elapsed;
            this.frameCount = 0;
            this.lastTime = timestamp;
        }

        this.update();
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('finalScore').textContent = this.score;
    }

    showGameOver() {
        document.getElementById('gameOver').classList.remove('hidden');
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyPress);
    }
}
