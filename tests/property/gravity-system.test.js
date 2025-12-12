// Property 9: 重力系统一致性 - Verifies: Requirement 4.1
// Property 10: 补充机制完整性 - Verifies: Requirement 4.2
// Property 11: 连锁反应检测 - Verifies: Requirement 4.3, 4.4

import fc from 'fast-check';
import { GameBoard } from '../../js/core/GameBoard.js';
import { GravitySystem } from '../../js/algorithms/GravitySystem.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GAME_CONFIG } from '../../js/constants.js';

// Helper function to create a grid with gaps
function createGridWithGaps() {
    const grid = [];
    for (let y = 0; y < 8; y++) {
        grid[y] = [];
        for (let x = 0; x < 8; x++) {
            // Create some gaps (null positions)
            if ((x + y) % 3 === 0) {
                grid[y][x] = null;
            } else {
                grid[y][x] = {
                    type: Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT),
                    x: x,
                    y: y,
                    color: `color-${Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT)}`,
                    sprite: `sprite-${Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT)}`
                };
            }
        }
    }
    return grid;
}

export default async function runPropertyTests() {
    const results = [];
    
    // Property 9: 重力系统一致性
    // For any game board with empty positions, after gravity application all icons should move down to lowest possible positions
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gravitySystem = new GravitySystem();
                    const grid = createGridWithGaps();
                    
                    // Apply gravity
                    const movements = gravitySystem.applyGravity(grid);
                    
                    // Property: After gravity, no ghost should have empty space below it
                    for (let x = 0; x < 8; x++) {
                        for (let y = 0; y < 7; y++) { // Don't check bottom row
                            if (grid[y][x] !== null) {
                                // Check if there's empty space below
                                for (let checkY = y + 1; checkY < 8; checkY++) {
                                    if (grid[checkY][x] === null) {
                                        console.log(`Ghost at ${x},${y} has empty space below at ${x},${checkY}`);
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Property: All movements should be downward
                    for (const movement of movements) {
                        if (movement.to.y <= movement.from.y) {
                            console.log('Movement is not downward:', movement);
                            return false;
                        }
                        
                        if (movement.to.x !== movement.from.x) {
                            console.log('Movement changed horizontal position:', movement);
                            return false;
                        }
                    }
                    
                    // Property: Ghost positions should be updated correctly
                    for (let y = 0; y < 8; y++) {
                        for (let x = 0; x < 8; x++) {
                            const ghost = grid[y][x];
                            if (ghost && (ghost.x !== x || ghost.y !== y)) {
                                console.log(`Ghost position mismatch at ${x},${y}: ghost says ${ghost.x},${ghost.y}`);
                                return false;
                            }
                        }
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 9,
            name: "重力系统一致性",
            passed: true,
            iterations: 100,
            message: "Gravity system correctly moves all icons to lowest positions"
        });
    } catch (error) {
        results.push({
            property: 9,
            name: "重力系统一致性",
            passed: false,
            message: "Gravity system failed to move icons correctly",
            details: error.message
        });
    }

    // Property 10: 补充机制完整性
    // For any game board after gravity application, all empty positions should be filled with new random icons
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gravitySystem = new GravitySystem();
                    const grid = createGridWithGaps();
                    
                    // Apply gravity first
                    gravitySystem.applyGravity(grid);
                    
                    // Count empty positions before fill
                    let emptyCount = 0;
                    for (let y = 0; y < 8; y++) {
                        for (let x = 0; x < 8; x++) {
                            if (grid[y][x] === null) {
                                emptyCount++;
                            }
                        }
                    }
                    
                    // Fill empty positions
                    const newGhosts = gravitySystem.fillEmpty(grid);
                    
                    // Property: Number of new ghosts should equal number of empty positions
                    if (newGhosts.length !== emptyCount) {
                        console.log(`Expected ${emptyCount} new ghosts, got ${newGhosts.length}`);
                        return false;
                    }
                    
                    // Property: After filling, no position should be empty
                    for (let y = 0; y < 8; y++) {
                        for (let x = 0; x < 8; x++) {
                            if (grid[y][x] === null) {
                                console.log(`Position ${x},${y} is still empty after filling`);
                                return false;
                            }
                        }
                    }
                    
                    // Property: All new ghosts should have valid properties
                    for (const newGhost of newGhosts) {
                        const ghost = newGhost.ghost;
                        const pos = newGhost.position;
                        
                        if (typeof ghost.type !== 'number' || 
                            ghost.type < 0 || 
                            ghost.type >= GAME_CONFIG.GHOST_TYPE_COUNT) {
                            console.log('New ghost has invalid type:', ghost.type);
                            return false;
                        }
                        
                        if (ghost.x !== pos.x || ghost.y !== pos.y) {
                            console.log('New ghost position mismatch');
                            return false;
                        }
                        
                        if (!ghost.color || !ghost.sprite) {
                            console.log('New ghost missing color or sprite');
                            return false;
                        }
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 10,
            name: "补充机制完整性",
            passed: true,
            iterations: 100,
            message: "Fill mechanism correctly fills all empty positions with valid ghosts"
        });
    } catch (error) {
        results.push({
            property: 10,
            name: "补充机制完整性",
            passed: false,
            message: "Fill mechanism failed to fill positions correctly",
            details: error.message
        });
    }

    // Property 11: 连锁反应检测
    // For any game board after refill completion, if new matches form, system should automatically detect and handle them
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gravitySystem = new GravitySystem();
                    const matchDetector = new MatchDetector();
                    
                    // Create a scenario that might lead to chain reactions
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
                    
                    // Remove some positions to create gaps
                    grid[3][2] = null;
                    grid[4][2] = null;
                    grid[5][2] = null;
                    
                    // Set up potential chain reaction by placing specific ghosts
                    grid[0][2] = { type: 0, x: 2, y: 0, color: 'red', sprite: 'ghost-0' };
                    grid[1][2] = { type: 0, x: 2, y: 1, color: 'red', sprite: 'ghost-0' };
                    grid[2][2] = { type: 0, x: 2, y: 2, color: 'red', sprite: 'ghost-0' };
                    
                    // Apply gravity
                    gravitySystem.applyGravity(grid);
                    
                    // Fill empty positions
                    gravitySystem.fillEmpty(grid);
                    
                    // Property: System should be able to detect if new matches formed
                    const matches = matchDetector.findMatches(grid);
                    
                    // Property: Match detection should work on filled grid
                    if (matches.length > 0) {
                        // Verify matches are valid
                        for (const match of matches) {
                            if (match.length < GAME_CONFIG.MIN_MATCH_LENGTH) {
                                console.log('Invalid match length detected');
                                return false;
                            }
                            
                            const firstType = match[0].type;
                            for (const ghost of match) {
                                if (ghost.type !== firstType) {
                                    console.log('Match contains different types');
                                    return false;
                                }
                            }
                        }
                    }
                    
                    // Property: Grid should be stable (no floating ghosts)
                    return gravitySystem.isGridStable(grid);
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 11,
            name: "连锁反应检测",
            passed: true,
            iterations: 100,
            message: "Chain reaction detection works correctly after refill"
        });
    } catch (error) {
        results.push({
            property: 11,
            name: "连锁反应检测",
            passed: false,
            message: "Chain reaction detection failed",
            details: error.message
        });
    }

    // Additional property: Grid stability check
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gravitySystem = new GravitySystem();
                    
                    // Create a stable grid (no gaps)
                    const stableGrid = [];
                    for (let y = 0; y < 8; y++) {
                        stableGrid[y] = [];
                        for (let x = 0; x < 8; x++) {
                            stableGrid[y][x] = {
                                type: Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT),
                                x: x,
                                y: y,
                                color: 'test',
                                sprite: 'test'
                            };
                        }
                    }
                    
                    // Property: Stable grid should be detected as stable
                    if (!gravitySystem.isGridStable(stableGrid)) {
                        return false;
                    }
                    
                    // Create unstable grid
                    const unstableGrid = JSON.parse(JSON.stringify(stableGrid));
                    unstableGrid[3][2] = null; // Create a gap with ghosts above
                    
                    // Property: Unstable grid should be detected as unstable
                    return !gravitySystem.isGridStable(unstableGrid);
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "网格稳定性检测",
            passed: true,
            iterations: 100,
            message: "Grid stability detection works correctly"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "网格稳定性检测",
            passed: false,
            message: "Grid stability detection failed",
            details: error.message
        });
    }

    // Return overall result
    const allPassed = results.every(r => r.passed);
    const failedCount = results.filter(r => !r.passed).length;
    
    return {
        passed: allPassed,
        message: allPassed ? 
            `All ${results.length} gravity system properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 100,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}