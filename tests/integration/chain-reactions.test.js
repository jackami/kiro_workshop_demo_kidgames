// Integration tests for chain reactions functionality

import { GameEngine } from '../../js/core/GameEngine.js';
import { GameBoard } from '../../js/core/GameBoard.js';
import { GameState } from '../../js/core/GameState.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GravitySystem } from '../../js/algorithms/GravitySystem.js';
import { GAME_STATES } from '../../js/constants.js';

// Mock components for integration testing
class MockRenderer {
    animateSwap() { return Promise.resolve(); }
    animateMatch() { return Promise.resolve(); }
    animateFall() { return Promise.resolve(); }
    animateAppear() { return Promise.resolve(); }
    updateScore() {}
    updateCombo() {}
}

class MockInputHandler {
    enable() {}
    disable() {}
}

class MockAudioManager {
    playSound() {}
}

export default async function runTests() {
    const results = [];
    
    // Test 1: Complete chain reaction flow
    try {
        const gameEngine = new GameEngine();
        const gameBoard = new GameBoard(8, 8);
        const gameState = new GameState();
        const matchDetector = new MatchDetector();
        const gravitySystem = new GravitySystem();
        
        const components = {
            gameBoard,
            gameState,
            renderer: new MockRenderer(),
            inputHandler: new MockInputHandler(),
            audioManager: new MockAudioManager(),
            matchDetector,
            gravitySystem
        };
        
        gameEngine.initialize(components);
        gameState.startGame();
        
        // Create a grid setup that will cause chain reactions
        const grid = createChainReactionGrid();
        gameBoard.grid = grid;
        
        // Process chain reactions
        const result = await gameEngine.processChainReactions();
        
        if (typeof result !== 'boolean') {
            throw new Error('processChainReactions should return boolean');
        }
        
        results.push({ name: 'Complete chain reaction flow', passed: true });
    } catch (error) {
        results.push({ name: 'Complete chain reaction flow', passed: false, error: error.message });
    }

    // Test 2: Chain reaction state management
    try {
        const gameEngine = new GameEngine();
        const components = createMockComponents();
        gameEngine.initialize(components);
        
        const initialState = gameEngine.state;
        
        // Process chain reactions when no matches exist
        const result = await gameEngine.processChainReactions();
        
        // State should remain unchanged
        if (gameEngine.state !== initialState) {
            throw new Error('Game state should not change when no chain reactions occur');
        }
        
        if (result !== false) {
            throw new Error('Should return false when no chain reactions occur');
        }
        
        results.push({ name: 'Chain reaction state management', passed: true });
    } catch (error) {
        results.push({ name: 'Chain reaction state management', passed: false, error: error.message });
    }

    // Test 3: Chain reaction with score accumulation
    try {
        const gameEngine = new GameEngine();
        const components = createMockComponents();
        gameEngine.initialize(components);
        components.gameState.startGame();
        
        const initialScore = components.gameState.score;
        
        // Mock a scenario with matches
        let matchCallCount = 0;
        components.matchDetector.findMatches = () => {
            matchCallCount++;
            if (matchCallCount === 1) {
                return [
                    [
                        { x: 0, y: 0, type: 0 },
                        { x: 1, y: 0, type: 0 },
                        { x: 2, y: 0, type: 0 }
                    ]
                ];
            }
            return [];
        };
        
        // Mock processMatches to simulate score addition
        gameEngine.processMatches = async (matches) => {
            const score = gameEngine.calculateMatchScore(matches);
            components.gameState.addScore(score);
            components.gameState.incrementCombo();
        };
        
        await gameEngine.processChainReactions();
        
        if (components.gameState.score <= initialScore) {
            throw new Error('Score should increase after chain reactions');
        }
        
        results.push({ name: 'Chain reaction with score accumulation', passed: true });
    } catch (error) {
        results.push({ name: 'Chain reaction with score accumulation', passed: false, error: error.message });
    }

    // Test 4: Recursive chain reaction handling
    try {
        const gameEngine = new GameEngine();
        const components = createMockComponents();
        gameEngine.initialize(components);
        
        let recursionDepth = 0;
        const maxRecursion = 3;
        
        // Mock findMatches to simulate multiple chain reactions
        components.matchDetector.findMatches = () => {
            recursionDepth++;
            if (recursionDepth <= maxRecursion) {
                return [
                    [
                        { x: recursionDepth, y: 0, type: 0 },
                        { x: recursionDepth, y: 1, type: 0 },
                        { x: recursionDepth, y: 2, type: 0 }
                    ]
                ];
            }
            return [];
        };
        
        // Mock processMatches to avoid actual processing
        gameEngine.processMatches = async () => {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1));
        };
        
        const result = await gameEngine.processChainReactions();
        
        if (recursionDepth !== maxRecursion + 1) {
            throw new Error(`Expected ${maxRecursion + 1} recursion calls, got ${recursionDepth}`);
        }
        
        if (typeof result !== 'boolean') {
            throw new Error('Should return boolean after recursive processing');
        }
        
        results.push({ name: 'Recursive chain reaction handling', passed: true });
    } catch (error) {
        results.push({ name: 'Recursive chain reaction handling', passed: false, error: error.message });
    }

    // Test 5: Chain reaction interruption by game state changes
    try {
        const gameEngine = new GameEngine();
        const components = createMockComponents();
        gameEngine.initialize(components);
        
        // Change game state to paused
        gameEngine.state = GAME_STATES.PAUSED;
        
        const result = await gameEngine.processChainReactions();
        
        if (result !== false) {
            throw new Error('Chain reactions should not process when game is paused');
        }
        
        // Change to animating state
        gameEngine.state = GAME_STATES.ANIMATING;
        
        const result2 = await gameEngine.processChainReactions();
        
        if (result2 !== false) {
            throw new Error('Chain reactions should not process when game is animating');
        }
        
        results.push({ name: 'Chain reaction interruption by game state changes', passed: true });
    } catch (error) {
        results.push({ name: 'Chain reaction interruption by game state changes', passed: false, error: error.message });
    }

    // Helper functions
    function createMockComponents() {
        return {
            gameBoard: new GameBoard(8, 8),
            gameState: new GameState(),
            renderer: new MockRenderer(),
            inputHandler: new MockInputHandler(),
            audioManager: new MockAudioManager(),
            matchDetector: new MatchDetector(),
            gravitySystem: new GravitySystem()
        };
    }

    function createChainReactionGrid() {
        const grid = [];
        
        // Initialize with random ghosts
        for (let y = 0; y < 8; y++) {
            grid[y] = [];
            for (let x = 0; x < 8; x++) {
                grid[y][x] = {
                    type: Math.floor(Math.random() * 5),
                    x: x,
                    y: y,
                    color: `color-${Math.floor(Math.random() * 5)}`,
                    sprite: `sprite-${Math.floor(Math.random() * 5)}`
                };
            }
        }
        
        // Create a setup that will cause chain reactions:
        // Bottom row: type 0 match that will be eliminated
        grid[7][2] = { type: 0, x: 2, y: 7, color: 'red', sprite: 'ghost-0' };
        grid[7][3] = { type: 0, x: 3, y: 7, color: 'red', sprite: 'ghost-0' };
        grid[7][4] = { type: 0, x: 4, y: 7, color: 'red', sprite: 'ghost-0' };
        
        // Above the match: type 1 ghosts that will fall and potentially create new matches
        grid[6][2] = { type: 1, x: 2, y: 6, color: 'blue', sprite: 'ghost-1' };
        grid[5][2] = { type: 1, x: 2, y: 5, color: 'blue', sprite: 'ghost-1' };
        grid[4][2] = { type: 1, x: 2, y: 4, color: 'blue', sprite: 'ghost-1' };
        
        return grid;
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `Chain Reactions Integration: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}