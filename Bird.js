// js/Bird.js
import { CONFIG } from './config.js';

export default class Bird {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.size = CONFIG.BIRD_SIZE;
        this.reset();
    }

    reset() {
        this.x = this.gameWidth / 5;
        this.y = this.gameHeight / 2;
        this.velocity = 0;
    }

    jump() {
        this.velocity = CONFIG.JUMP_FORCE;
    }

    update() {
        this.velocity += CONFIG.GRAVITY;
        this.y += this.velocity;
    }

    render(ctx) {
        // Draw bird body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw wing
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.size / 4,
            this.y + this.size / 2,
            this.size / 4,
            this.size / 3,
            Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(
            this.x + this.size * 3/4,
            this.y + this.size / 3,
            this.size / 8,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.size,
            height: this.size
        };
    }
}
