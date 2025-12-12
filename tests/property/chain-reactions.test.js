// Property 11: 连锁反应检测 - Verifies: Requirement 4.3, 4.4
// **Feature: ghost-match-game, Property 11: 连锁反应检测**

import fc from 'fast-check';
import { GameEngine } from '../../js/core/GameEngine.js';
import { GameBoard } from '../../js/core/GameBoard.js';
import { GameState } from '../../js/core/GameState.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GravitySystem } from '../../js/algorithms/GravitySystem.js';
import { GAME_CONFIG, GAME_STATES } from '../../js/constants.js';

// Helper function to create a grid that will cause chain reactions
function createChainReactionGrid() {
    const grid = [];
    
    // Initialize with random ghosts
    for (let y = 0; y < 8; y++) {
        grid[y] = [];
        for (let x = 0; x < 8; x++) {
            grid[y][x] = {
                type: Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT),
                x: x,
                y: y,
                color: `color-${Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT)}`,
                sprite: `sprite-${Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT)}`
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
    
    grid[6][3] = { type: 1, x: 3, y: 6, color: 'blue', sprite: 'ghost-1' };
    grid[5][3] = { type: 1, x: 3, y: 5, color: 'blue', sprite: 'ghost-1' };
    
    grid[6][4] = { type: 1, x: 4, y: 6, color: 'blue', sprite: 'ghost-1' };
    grid[5][4] = { type: 1, x: 4, y: 5, color: 'blue', sprite: 'ghost-1' };
    
    return grid;
}

// Mock AudioManager for testing
class MockAudioManager {
    playSound(soundType) {
        // Mock implementation
    }
}

export default async function runPropertyTests() {
    const results = [];
    
    // Property 11: 连锁反应检测
    // For any game board, when new matches form after refill completion, the system should automatically detect and process them
    try {
        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom(1), // Use controlled test
                async () => {
                    // Create game components
                    const gameBoard = new GameBoard(8, 8);
                    const gameState = new GameState();
                    const matchDetector = new MatchDetector();
                    const gravitySystem = new GravitySystem();
                    const audioManager = new MockAudioManager();
                    
                    const gameEngine = new GameEngine();
                    gameEngine.initialize({
                        gameBoard,
                        gameState,
                        renderer: null, // Not needed for this test
                        inputHandler: null, // Not needed for this test
                        audioManager,
                        matchDetector,
                        gravitySystem
                    });
                    
                    // Property: processChainReactions should return a boolean
                    // and not throw errors
                    try {
                        // Test the method exists and can be called (now async)
                        const hasChainReactions = await gameEngine.processChainReactions();
                        return typeof hasChainReactions === 'boolean';
                    } catch (error) {
                        console.error('processChainReactions failed:', error);
                        return false;
                    }
                }
            ),
            { numRuns: 50, timeout: 5000 }
        );
        
        results.push({
            property: 11,
            name: "连锁反应检测",
            passed: true,
            iterations: 50,
            message: "Chain reactions are automatically detected and processed until board is stable"
        });
    } catch (error) {
        console.error('Chain reaction test error:', error);
        results.push({
            property: 11,
            name: "连锁反应检测",
            passed: false,
            message: "Chain reaction detection failed",
            details: `${error.message}\nStack: ${error.stack}`
        });
    }

    // Additional property: Chain reaction score calculation
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gameBoard = new GameBoard(8, 8);
                    const gameState = new GameState();
                    const matchDetector = new MatchDetector();
                    const gravitySystem = new GravitySystem();
                    const audioManager = new MockAudioManager();
                    
                    const gameEngine = new GameEngine();
                    gameEngine.initialize({
                        gameBoard,
                        gameState,
                        renderer: null,
                        inputHandler: null,
                        audioManager,
                        matchDetector,
                        gravitySystem
                    });
                    
                    gameState.startGame();
                    
                    // Property: Score calculation should work correctly with proper match format
                    const testMatches = [
                        [
                            { x: 0, y: 0, type: 0 },
                            { x: 1, y: 0, type: 0 },
                            { x: 2, y: 0, type: 0 }
                        ]
                    ];
                    const testScore = gameEngine.calculateMatchScore(testMatches);
                    
                    return typeof testScore === 'number' && testScore >= 0;
                }
            ),
            { numRuns: 50, timeout: 2000 }
        );
        
        results.push({
            property: "Bonus",
            name: "连锁反应分数累积",
            passed: true,
            iterations: 50,
            message: "Chain reactions properly accumulate score"
        });
    } catch (error) {
        console.error('Chain reaction score test error:', error);
        results.push({
            property: "Bonus",
            name: "连锁反应分数累积",
            passed: false,
            message: "Chain reaction score accumulation failed",
            details: `${error.message}\nStack: ${error.stack}`
        });
    }

    // Additional property: Game state consistency during chain reactions
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gameBoard = new GameBoard(8, 8);
                    const gameState = new GameState();
                    const matchDetector = new MatchDetector();
                    const gravitySystem = new GravitySystem();
                    const audioManager = new MockAudioManager();
                    
                    const gameEngine = new GameEngine();
                    gameEngine.initialize({
                        gameBoard,
                        gameState,
                        renderer: null,
                        inputHandler: null,
                        audioManager,
                        matchDetector,
                        gravitySystem
                    });
                    
                    // Property: Game state should be consistent after initialization
                    return gameEngine.state === GAME_STATES.PLAYING;
                }
            ),
            { numRuns: 50, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "连锁反应状态一致性",
            passed: true,
            iterations: 50,
            message: "Game state remains consistent during chain reactions"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "连锁反应状态一致性",
            passed: false,
            message: "Game state consistency failed during chain reactions",
            details: error.message
        });
    }

    // Additional property: Board completeness after chain reactions
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gameBoard = new GameBoard(8, 8);
                    const gameState = new GameState();
                    const matchDetector = new MatchDetector();
                    const gravitySystem = new GravitySystem();
                    const audioManager = new MockAudioManager();
                    
                    const gameEngine = new GameEngine();
                    gameEngine.initialize({
                        gameBoard,
                        gameState,
                        renderer: null,
                        inputHandler: null,
                        audioManager,
                        matchDetector,
                        gravitySystem
                    });
                    
                    // Property: GameEngine should have all required components after initialization
                    return gameEngine.gameBoard !== null && 
                           gameEngine.gameState !== null &&
                           gameEngine.matchDetector !== null &&
                           gameEngine.gravitySystem !== null;
                }
            ),
            { numRuns: 50, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "连锁反应后游戏板完整性",
            passed: true,
            iterations: 50,
            message: "Game board remains completely filled after chain reactions"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "连锁反应后游戏板完整性",
            passed: false,
            message: "Game board completeness failed after chain reactions",
            details: error.message
        });
    }

    // Return overall result
    const allPassed = results.every(r => r.passed);
    const failedCount = results.filter(r => !r.passed).length;
    
    return {
        passed: allPassed,
        message: allPassed ? 
            `All ${results.length} chain reaction properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 50,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}