// Unit tests for GameBoard class

import { GameBoard } from '../../js/core/GameBoard.js';
import { GAME_CONFIG } from '../../js/constants.js';
import { TestUtils } from '../test-config.js';

export default async function runTests() {
    const results = [];
    
    // Test 1: Constructor creates correct dimensions
    try {
        const board = new GameBoard(6, 8);
        
        if (board.width !== 6 || board.height !== 8) {
            throw new Error(`Expected 6x8, got ${board.width}x${board.height}`);
        }
        
        if (board.grid.length !== 8) {
            throw new Error(`Expected 8 rows, got ${board.grid.length}`);
        }
        
        if (board.grid[0].length !== 6) {
            throw new Error(`Expected 6 columns, got ${board.grid[0].length}`);
        }
        
        results.push({ name: 'Constructor dimensions', passed: true });
    } catch (error) {
        results.push({ name: 'Constructor dimensions', passed: false, error: error.message });
    }

    // Test 2: Default constructor uses standard size
    try {
        const board = new GameBoard();
        
        if (board.width !== GAME_CONFIG.BOARD_SIZE || board.height !== GAME_CONFIG.BOARD_SIZE) {
            throw new Error(`Expected ${GAME_CONFIG.BOARD_SIZE}x${GAME_CONFIG.BOARD_SIZE}, got ${board.width}x${board.height}`);
        }
        
        results.push({ name: 'Default constructor size', passed: true });
    } catch (error) {
        results.push({ name: 'Default constructor size', passed: false, error: error.message });
    }

    // Test 3: getCell and setCell work correctly
    try {
        const board = new GameBoard(4, 4);
        const testGhost = TestUtils.createMockGhost(2, 1, 2);
        
        // Test setCell
        const setResult = board.setCell(1, 2, testGhost);
        if (!setResult) {
            throw new Error('setCell should return true for valid position');
        }
        
        // Test getCell
        const retrieved = board.getCell(1, 2);
        if (!retrieved || retrieved.type !== 2) {
            throw new Error('getCell should return the set ghost');
        }
        
        if (retrieved.x !== 1 || retrieved.y !== 2) {
            throw new Error('Ghost position should be updated by setCell');
        }
        
        results.push({ name: 'getCell and setCell', passed: true });
    } catch (error) {
        results.push({ name: 'getCell and setCell', passed: false, error: error.message });
    }

    // Test 4: Invalid position handling
    try {
        const board = new GameBoard(4, 4);
        
        // Test invalid getCell
        const invalidGet = board.getCell(-1, 5);
        if (invalidGet !== null) {
            throw new Error('getCell should return null for invalid position');
        }
        
        // Test invalid setCell
        const invalidSet = board.setCell(10, -2, TestUtils.createMockGhost(1, 10, -2));
        if (invalidSet !== false) {
            throw new Error('setCell should return false for invalid position');
        }
        
        results.push({ name: 'Invalid position handling', passed: true });
    } catch (error) {
        results.push({ name: 'Invalid position handling', passed: false, error: error.message });
    }

    // Test 5: swapCells functionality
    try {
        const board = new GameBoard(4, 4);
        const ghost1 = TestUtils.createMockGhost(1, 0, 0);
        const ghost2 = TestUtils.createMockGhost(2, 1, 0);
        
        board.setCell(0, 0, ghost1);
        board.setCell(1, 0, ghost2);
        
        // Perform swap
        const swapResult = board.swapCells({ x: 0, y: 0 }, { x: 1, y: 0 });
        if (!swapResult) {
            throw new Error('swapCells should return true for valid positions');
        }
        
        // Check positions after swap
        const newGhost1 = board.getCell(0, 0);
        const newGhost2 = board.getCell(1, 0);
        
        if (newGhost1.type !== 2 || newGhost2.type !== 1) {
            throw new Error('Ghosts should be swapped');
        }
        
        if (newGhost1.x !== 0 || newGhost1.y !== 0) {
            throw new Error('Ghost1 position should be updated after swap');
        }
        
        if (newGhost2.x !== 1 || newGhost2.y !== 0) {
            throw new Error('Ghost2 position should be updated after swap');
        }
        
        results.push({ name: 'swapCells functionality', passed: true });
    } catch (error) {
        results.push({ name: 'swapCells functionality', passed: false, error: error.message });
    }

    // Test 6: Adjacent positions calculation
    try {
        const board = new GameBoard(4, 4);
        
        // Test center position
        const centerAdjacent = board.getAdjacentPositions(1, 1);
        if (centerAdjacent.length !== 4) {
            throw new Error(`Center position should have 4 adjacent positions, got ${centerAdjacent.length}`);
        }
        
        // Test corner position
        const cornerAdjacent = board.getAdjacentPositions(0, 0);
        if (cornerAdjacent.length !== 2) {
            throw new Error(`Corner position should have 2 adjacent positions, got ${cornerAdjacent.length}`);
        }
        
        // Test edge position
        const edgeAdjacent = board.getAdjacentPositions(0, 1);
        if (edgeAdjacent.length !== 3) {
            throw new Error(`Edge position should have 3 adjacent positions, got ${edgeAdjacent.length}`);
        }
        
        results.push({ name: 'Adjacent positions calculation', passed: true });
    } catch (error) {
        results.push({ name: 'Adjacent positions calculation', passed: false, error: error.message });
    }

    // Test 7: Grid statistics
    try {
        const board = new GameBoard(4, 4);
        
        // Test empty board stats
        let stats = board.getStats();
        
        if (stats.totalCells !== 16) {
            throw new Error(`Expected 16 total cells, got ${stats.totalCells}`);
        }
        
        if (stats.filledCells !== 0) {
            throw new Error(`Expected 0 filled cells in empty board, got ${stats.filledCells}`);
        }
        
        if (stats.emptyCells !== 16) {
            throw new Error(`Expected 16 empty cells in empty board, got ${stats.emptyCells}`);
        }
        
        // Fill the board and test again
        board.initializeWithGhosts();
        stats = board.getStats();
        
        if (stats.filledCells !== 16) {
            throw new Error(`Expected 16 filled cells after initialization, got ${stats.filledCells}`);
        }
        
        if (stats.emptyCells !== 0) {
            throw new Error(`Expected 0 empty cells after initialization, got ${stats.emptyCells}`);
        }
        
        // Check ghost type counts
        let totalGhosts = 0;
        for (let i = 0; i < GAME_CONFIG.GHOST_TYPE_COUNT; i++) {
            totalGhosts += stats.ghostTypes[i] || 0;
        }
        
        if (totalGhosts !== 16) {
            throw new Error(`Ghost type counts don't add up to 16, got ${totalGhosts}`);
        }
        
        results.push({ name: 'Grid statistics', passed: true });
    } catch (error) {
        results.push({ name: 'Grid statistics', passed: false, error: error.message });
    }

    // Test 8: Grid state checks
    try {
        const board = new GameBoard(3, 3);
        
        // Should be empty initially (new behavior)
        if (board.isFull()) {
            throw new Error('Newly created board should not be full');
        }
        
        if (!board.isEmpty()) {
            throw new Error('Newly created board should be empty');
        }
        
        // Fill the board
        board.initializeWithGhosts();
        
        if (!board.isFull()) {
            throw new Error('Board should be full after initialization');
        }
        
        if (board.isEmpty()) {
            throw new Error('Initialized board should not be empty');
        }
        
        // Clear some cells
        board.setCell(0, 0, null);
        board.setCell(1, 1, null);
        
        if (board.isFull()) {
            throw new Error('Board with null cells should not be full');
        }
        
        if (board.isEmpty()) {
            throw new Error('Board with some ghosts should not be empty');
        }
        
        // Clear all cells
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                board.setCell(x, y, null);
            }
        }
        
        if (!board.isEmpty()) {
            throw new Error('Board with all null cells should be empty');
        }
        
        if (board.isFull()) {
            throw new Error('Empty board should not be full');
        }
        
        results.push({ name: 'Grid state checks', passed: true });
    } catch (error) {
        results.push({ name: 'Grid state checks', passed: false, error: error.message });
    }

    // Test 9: Reset functionality
    try {
        const board = new GameBoard(4, 4);
        
        // Fill the board first
        board.initializeWithGhosts();
        
        // Modify the board
        board.setCell(0, 0, null);
        board.setCell(1, 1, null);
        
        // Reset (should clear to empty)
        board.reset();
        
        // Should be empty after reset
        if (!board.isEmpty()) {
            throw new Error('Board should be empty after reset');
        }
        
        // Test resetWithGhosts
        board.resetWithGhosts();
        
        // Should be full after resetWithGhosts
        if (!board.isFull()) {
            throw new Error('Board should be full after resetWithGhosts');
        }
        
        // All positions should have valid ghosts
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const ghost = board.getCell(x, y);
                if (!ghost || typeof ghost.type !== 'number') {
                    throw new Error(`Invalid ghost at ${x},${y} after resetWithGhosts`);
                }
            }
        }
        
        results.push({ name: 'Reset functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Reset functionality', passed: false, error: error.message });
    }

    // Test 10: Match creation prevention
    try {
        const board = new GameBoard(8, 8);
        
        // Initialize with smart filling algorithm
        board.initializeWithGhosts();
        
        // Check that no initial matches exist
        // This is a basic check - the property test covers this more thoroughly
        let hasThreeInRow = false;
        
        // Check horizontal
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 6; x++) {
                const type1 = board.getCell(x, y)?.type;
                const type2 = board.getCell(x + 1, y)?.type;
                const type3 = board.getCell(x + 2, y)?.type;
                
                if (type1 === type2 && type2 === type3) {
                    hasThreeInRow = true;
                    break;
                }
            }
            if (hasThreeInRow) break;
        }
        
        // Check vertical
        if (!hasThreeInRow) {
            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 6; y++) {
                    const type1 = board.getCell(x, y)?.type;
                    const type2 = board.getCell(x, y + 1)?.type;
                    const type3 = board.getCell(x, y + 2)?.type;
                    
                    if (type1 === type2 && type2 === type3) {
                        hasThreeInRow = true;
                        break;
                    }
                }
                if (hasThreeInRow) break;
            }
        }
        
        if (hasThreeInRow) {
            throw new Error('Initial board should not have three in a row');
        }
        
        results.push({ name: 'Match creation prevention', passed: true });
    } catch (error) {
        results.push({ name: 'Match creation prevention', passed: false, error: error.message });
    }

    // Test 11: Ghost creation and validation
    try {
        const board = new GameBoard(4, 4);
        
        // Test valid ghost creation
        const ghost = board.createGhost(2, 3, 1);
        
        if (ghost.type !== 2) {
            throw new Error('Ghost type should match input');
        }
        
        if (ghost.x !== 3 || ghost.y !== 1) {
            throw new Error('Ghost position should match input');
        }
        
        if (!ghost.color || !ghost.sprite) {
            throw new Error('Ghost should have color and sprite properties');
        }
        
        // Test invalid ghost type
        try {
            board.createGhost(-1, 0, 0);
            throw new Error('Should throw error for invalid ghost type');
        } catch (error) {
            if (!error.message.includes('Invalid ghost type')) {
                throw new Error('Should throw specific error for invalid ghost type');
            }
        }
        
        try {
            board.createGhost(10, 0, 0);
            throw new Error('Should throw error for ghost type too high');
        } catch (error) {
            if (!error.message.includes('Invalid ghost type')) {
                throw new Error('Should throw specific error for ghost type too high');
            }
        }
        
        results.push({ name: 'Ghost creation and validation', passed: true });
    } catch (error) {
        results.push({ name: 'Ghost creation and validation', passed: false, error: error.message });
    }

    // Test 12: Match prediction logic
    try {
        const board = new GameBoard(5, 5);
        
        // Create a scenario where placing a ghost would create a match
        board.setCell(0, 0, board.createGhost(1, 0, 0));
        board.setCell(1, 0, board.createGhost(1, 1, 0));
        
        // Placing type 1 at (2,0) should create a horizontal match
        if (!board.wouldCreateMatch(2, 0, 1)) {
            throw new Error('Should detect horizontal match creation');
        }
        
        // Placing type 0 at (2,0) should not create a match
        if (board.wouldCreateMatch(2, 0, 0)) {
            throw new Error('Should not detect match for different type');
        }
        
        // Test vertical match prediction
        board.setCell(0, 1, board.createGhost(2, 0, 1));
        board.setCell(0, 2, board.createGhost(2, 0, 2));
        
        // Placing type 2 at (0,3) should create a vertical match
        if (!board.wouldCreateMatch(0, 3, 2)) {
            throw new Error('Should detect vertical match creation');
        }
        
        results.push({ name: 'Match prediction logic', passed: true });
    } catch (error) {
        results.push({ name: 'Match prediction logic', passed: false, error: error.message });
    }

    // Test 13: Safe ghost type finding
    try {
        const board = new GameBoard(5, 5);
        
        // Create a scenario where most types would create matches
        board.setCell(0, 0, board.createGhost(0, 0, 0));
        board.setCell(1, 0, board.createGhost(0, 1, 0));
        board.setCell(0, 1, board.createGhost(1, 0, 1));
        board.setCell(0, 2, board.createGhost(1, 0, 2));
        
        // Find safe type for position (2,0)
        const safeType = board.findSafeGhostType(2, 0);
        
        if (typeof safeType !== 'number' || safeType < 0 || safeType >= GAME_CONFIG.GHOST_TYPE_COUNT) {
            throw new Error('Safe type should be a valid ghost type');
        }
        
        // Verify the safe type doesn't create matches
        if (board.wouldCreateMatch(2, 0, safeType)) {
            throw new Error('Safe type should not create matches');
        }
        
        results.push({ name: 'Safe ghost type finding', passed: true });
    } catch (error) {
        results.push({ name: 'Safe ghost type finding', passed: false, error: error.message });
    }

    // Test 14: Match removal functionality
    try {
        const board = new GameBoard(5, 5);
        board.initializeWithGhosts();
        
        // Create a known match
        board.setCell(0, 0, board.createGhost(3, 0, 0));
        board.setCell(1, 0, board.createGhost(3, 1, 0));
        board.setCell(2, 0, board.createGhost(3, 2, 0));
        
        // Create match data structure
        const matches = [
            [
                { x: 0, y: 0, type: 3 },
                { x: 1, y: 0, type: 3 },
                { x: 2, y: 0, type: 3 }
            ]
        ];
        
        const removedCount = board.removeMatches(matches);
        
        if (removedCount !== 3) {
            throw new Error(`Expected 3 removed ghosts, got ${removedCount}`);
        }
        
        // Check that positions are now null
        if (board.getCell(0, 0) !== null || 
            board.getCell(1, 0) !== null || 
            board.getCell(2, 0) !== null) {
            throw new Error('Matched positions should be null after removal');
        }
        
        // Test empty matches array
        const emptyRemoved = board.removeMatches([]);
        if (emptyRemoved !== 0) {
            throw new Error('Empty matches should remove 0 ghosts');
        }
        
        results.push({ name: 'Match removal functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Match removal functionality', passed: false, error: error.message });
    }

    // Test 15: Grid copy functionality
    try {
        const board = new GameBoard(3, 3);
        board.initializeWithGhosts();
        
        const gridCopy = board.getGridCopy();
        
        // Verify copy is independent
        if (gridCopy === board.grid) {
            throw new Error('Grid copy should be a different object');
        }
        
        if (gridCopy[0] === board.grid[0]) {
            throw new Error('Grid copy rows should be different objects');
        }
        
        // Verify content matches
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const original = board.getCell(x, y);
                const copied = gridCopy[y][x];
                
                if (original.type !== copied.type || 
                    original.x !== copied.x || 
                    original.y !== copied.y) {
                    throw new Error('Grid copy content should match original');
                }
            }
        }
        
        // Modify copy and verify original unchanged
        const originalType = board.getCell(0, 0).type;
        gridCopy[0][0] = board.createGhost(4, 0, 0);
        
        if (board.getCell(0, 0).type !== originalType) {
            throw new Error('Modifying copy should not affect original');
        }
        
        results.push({ name: 'Grid copy functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Grid copy functionality', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `GameBoard: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}