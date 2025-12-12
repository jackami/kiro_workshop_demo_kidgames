// Property 6: 匹配检测准确性 - Verifies: Requirement 3.1, 3.2
// Property 7: 匹配消除完整性 - Verifies: Requirement 3.3

import fc from 'fast-check';
import { GameBoard } from '../../js/core/GameBoard.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GAME_CONFIG, GHOST_TYPES } from '../../js/constants.js';

// Helper function to create a test grid with known matches
function createGridWithKnownMatches() {
    const grid = [];
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
    
    // Create a known horizontal match at (1,1), (2,1), (3,1)
    grid[1][1] = { type: 0, x: 1, y: 1, color: 'red', sprite: 'ghost-0' };
    grid[1][2] = { type: 0, x: 2, y: 1, color: 'red', sprite: 'ghost-0' };
    grid[1][3] = { type: 0, x: 3, y: 1, color: 'red', sprite: 'ghost-0' };
    
    // Create a known vertical match at (5,2), (5,3), (5,4)
    grid[2][5] = { type: 1, x: 5, y: 2, color: 'blue', sprite: 'ghost-1' };
    grid[3][5] = { type: 1, x: 5, y: 3, color: 'blue', sprite: 'ghost-1' };
    grid[4][5] = { type: 1, x: 5, y: 4, color: 'blue', sprite: 'ghost-1' };
    
    return grid;
}

export default async function runPropertyTests() {
    const results = [];
    
    // Property 6: 匹配检测准确性
    // For any game board containing three or more identical icons in lines, match detection should correctly identify all matches
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1), // We'll use a controlled test
                () => {
                    const matchDetector = new MatchDetector();
                    const grid = createGridWithKnownMatches();
                    
                    const matches = matchDetector.findMatches(grid);
                    
                    // Property: Should find at least the two matches we created
                    if (matches.length < 2) {
                        console.log('Expected at least 2 matches, found:', matches.length);
                        return false;
                    }
                    
                    // Property: Each match should have at least 3 ghosts
                    for (const match of matches) {
                        if (match.length < GAME_CONFIG.MIN_MATCH_LENGTH) {
                            console.log('Found match with insufficient length:', match.length);
                            return false;
                        }
                        
                        // Property: All ghosts in a match should have the same type
                        const firstType = match[0].type;
                        for (const ghost of match) {
                            if (ghost.type !== firstType) {
                                console.log('Match contains different ghost types');
                                return false;
                            }
                        }
                        
                        // Property: Match should be either horizontal or vertical
                        const isHorizontal = match.every(ghost => ghost.y === match[0].y);
                        const isVertical = match.every(ghost => ghost.x === match[0].x);
                        
                        if (!isHorizontal && !isVertical) {
                            console.log('Match is neither horizontal nor vertical');
                            return false;
                        }
                        
                        // Property: Positions should be consecutive
                        if (isHorizontal) {
                            const sortedX = match.map(g => g.x).sort((a, b) => a - b);
                            for (let i = 1; i < sortedX.length; i++) {
                                if (sortedX[i] !== sortedX[i-1] + 1) {
                                    console.log('Horizontal match positions not consecutive');
                                    return false;
                                }
                            }
                        } else {
                            const sortedY = match.map(g => g.y).sort((a, b) => a - b);
                            for (let i = 1; i < sortedY.length; i++) {
                                if (sortedY[i] !== sortedY[i-1] + 1) {
                                    console.log('Vertical match positions not consecutive');
                                    return false;
                                }
                            }
                        }
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 6,
            name: "匹配检测准确性",
            passed: true,
            iterations: 100,
            message: "Match detection correctly identifies all valid matches"
        });
    } catch (error) {
        results.push({
            property: 6,
            name: "匹配检测准确性",
            passed: false,
            message: "Match detection failed to identify matches correctly",
            details: error.message
        });
    }

    // Property 7: 匹配消除完整性
    // For any detected matches, all matched icons should be removed from the game board
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gameBoard = new GameBoard(8, 8);
                    const matchDetector = new MatchDetector();
                    
                    // Create a grid with known matches
                    const grid = createGridWithKnownMatches();
                    gameBoard.grid = grid;
                    
                    // Find matches
                    const matches = matchDetector.findMatches(gameBoard.grid);
                    
                    if (matches.length === 0) return true; // No matches to test
                    
                    // Store positions that should be removed
                    const positionsToRemove = new Set();
                    matches.forEach(match => {
                        match.forEach(ghost => {
                            positionsToRemove.add(`${ghost.x},${ghost.y}`);
                        });
                    });
                    
                    // Remove matches
                    gameBoard.removeMatches(matches);
                    
                    // Property: All matched positions should now be null
                    for (const posKey of positionsToRemove) {
                        const [x, y] = posKey.split(',').map(Number);
                        const cell = gameBoard.getCell(x, y);
                        
                        if (cell !== null) {
                            console.log(`Position ${x},${y} should be null after match removal`);
                            return false;
                        }
                    }
                    
                    // Property: Non-matched positions should remain unchanged
                    for (let y = 0; y < 8; y++) {
                        for (let x = 0; x < 8; x++) {
                            const posKey = `${x},${y}`;
                            if (!positionsToRemove.has(posKey)) {
                                const cell = gameBoard.getCell(x, y);
                                if (cell === null) {
                                    console.log(`Non-matched position ${x},${y} was incorrectly removed`);
                                    return false;
                                }
                            }
                        }
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 7,
            name: "匹配消除完整性",
            passed: true,
            iterations: 100,
            message: "All matched icons are completely removed from the board"
        });
    } catch (error) {
        results.push({
            property: 7,
            name: "匹配消除完整性",
            passed: false,
            message: "Match removal was incomplete or incorrect",
            details: error.message
        });
    }

    // Additional property: No false positives in match detection
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const matchDetector = new MatchDetector();
                    
                    // Create a grid with no matches (alternating pattern)
                    const grid = [];
                    for (let y = 0; y < 8; y++) {
                        grid[y] = [];
                        for (let x = 0; x < 8; x++) {
                            const type = (x + y) % 2; // Alternating pattern
                            grid[y][x] = {
                                type: type,
                                x: x,
                                y: y,
                                color: `color-${type}`,
                                sprite: `sprite-${type}`
                            };
                        }
                    }
                    
                    const matches = matchDetector.findMatches(grid);
                    
                    // Property: Should find no matches in alternating pattern
                    return matches.length === 0;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "无误报匹配检测",
            passed: true,
            iterations: 100,
            message: "Match detection produces no false positives"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "无误报匹配检测",
            passed: false,
            message: "Match detection produced false positives",
            details: error.message
        });
    }

    // Additional property: Valid moves detection
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const matchDetector = new MatchDetector();
                    const gameBoard = new GameBoard(8, 8);
                    
                    // Property: hasValidMoves should return boolean
                    const hasValidMoves = matchDetector.hasValidMoves(gameBoard.grid);
                    
                    if (typeof hasValidMoves !== 'boolean') {
                        return false;
                    }
                    
                    // If it says there are valid moves, findValidMoves should return some
                    if (hasValidMoves) {
                        const validMoves = matchDetector.findValidMoves(gameBoard.grid);
                        return validMoves.length > 0;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "有效移动检测",
            passed: true,
            iterations: 100,
            message: "Valid move detection is consistent"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "有效移动检测",
            passed: false,
            message: "Valid move detection failed",
            details: error.message
        });
    }

    // Return overall result
    const allPassed = results.every(r => r.passed);
    const failedCount = results.filter(r => !r.passed).length;
    
    return {
        passed: allPassed,
        message: allPassed ? 
            `All ${results.length} match detection properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 100,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}