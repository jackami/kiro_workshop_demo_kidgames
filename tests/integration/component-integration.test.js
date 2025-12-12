// Component integration tests - Testing component interactions without DOM dependencies

import { GameBoard } from '../../js/core/GameBoard.js';
import { GameState } from '../../js/core/GameState.js';
import { GameEngine } from '../../js/core/GameEngine.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GravitySystem } from '../../js/algorithms/GravitySystem.js';
import { AudioManager } from '../../js/components/AudioManager.js';
import { EVENTS } from '../../js/constants.js';

// Mock components that don't require DOM
class MockRenderer {
    constructor() {
        this.lastRenderedBoard = null;
        this.lastScore = 0;
        this.lastCombo = 0;
    }
    
    renderBoard(board) { this.lastRenderedBoard = board; }
    updateScore(score) { this.lastScore = score; }
    updateCombo(combo) { this.lastCombo = combo; }
    animateSwap() { return Promise.resolve(); }
    animateMatch() { return Promise.resolve(); }
    animateFall() { return Promise.resolve(); }
    highlightCell() {}
    clearAllHighlights() {}
    reset() {}
    destroy() {}
}

class MockInputHandler {
    constructor() {
        this.enabled = true;
    }
    
    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
    reset() {}
    destroy() {}
    setComponents() {}
}

export default async function runTests() {
    const results = [];
    
    // Test 1: Complete game component integration
    try {
        const gameBoard = new GameBoard();
        const gameState = new GameState();
        const matchDetector = new MatchDetector();
        const gravitySystem = new GravitySystem();
        const audioManager = new AudioManager();
        const renderer = new MockRenderer();
        const inputHandler = new MockInputHandler();
        
        // Initialize components
        gameBoard.initializeWithGhosts();
        gameState.startGame();
        
        // Set up component references (these components work directly with passed board data)
        
        // Test component interaction: create match, detect, remove, apply gravity
        gameBoard.setCell(0, 0, { type: 1, x: 0, y: 0, color: 'blue', sprite: 'ghost-1' });
        gameBoard.setCell(1, 0, { type: 1, x: 1, y: 0, color: 'blue', sprite: 'ghost-1' });
        gameBoard.setCell(2, 0, { type: 1, x: 2, y: 0, color: 'blue', sprite: 'ghost-1' });
        
        // Find matches
        const matches = matchDetector.findMatches(gameBoard.grid);
        if (matches.length === 0) {
            throw new Error('Should find the created match');
        }
        
        // Calculate score
        const score = gameState.calculateMatchScore(3, 1);
        gameState.addScore(score);
        
        if (gameState.score <= 0) {
            throw new Error('Score should increase');
        }
        
        // Remove matches
        gameBoard.removeMatches(matches);
        
        // Apply gravity
        gravitySystem.applyGravity(gameBoard.grid);
        gravitySystem.fillEmpty(gameBoard.grid);
        
        // Verify board is full
        if (!gameBoard.isFull()) {
            throw new Error('Board should be full after refill');
        }
        
        results.push({ name: 'Complete game component integration', passed: true });
    } catch (error) {
        results.push({ name: 'Complete game component integration', passed: false, error: error.message });
    }

    // Test 2: Event system integration
    try {
        const gameState = new GameState();
        let eventReceived = false;
        let eventData = null;
        
        // Set up event listener
        gameState.on(EVENTS.SCORE_UPDATE, (data) => {
            eventReceived = true;
            eventData = data;
        });
        
        // Trigger event
        gameState.startGame();
        gameState.addScore(100);
        
        // Wait for event propagation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (!eventReceived) {
            throw new Error('Score update event should be received');
        }
        
        if (!eventData || eventData.score !== 100) {
            throw new Error('Event data should contain correct score');
        }
        
        results.push({ name: 'Event system integration', passed: true });
    } catch (error) {
        results.push({ name: 'Event system integration', passed: false, error: error.message });
    }

    // Test 3: Game engine component coordination
    try {
        const gameEngine = new GameEngine();
        const components = {
            gameBoard: new GameBoard(),
            gameState: new GameState(),
            renderer: new MockRenderer(),
            inputHandler: new MockInputHandler(),
            audioManager: new AudioManager(),
            matchDetector: new MatchDetector(),
            gravitySystem: new GravitySystem()
        };
        
        // Initialize game engine
        gameEngine.initialize(components);
        
        // Verify all components are set
        const requiredComponents = ['gameBoard', 'gameState', 'renderer', 'inputHandler', 'audioManager', 'matchDetector', 'gravitySystem'];
        for (const component of requiredComponents) {
            if (!gameEngine[component]) {
                throw new Error(`GameEngine should have ${component} reference`);
            }
        }
        
        // Test state transitions
        gameEngine.start();
        if (gameEngine.state !== 'playing') {
            throw new Error('Game should be in playing state after start');
        }
        
        gameEngine.pause();
        if (gameEngine.state !== 'paused') {
            throw new Error('Game should be in paused state after pause');
        }
        
        gameEngine.resume();
        if (gameEngine.state !== 'playing') {
            throw new Error('Game should be in playing state after resume');
        }
        
        results.push({ name: 'Game engine component coordination', passed: true });
    } catch (error) {
        results.push({ name: 'Game engine component coordination', passed: false, error: error.message });
    }

    // Test 4: Audio system integration
    try {
        const audioManager = new AudioManager();
        
        // Test initialization
        await audioManager.preloadSounds();
        
        // Test status
        const status = audioManager.getStatus();
        if (!status || typeof status !== 'object') {
            throw new Error('Audio status should be an object');
        }
        
        // Test sound playing (should not throw)
        audioManager.playMatch();
        audioManager.playCombo();
        audioManager.playSwap();
        audioManager.playGameOver();
        
        // Test mute toggle
        const wasMuted = audioManager.isMutedState();
        audioManager.toggleMute();
        const isMuted = audioManager.isMutedState();
        
        if (wasMuted === isMuted) {
            throw new Error('Mute state should toggle');
        }
        
        results.push({ name: 'Audio system integration', passed: true });
    } catch (error) {
        results.push({ name: 'Audio system integration', passed: false, error: error.message });
    }

    // Test 5: Match detection and gravity system integration
    try {
        const gameBoard = new GameBoard();
        const matchDetector = new MatchDetector();
        const gravitySystem = new GravitySystem();
        
        gameBoard.initializeWithGhosts();
        
        // Create a scenario with multiple matches
        // Bottom row match
        gameBoard.setCell(0, 7, { type: 0, x: 0, y: 7, color: 'red', sprite: 'ghost-0' });
        gameBoard.setCell(1, 7, { type: 0, x: 1, y: 7, color: 'red', sprite: 'ghost-0' });
        gameBoard.setCell(2, 7, { type: 0, x: 2, y: 7, color: 'red', sprite: 'ghost-0' });
        
        // Vertical match that will fall
        gameBoard.setCell(0, 4, { type: 1, x: 0, y: 4, color: 'blue', sprite: 'ghost-1' });
        gameBoard.setCell(0, 5, { type: 1, x: 0, y: 5, color: 'blue', sprite: 'ghost-1' });
        gameBoard.setCell(0, 6, { type: 1, x: 0, y: 6, color: 'blue', sprite: 'ghost-1' });
        
        // Find initial matches
        const initialMatches = matchDetector.findMatches(gameBoard.grid);
        if (initialMatches.length === 0) {
            throw new Error('Should find initial matches');
        }
        
        // Remove matches
        gameBoard.removeMatches(initialMatches);
        
        // Apply gravity
        const movements = gravitySystem.applyGravity(gameBoard.grid);
        if (movements.length === 0) {
            throw new Error('Should have gravity movements');
        }
        
        // Fill empty spaces
        const newGhosts = gravitySystem.fillEmpty(gameBoard.grid);
        if (newGhosts.length === 0) {
            throw new Error('Should fill empty spaces');
        }
        
        // Check for new matches after gravity
        const newMatches = matchDetector.findMatches(gameBoard.grid);
        // New matches may or may not exist, but detection should work without error
        
        // Verify board integrity
        if (!gameBoard.isFull()) {
            throw new Error('Board should be full after gravity and refill');
        }
        
        results.push({ name: 'Match detection and gravity system integration', passed: true });
    } catch (error) {
        results.push({ name: 'Match detection and gravity system integration', passed: false, error: error.message });
    }

    // Test 6: Game state and scoring integration
    try {
        const gameState = new GameState();
        const gameBoard = new GameBoard();
        const matchDetector = new MatchDetector();
        
        gameState.startGame();
        gameBoard.initializeWithGhosts();
        
        // Create multiple matches of different sizes
        const testScenarios = [
            { size: 3, combo: 1 },
            { size: 4, combo: 2 },
            { size: 5, combo: 3 }
        ];
        
        let totalExpectedScore = 0;
        
        for (let i = 0; i < testScenarios.length; i++) {
            const scenario = testScenarios[i];
            const score = gameState.calculateMatchScore(scenario.size, scenario.combo);
            gameState.addScore(score);
            gameState.incrementCombo();
            
            totalExpectedScore += score; // Use actual calculated score
        }
        
        if (gameState.score !== totalExpectedScore) {
            throw new Error(`Expected total score ${totalExpectedScore}, got ${gameState.score}`);
        }
        
        if (gameState.combo !== testScenarios.length) {
            throw new Error(`Expected combo ${testScenarios.length}, got ${gameState.combo}`);
        }
        
        // Test game statistics
        const stats = gameState.getStats();
        if (!stats || typeof stats !== 'object') {
            throw new Error('Game stats should be an object');
        }
        
        if (stats.score !== gameState.score || stats.combo !== gameState.combo) {
            throw new Error('Stats should match game state');
        }
        
        results.push({ name: 'Game state and scoring integration', passed: true });
    } catch (error) {
        results.push({ name: 'Game state and scoring integration', passed: false, error: error.message });
    }

    // Test 7: Component cleanup and resource management
    try {
        const components = {
            gameBoard: new GameBoard(),
            gameState: new GameState(),
            audioManager: new AudioManager(),
            matchDetector: new MatchDetector(),
            gravitySystem: new GravitySystem()
        };
        
        // Initialize all components
        components.gameBoard.initializeWithGhosts();
        components.gameState.startGame();
        await components.audioManager.preloadSounds();
        
        // Test cleanup
        if (components.gameBoard.destroy) components.gameBoard.destroy();
        if (components.gameState.destroy) components.gameState.destroy();
        if (components.audioManager.destroy) components.audioManager.destroy();
        if (components.matchDetector.reset) components.matchDetector.reset();
        if (components.gravitySystem.reset) components.gravitySystem.reset();
        
        // Verify cleanup (should not throw errors)
        const boardStats = components.gameBoard.getStats();
        const stateStats = components.gameState.getStats();
        const audioStatus = components.audioManager.getStatus();
        
        // These should handle post-cleanup state gracefully
        if (typeof boardStats !== 'object' || typeof stateStats !== 'object' || typeof audioStatus !== 'object') {
            throw new Error('Components should handle cleanup gracefully');
        }
        
        results.push({ name: 'Component cleanup and resource management', passed: true });
    } catch (error) {
        results.push({ name: 'Component cleanup and resource management', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `Component Integration: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}