// Unit tests for GravitySystem class

import { GravitySystem } from '../../js/algorithms/GravitySystem.js';
import { TestUtils } from '../test-config.js';

export default async function runTests() {
    const results = [];
    
    // Test 1: Empty grid handling
    try {
        const gravitySystem = new GravitySystem();
        
        // Test null grid
        const nullMovements = gravitySystem.applyGravity(null);
        if (nullMovements.length !== 0) {
            throw new Error('Null grid should return empty movements');
        }
        
        // Test empty grid
        const emptyMovements = gravitySystem.applyGravity([]);
        if (emptyMovements.length !== 0) {
            throw new Error('Empty grid should return empty movements');
        }
        
        results.push({ name: 'Empty grid handling', passed: true });
    } catch (error) {
        results.push({ name: 'Empty grid handling', passed: false, error: error.message });
    }

    // Test 2: No movement needed (stable grid)
    try {
        const gravitySystem = new GravitySystem();
        const grid = [];
        
        // Create stable 3x3 grid (no gaps)
        for (let y = 0; y < 3; y++) {
            grid[y] = [];
            for (let x = 0; x < 3; x++) {
                grid[y][x] = TestUtils.createMockGhost(x, x, y);
            }
        }
        
        const movements = gravitySystem.applyGravity(grid);
        
        if (movements.length !== 0) {
            throw new Error(`Stable grid should have no movements, got ${movements.length}`);
        }
        
        // Grid should be stable
        if (!gravitySystem.isGridStable(grid)) {
            throw new Error('Stable grid should be detected as stable');
        }
        
        results.push({ name: 'No movement needed (stable grid)', passed: true });
    } catch (error) {
        results.push({ name: 'No movement needed (stable grid)', passed: false, error: error.message });
    }

    // Test 3: Simple gravity application
    try {
        const gravitySystem = new GravitySystem();
        const grid = [];
        
        // Create 3x3 grid with gaps
        for (let y = 0; y < 3; y++) {
            grid[y] = [];
            for (let x = 0; x < 3; x++) {
                grid[y][x] = null;
            }
        }
        
        // Place ghosts with gaps below
        grid[0][1] = TestUtils.createMockGhost(1, 1, 0);
        grid[1][1] = null; // gap
        grid[2][1] = TestUtils.createMockGhost(2, 1, 2);
        
        const movements = gravitySystem.applyGravity(grid);
        
        // Should have one movement (ghost at 0,1 falls to 1,1)
        if (movements.length !== 1) {
            throw new Error(`Expected 1 movement, got ${movements.length}`);
        }
        
        const movement = movements[0];
        if (movement.from.x !== 1 || movement.from.y !== 0) {
            throw new Error('Movement from position incorrect');
        }
        
        if (movement.to.x !== 1 || movement.to.y !== 1) {
            throw new Error('Movement to position incorrect');
        }
        
        // Check final positions
        if (grid[0][1] !== null) {
            throw new Error('Original position should be null after gravity');
        }
        
        if (grid[1][1] === null || grid[1][1].type !== 1) {
            throw new Error('Ghost should have moved to new position');
        }
        
        if (grid[2][1] === null || grid[2][1].type !== 2) {
            throw new Error('Bottom ghost should remain in place');
        }
        
        results.push({ name: 'Simple gravity application', passed: true });
    } catch (error) {
        results.push({ name: 'Simple gravity application', passed: false, error: error.message });
    }

    // Test 4: Multiple column gravity
    try {
        const gravitySystem = new GravitySystem();
        const grid = [];
        
        // Create 4x3 grid
        for (let y = 0; y < 3; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                grid[y][x] = null;
            }
        }
        
        // Column 0: ghost at top
        grid[0][0] = TestUtils.createMockGhost(0, 0, 0);
        
        // Column 1: gap in middle
        grid[0][1] = TestUtils.createMockGhost(1, 1, 0);
        grid[2][1] = TestUtils.createMockGhost(2, 1, 2);
        
        // Column 2: no ghosts
        
        // Column 3: full column
        grid[0][3] = TestUtils.createMockGhost(3, 3, 0);
        grid[1][3] = TestUtils.createMockGhost(4, 3, 1);
        grid[2][3] = TestUtils.createMockGhost(5, 3, 2);
        
        const movements = gravitySystem.applyGravity(grid);
        
        // Should have movements in columns 0 and 1, none in 2 and 3
        const col0Movements = movements.filter(m => m.from.x === 0);
        const col1Movements = movements.filter(m => m.from.x === 1);
        const col2Movements = movements.filter(m => m.from.x === 2);
        const col3Movements = movements.filter(m => m.from.x === 3);
        
        if (col0Movements.length !== 1) {
            throw new Error(`Expected 1 movement in column 0, got ${col0Movements.length}`);
        }
        
        if (col1Movements.length !== 1) {
            throw new Error(`Expected 1 movement in column 1, got ${col1Movements.length}`);
        }
        
        if (col2Movements.length !== 0) {
            throw new Error(`Expected 0 movements in column 2, got ${col2Movements.length}`);
        }
        
        if (col3Movements.length !== 0) {
            throw new Error(`Expected 0 movements in column 3, got ${col3Movements.length}`);
        }
        
        results.push({ name: 'Multiple column gravity', passed: true });
    } catch (error) {
        results.push({ name: 'Multiple column gravity', passed: false, error: error.message });
    }

    // Test 5: Fill empty positions
    try {
        const gravitySystem = new GravitySystem();
        const grid = [];
        
        // Create 3x3 grid with some empty positions
        for (let y = 0; y < 3; y++) {
            grid[y] = [];
            for (let x = 0; x < 3; x++) {
                if ((x + y) % 2 === 0) {
                    grid[y][x] = TestUtils.createMockGhost(x, x, y);
                } else {
                    grid[y][x] = null;
                }
            }
        }
        
        // Count empty positions
        let emptyCount = 0;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (grid[y][x] === null) {
                    emptyCount++;
                }
            }
        }
        
        const newGhosts = gravitySystem.fillEmpty(grid);
        
        // Should create ghosts for all empty positions
        if (newGhosts.length !== emptyCount) {
            throw new Error(`Expected ${emptyCount} new ghosts, got ${newGhosts.length}`);
        }
        
        // Grid should be full after filling
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (grid[y][x] === null) {
                    throw new Error(`Position ${x},${y} should not be null after filling`);
                }
            }
        }
        
        // All new ghosts should have valid properties
        for (const newGhost of newGhosts) {
            const ghost = newGhost.ghost;
            if (typeof ghost.type !== 'number' || ghost.type < 0) {
                throw new Error('New ghost has invalid type');
            }
            
            if (!ghost.color || !ghost.sprite) {
                throw new Error('New ghost missing properties');
            }
        }
        
        results.push({ name: 'Fill empty positions', passed: true });
    } catch (error) {
        results.push({ name: 'Fill empty positions', passed: false, error: error.message });
    }

    // Test 6: Grid stability detection
    try {
        const gravitySystem = new GravitySystem();
        
        // Test stable grid
        const stableGrid = [];
        for (let y = 0; y < 3; y++) {
            stableGrid[y] = [];
            for (let x = 0; x < 3; x++) {
                stableGrid[y][x] = TestUtils.createMockGhost(x, x, y);
            }
        }
        
        if (!gravitySystem.isGridStable(stableGrid)) {
            throw new Error('Full grid should be stable');
        }
        
        // Test unstable grid
        const unstableGrid = JSON.parse(JSON.stringify(stableGrid));
        unstableGrid[1][1] = null; // Create gap with ghost above
        
        if (gravitySystem.isGridStable(unstableGrid)) {
            throw new Error('Grid with floating ghost should be unstable');
        }
        
        // Test grid with gap at bottom (no ghosts above the gap)
        const bottomGapGrid = [];
        for (let y = 0; y < 3; y++) {
            bottomGapGrid[y] = [];
            for (let x = 0; x < 3; x++) {
                bottomGapGrid[y][x] = TestUtils.createMockGhost(x, x, y);
            }
        }
        bottomGapGrid[2][1] = null; // Gap at bottom row
        bottomGapGrid[1][1] = null; // Also clear the position above to avoid floating ghost
        bottomGapGrid[0][1] = null; // Clear entire column to ensure no floating ghosts
        
        if (!gravitySystem.isGridStable(bottomGapGrid)) {
            throw new Error('Grid with bottom gap and no floating ghosts should be stable');
        }
        
        // Test grid with gap and ghost above it (should be unstable)
        const floatingGrid = [];
        for (let y = 0; y < 3; y++) {
            floatingGrid[y] = [];
            for (let x = 0; x < 3; x++) {
                floatingGrid[y][x] = TestUtils.createMockGhost(x, x, y);
            }
        }
        floatingGrid[1][1] = null; // Gap in middle with ghost above
        
        if (gravitySystem.isGridStable(floatingGrid)) {
            throw new Error('Grid with floating ghost should be unstable');
        }
        
        results.push({ name: 'Grid stability detection', passed: true });
    } catch (error) {
        results.push({ name: 'Grid stability detection', passed: false, error: error.message });
    }

    // Test 7: Fall time calculation
    try {
        const gravitySystem = new GravitySystem();
        
        const time1 = gravitySystem.calculateFallTime(1);
        const time2 = gravitySystem.calculateFallTime(2);
        const time3 = gravitySystem.calculateFallTime(3);
        
        if (time1 <= 0 || time2 <= 0 || time3 <= 0) {
            throw new Error('Fall times should be positive');
        }
        
        if (time2 <= time1 || time3 <= time2) {
            throw new Error('Longer distances should take more time');
        }
        
        results.push({ name: 'Fall time calculation', passed: true });
    } catch (error) {
        results.push({ name: 'Fall time calculation', passed: false, error: error.message });
    }

    // Test 8: Fall speed control
    try {
        const gravitySystem = new GravitySystem();
        
        // Test default speed
        if (gravitySystem.getFallSpeed() !== 1) {
            throw new Error(`Expected default speed 1, got ${gravitySystem.getFallSpeed()}`);
        }
        
        // Test setting speed
        gravitySystem.setFallSpeed(2.0);
        if (gravitySystem.getFallSpeed() !== 2.0) {
            throw new Error(`Expected speed 2.0, got ${gravitySystem.getFallSpeed()}`);
        }
        
        // Test speed limits
        gravitySystem.setFallSpeed(5.0); // Should be clamped to 3.0
        if (gravitySystem.getFallSpeed() !== 3.0) {
            throw new Error(`Speed should be clamped to 3.0, got ${gravitySystem.getFallSpeed()}`);
        }
        
        gravitySystem.setFallSpeed(0.05); // Should be clamped to 0.1
        if (gravitySystem.getFallSpeed() !== 0.1) {
            throw new Error(`Speed should be clamped to 0.1, got ${gravitySystem.getFallSpeed()}`);
        }
        
        results.push({ name: 'Fall speed control', passed: true });
    } catch (error) {
        results.push({ name: 'Fall speed control', passed: false, error: error.message });
    }

    // Test 9: Empty space statistics
    try {
        const gravitySystem = new GravitySystem();
        const grid = [];
        
        // Create 4x3 grid with specific empty pattern
        for (let y = 0; y < 3; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                grid[y][x] = TestUtils.createMockGhost(x, x, y);
            }
        }
        
        // Create gaps
        grid[0][1] = null;
        grid[1][1] = null; // Column 1 has 2 empty
        grid[2][2] = null; // Column 2 has 1 empty
        
        const stats = gravitySystem.getEmptySpaceStats(grid);
        
        if (stats.totalEmpty !== 3) {
            throw new Error(`Expected 3 total empty, got ${stats.totalEmpty}`);
        }
        
        if (stats.emptyByColumn[0] !== 0) {
            throw new Error(`Column 0 should have 0 empty, got ${stats.emptyByColumn[0]}`);
        }
        
        if (stats.emptyByColumn[1] !== 2) {
            throw new Error(`Column 1 should have 2 empty, got ${stats.emptyByColumn[1]}`);
        }
        
        if (stats.emptyByColumn[2] !== 1) {
            throw new Error(`Column 2 should have 1 empty, got ${stats.emptyByColumn[2]}`);
        }
        
        if (stats.emptyByColumn[3] !== 0) {
            throw new Error(`Column 3 should have 0 empty, got ${stats.emptyByColumn[3]}`);
        }
        
        results.push({ name: 'Empty space statistics', passed: true });
    } catch (error) {
        results.push({ name: 'Empty space statistics', passed: false, error: error.message });
    }

    // Test 10: Reset functionality
    try {
        const gravitySystem = new GravitySystem();
        
        // Modify state
        gravitySystem.setFallSpeed(2.5);
        
        // Apply gravity to create movements
        const grid = [[null], [TestUtils.createMockGhost(1, 0, 1)]];
        gravitySystem.applyGravity(grid);
        
        // Reset
        gravitySystem.reset();
        
        // Check reset state
        if (gravitySystem.getFallSpeed() !== 1) {
            throw new Error(`Fall speed should reset to 1, got ${gravitySystem.getFallSpeed()}`);
        }
        
        const stats = gravitySystem.getStats();
        if (stats.lastMovements !== 0) {
            throw new Error(`Last movements should be 0 after reset, got ${stats.lastMovements}`);
        }
        
        results.push({ name: 'Reset functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Reset functionality', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `GravitySystem: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}