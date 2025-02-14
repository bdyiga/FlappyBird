// js/PipeManager.js
import { CONFIG } from './config.js';

export default class PipeManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.pipes = [];
        this.scoredPipes = new Set();
        this.pipeGap = CONFIG.PIPE_GAP;
        this.pipeWidth = CONFIG.PIPE_WIDTH;
        this.pipeSpeed = CONFIG.PIPE_SPEED;
        this.minPipeHeight = 100; // Minimum height for pipes
    }
    

    reset() {
        this.pipes = [];
        this.scoredPipes.clear();
        this.addPipe();
    }

    addPipe() {
        const maxPipeHeight = this.gameHeight - this.pipeGap - this.minPipeHeight;
        const pipeHeight = this.minPipeHeight + Math.random() * (maxPipeHeight - this.minPipeHeight);
        const pipeId = Date.now();

        // Add bottom pipe
        this.pipes.push({
            x: this.gameWidth,
            y: this.gameHeight - pipeHeight,
            width: this.pipeWidth,
            height: pipeHeight,
            id: pipeId,
            type: 'bottom',
            passed: false
        });

        // Add top pipe
        this.pipes.push({
            x: this.gameWidth,
            y: 0,
            width: this.pipeWidth,
            height: this.gameHeight - pipeHeight - this.pipeGap,
            id: pipeId + 1,
            type: 'top',
            passed: false
        });
    }

    update() {
        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            // Remove pipes that are off screen
            if (pipe.x + pipe.width < 0) {
                this.pipes.splice(i, 1);
                // Remove from scored pipes if it was scored
                this.scoredPipes.delete(pipe.id);
            }
        }

        // Add new pipes when needed
        if (this.pipes.length === 0 || 
            this.pipes[this.pipes.length - 1].x < this.gameWidth - 300) {
            this.addPipe();
        }
    }

    render(ctx) {
        this.pipes.forEach(pipe => {
            // Main pipe body
            ctx.fillStyle = '#228B22'; // Dark green
            ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);

            // Pipe border
            ctx.strokeStyle = '#1a6b1a'; // Darker green
            ctx.lineWidth = 2;
            ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);

            // Pipe cap
            const capHeight = 20;
            const capWidth = pipe.width + 10;
            const capX = pipe.x - 5;
            
            ctx.fillStyle = '#1a6b1a';
            if (pipe.type === 'top') {
                ctx.fillRect(capX, pipe.y + pipe.height - capHeight, capWidth, capHeight);
            } else {
                ctx.fillRect(capX, pipe.y, capWidth, capHeight);
            }

            // Add texture (vertical lines)
            ctx.strokeStyle = '#1a6b1a';
            ctx.lineWidth = 1;
            for (let i = 5; i < pipe.width; i += 10) {
                ctx.beginPath();
                ctx.moveTo(pipe.x + i, pipe.y);
                ctx.lineTo(pipe.x + i, pipe.y + pipe.height);
                ctx.stroke();
            }
        });
    }

    checkCollision(bird) {
        const birdBox = bird.getBounds();

        for (const pipe of this.pipes) {
            // Simple rectangle collision detection
            if (this.rectanglesIntersect(birdBox, pipe)) {
                return true;
            }
        }

        return false;
    }

    rectanglesIntersect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkPassing(birdX) {
        let scored = false;
        
        this.pipes.forEach(pipe => {
            if (pipe.type === 'bottom' && // Only check bottom pipes to avoid double scoring
                !this.scoredPipes.has(pipe.id) && 
                birdX > pipe.x + pipe.width) {
                this.scoredPipes.add(pipe.id);
                scored = true;
            }
        });

        return scored;
    }

    getPipesOnScreen() {
        return this.pipes.filter(pipe => 
            pipe.x + pipe.width > 0 && pipe.x < this.gameWidth
        );
    }

    getNextPipe(birdX) {
        // Find the first pipe ahead of the bird
        return this.pipes.find(pipe => 
            pipe.type === 'bottom' && 
            pipe.x + pipe.width > birdX
        );
    }

    adjustDifficulty(score) {
        // Increase difficulty as score increases
        this.pipeSpeed = CONFIG.PIPE_SPEED + Math.min(score / 1000, 2);
        this.pipeGap = CONFIG.PIPE_GAP - Math.min(score / 500, 50);
    }

    debug(ctx) {
        // Draw collision boxes and other debug information
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        this.pipes.forEach(pipe => {
            // Draw pipe hitbox
            ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);

            // Draw pipe info
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText(
                `ID: ${pipe.id}`,
                pipe.x,
                pipe.type === 'top' ? pipe.height + 10 : pipe.y - 5
            );
        });

        // Draw pipe gap visualization
        const nextPipe = this.getNextPipe(0);
        if (nextPipe) {
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(nextPipe.x, nextPipe.y);
            ctx.lineTo(nextPipe.x + nextPipe.width, nextPipe.y - this.pipeGap);
            ctx.stroke();
        }
    }
}
