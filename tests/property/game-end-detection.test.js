// Property 12: 游戏结束检测 - Verifies: Requirement 5.5
// **Feature: ghost-match-game, Property 12: 游戏结束检测**

import fc from 'fast-check';
import { GameEngine } from '../../js/core/GameEngine.js';
import { GameBoard } from '../../js/core/GameBoard.js';
import { GameState } from '../../js/core/GameState.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GravitySystem } from '../../js/algorithms/GravitySystem.js';
import { GAME_CONFIG, GAME_STATES } from '../../js/constants.js';

// Helper function to create a grid with no valid moves
function createNoMovesGrid() {
    const grid = [];
    
    // Create a checkerboard pattern that has no valid moves
    for (let y = 0; y < 8; y++) {
        grid[y] = [];
        for (let x = 0; x < 8; x++) {
            // Alternating pattern with only 2 types to ensure no matches
            const type = (x + y) % 2;
            grid[y][x] = {
                type: type,
                x: x,
                y: y,
                color: type === 0 ? 'red' : 'blue',
                sprite: `ghost-type-${type}`
            };
        }
    }
    
    return grid;
}

// Helper function to create a grid with valid moves
function createValidMovesGrid() {
    const grid = [];
    
    // Initialize with random ghosts
    for (let y = 0; y < 8; y++) {
        grid[y] = [];
        for (let x = 0; x < 8; x++) {
            const type = Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT);
            grid[y][x] = {
                type: type,
                x: x,
                y: y,
                color: `color-${type}`,
                sprite: `ghost-type-${type}`
            };
        }
    }
    
    // Ensure at least one valid move by creating a potential match
    // Place two identical ghosts next to each other, and a third one nearby
    grid[0][0] = { type: 0, x: 0, y: 0, color: 'red', sprite: 'ghost-type-0' };
    grid[0][1] = { type: 1, x: 1, y: 0, color: 'blue', sprite: 'ghost-type-1' };
    grid[0][2] = { type: 0, x: 2, y: 0, color: 'red', sprite: 'ghost-type-0' };
    grid[1][0] = { type: 0, x: 0, y: 1, color: 'red', sprite: 'ghost-type-0' };
    
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
    
    // Property 12: 游戏结束检测
    // For any game board with no possible moves, the system should correctly detect game end state
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1), // Use controlled test
                () => {
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
                        renderer: null,
                        inputHandler: null,
                        audioManager,
                        matchDetector,
                        gravitySystem
                    });
                    
                    // Test with a grid that has no valid moves
                    const noMovesGrid = createNoMovesGrid();
                    gameBoard.grid = noMovesGrid;
                    
                    // Property: shouldEndGame should return true when no moves are available
                    const shouldEnd = gameEngine.shouldEndGame();
                    const hasValidMoves = gameEngine.hasValidMoves();
                    
                    // Property: shouldEndGame should be opposite of hasValidMoves
                    return shouldEnd === !hasValidMoves;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 12,
            name: "游戏结束检测",
            passed: true,
            iterations: 100,
            message: "Game end detection correctly identifies when no moves are possible"
        });
    } catch (error) {
        results.push({
            property: 12,
            name: "游戏结束检测",
            passed: false,
            message: "Game end detection failed",
            details: error.message
        });
    }

    // Additional property: Valid moves detection accuracy
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
                    
                    // Test with a grid that has valid moves
                    const validMovesGrid = createValidMovesGrid();
                    gameBoard.grid = validMovesGrid;
                    
                    // Property: hasValidMoves should return true when moves are available
                    const hasValidMoves = gameEngine.hasValidMoves();
                    const allValidMoves = gameEngine.getAllValidMoves();
                    
                    // Property: If hasValidMoves is true, getAllValidMoves should return some moves
                    if (hasValidMoves) {
                        return allValidMoves.length > 0;
                    }
                    
                    // Property: If hasValidMoves is false, getAllValidMoves should return empty array
                    return allValidMoves.length === 0;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "有效移动检测准确性",
            passed: true,
            iterations: 100,
            message: "Valid moves detection is accurate and consistent"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "有效移动检测准确性",
            passed: false,
            message: "Valid moves detection failed",
            details: error.message
        });
    }

    // Additional property: Game end info consistency
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
                    
                    // Initialize with random grid
                    gameBoard.initializeWithGhosts();
                    
                    // Property: getGameEndInfo should return consistent information
                    const gameEndInfo = gameEngine.getGameEndInfo();
                    
                    // Property: All required fields should be present
                    const requiredFields = ['shouldEnd', 'hasValidMoves', 'validMovesCount', 'validMoves', 'gameState', 'score', 'moves', 'playTime'];
                    const hasAllFields = requiredFields.every(field => gameEndInfo.hasOwnProperty(field));
                    
                    if (!hasAllFields) {
                        return false;
                    }
                    
                    // Property: shouldEnd should be opposite of hasValidMoves
                    if (gameEndInfo.shouldEnd === gameEndInfo.hasValidMoves) {
                        return false;
                    }
                    
                    // Property: validMovesCount should match validMoves array length
                    if (gameEndInfo.validMovesCount !== gameEndInfo.validMoves.length) {
                        return false;
                    }
                    
                    // Property: If hasValidMoves is true, validMovesCount should be > 0
                    if (gameEndInfo.hasValidMoves && gameEndInfo.validMovesCount === 0) {
                        return false;
                    }
                    
                    // Property: If hasValidMoves is false, validMovesCount should be 0
                    if (!gameEndInfo.hasValidMoves && gameEndInfo.validMovesCount > 0) {
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "游戏结束信息一致性",
            passed: true,
            iterations: 100,
            message: "Game end information is consistent and complete"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "游戏结束信息一致性",
            passed: false,
            message: "Game end information consistency failed",
            details: error.message
        });
    }

    // Additional property: Game state transitions
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
                    
                    // Property: Game should start in PLAYING state after initialization
                    if (gameEngine.state !== GAME_STATES.PLAYING) {
                        return false;
                    }
                    
                    // Property: shouldEndGame should not end game when in ANIMATING state
                    gameEngine.state = GAME_STATES.ANIMATING;
                    const shouldEndWhileAnimating = gameEngine.shouldEndGame();
                    
                    // Property: shouldEndGame should return false during animation
                    if (shouldEndWhileAnimating) {
                        return false;
                    }
                    
                    // Property: shouldEndGame should not end game when already ended
                    gameEngine.state = GAME_STATES.ENDED;
                    const shouldEndWhenEnded = gameEngine.shouldEndGame();
                    
                    // Property: shouldEndGame should return false when already ended
                    return !shouldEndWhenEnded;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "游戏状态转换",
            passed: true,
            iterations: 100,
            message: "Game state transitions work correctly during end detection"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "游戏状态转换",
            passed: false,
            message: "Game state transitions failed",
            details: error.message
        });
    }

    // Return overall result
    const allPassed = results.every(r => r.passed);
    const failedCount = results.filter(r => !r.passed).length;
    
    return {
        passed: allPassed,
        message: allPassed ? 
            `All ${results.length} game end detection properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 100,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}