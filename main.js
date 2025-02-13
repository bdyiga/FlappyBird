// js/main.js
import Game from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    
    // Initialize game
    const game = new Game(canvas);
    
    // Set up button listeners
    const startButton = document.getElementById('startButton');
    const debugButton = document.getElementById('debugButton');
    const restartButton = document.getElementById('restartButton');
    
    startButton.addEventListener('click', () => {
        game.start();
        startButton.blur(); // Remove focus from button
    });
    
    debugButton.addEventListener('click', () => {
        game.toggleDebug();
        debugButton.blur();
    });
    
    restartButton.addEventListener('click', () => {
        game.start();
        document.getElementById('gameOver').classList.add('hidden');
        restartButton.blur();
    });

    // Start initial game
    game.start();
});
