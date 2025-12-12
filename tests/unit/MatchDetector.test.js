// Unit tests for MatchDetector class

import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GAME_CONFIG } from '../../js/constants.js';
import { TestUtils } from '../test-config.js';

export default async function runTests() {
    const results = [];
    
    // Test 1: Empty grid handling
    try {
        const detector = new MatchDetector();
        
        // Test null grid
        const nullMatches = detector.findMatches(null);
        if (nullMatches.length !== 0) {
            throw new Error('Null grid should return empty matches');
        }
        
        // Test empty grid
        const emptyMatches = detector.findMatches([]);
        if (emptyMatches.length !== 0) {
            throw new Error('Empty grid should return empty matches');
        }
        
        results.push({ name: 'Empty grid handling', passed: true });
    } catch (error) {
        results.push({ name: 'Empty grid handling', passed: false, error: error.message });
    }

    // Test 2: Simple horizontal match detection
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create 4x4 grid with horizontal match
        for (let y = 0; y < 4; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                grid[y][x] = TestUtils.createMockGhost(0, x, y); // All type 0
            }
        }
        
        // Create a horizontal match of type 1 in row 1
        grid[1][0] = TestUtils.createMockGhost(1, 0, 1);
        grid[1][1] = TestUtils.createMockGhost(1, 1, 1);
        grid[1][2] = TestUtils.createMockGhost(1, 2, 1);
        
        const matches = detector.findMatches(grid);
        
        // Should find multiple matches (the type 0 matches and the type 1 match)
        if (matches.length === 0) {
            throw new Error('Should find at least one match');
        }
        
        // Find the type 1 match
        const type1Match = matches.find(match => match[0].type === 1);
        if (!type1Match) {
            throw new Error('Should find the type 1 horizontal match');
        }
        
        if (type1Match.length !== 3) {
            throw new Error(`Type 1 match should have 3 ghosts, got ${type1Match.length}`);
        }
        
        // Verify all ghosts in match are in same row
        const row = type1Match[0].y;
        if (!type1Match.every(ghost => ghost.y === row)) {
            throw new Error('Horizontal match should have all ghosts in same row');
        }
        
        results.push({ name: 'Simple horizontal match detection', passed: true });
    } catch (error) {
        results.push({ name: 'Simple horizontal match detection', passed: false, error: error.message });
    }

    // Test 3: Simple vertical match detection
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create 4x4 grid with no matches initially
        for (let y = 0; y < 4; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                // Use a pattern that won't create matches
                const type = (x * 2 + y * 3) % 5; // More varied pattern
                grid[y][x] = TestUtils.createMockGhost(type, x, y);
            }
        }
        
        // Create a vertical match of type 2 in column 2
        grid[0][2] = TestUtils.createMockGhost(2, 2, 0);
        grid[1][2] = TestUtils.createMockGhost(2, 2, 1);
        grid[2][2] = TestUtils.createMockGhost(2, 2, 2);
        
        // Make sure position (3,2) is NOT type 2 to avoid extending the match
        grid[3][2] = TestUtils.createMockGhost(4, 2, 3);
        
        const matches = detector.findMatches(grid);
        
        // Find the type 2 match
        const type2Match = matches.find(match => match[0].type === 2);
        if (!type2Match) {
            throw new Error('Should find the type 2 vertical match');
        }
        
        if (type2Match.length !== 3) {
            throw new Error(`Type 2 match should have 3 ghosts, got ${type2Match.length}`);
        }
        
        // Verify all ghosts in match are in same column
        const column = type2Match[0].x;
        if (!type2Match.every(ghost => ghost.x === column)) {
            throw new Error('Vertical match should have all ghosts in same column');
        }
        
        results.push({ name: 'Simple vertical match detection', passed: true });
    } catch (error) {
        results.push({ name: 'Simple vertical match detection', passed: false, error: error.message });
    }

    // Test 4: No matches in alternating pattern
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create alternating pattern (no matches possible)
        for (let y = 0; y < 4; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                const type = (x + y) % 2; // Alternating 0,1,0,1...
                grid[y][x] = TestUtils.createMockGhost(type, x, y);
            }
        }
        
        const matches = detector.findMatches(grid);
        
        if (matches.length !== 0) {
            throw new Error(`Alternating pattern should have no matches, found ${matches.length}`);
        }
        
        results.push({ name: 'No matches in alternating pattern', passed: true });
    } catch (error) {
        results.push({ name: 'No matches in alternating pattern', passed: false, error: error.message });
    }

    // Test 5: Long match detection (4+ ghosts)
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create 6x4 grid
        for (let y = 0; y < 4; y++) {
            grid[y] = [];
            for (let x = 0; x < 6; x++) {
                grid[y][x] = TestUtils.createMockGhost(0, x, y);
            }
        }
        
        // Create a 4-ghost horizontal match
        for (let x = 1; x < 5; x++) {
            grid[2][x] = TestUtils.createMockGhost(3, x, 2);
        }
        
        const matches = detector.findMatches(grid);
        
        // Find the 4-ghost match
        const longMatch = matches.find(match => match.length === 4 && match[0].type === 3);
        if (!longMatch) {
            throw new Error('Should find 4-ghost match');
        }
        
        // Verify positions are consecutive
        const sortedX = longMatch.map(g => g.x).sort((a, b) => a - b);
        for (let i = 1; i < sortedX.length; i++) {
            if (sortedX[i] !== sortedX[i-1] + 1) {
                throw new Error('Long match positions should be consecutive');
            }
        }
        
        results.push({ name: 'Long match detection (4+ ghosts)', passed: true });
    } catch (error) {
        results.push({ name: 'Long match detection (4+ ghosts)', passed: false, error: error.message });
    }

    // Test 6: Multiple matches detection
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create 5x5 grid
        for (let y = 0; y < 5; y++) {
            grid[y] = [];
            for (let x = 0; x < 5; x++) {
                grid[y][x] = TestUtils.createMockGhost(0, x, y);
            }
        }
        
        // Create horizontal match in row 1
        grid[1][1] = TestUtils.createMockGhost(1, 1, 1);
        grid[1][2] = TestUtils.createMockGhost(1, 2, 1);
        grid[1][3] = TestUtils.createMockGhost(1, 3, 1);
        
        // Create vertical match in column 4
        grid[2][4] = TestUtils.createMockGhost(2, 4, 2);
        grid[3][4] = TestUtils.createMockGhost(2, 4, 3);
        grid[4][4] = TestUtils.createMockGhost(2, 4, 4);
        
        const matches = detector.findMatches(grid);
        
        // Should find at least the two specific matches we created
        const type1Match = matches.find(match => match[0].type === 1);
        const type2Match = matches.find(match => match[0].type === 2);
        
        if (!type1Match) {
            throw new Error('Should find type 1 horizontal match');
        }
        
        if (!type2Match) {
            throw new Error('Should find type 2 vertical match');
        }
        
        results.push({ name: 'Multiple matches detection', passed: true });
    } catch (error) {
        results.push({ name: 'Multiple matches detection', passed: false, error: error.message });
    }

    // Test 7: wouldCreateMatch functionality
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create 4x4 grid
        for (let y = 0; y < 4; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                grid[y][x] = TestUtils.createMockGhost((x + y) % 3, x, y);
            }
        }
        
        // Set up a scenario where swapping would create a match
        grid[1][0] = TestUtils.createMockGhost(1, 0, 1);
        grid[1][1] = TestUtils.createMockGhost(1, 1, 1);
        grid[1][2] = TestUtils.createMockGhost(0, 2, 1); // Different type
        grid[1][3] = TestUtils.createMockGhost(1, 3, 1);
        
        // Swapping (2,1) with (3,1) should create a match
        const wouldCreate = detector.wouldCreateMatch(grid, { x: 2, y: 1 }, { x: 3, y: 1 });
        
        if (!wouldCreate) {
            throw new Error('Should detect that swap would create match');
        }
        
        // Swapping (0,0) with (1,0) should not create a match
        const wouldNotCreate = detector.wouldCreateMatch(grid, { x: 0, y: 0 }, { x: 1, y: 0 });
        
        if (wouldNotCreate) {
            throw new Error('Should detect that swap would not create match');
        }
        
        results.push({ name: 'wouldCreateMatch functionality', passed: true });
    } catch (error) {
        results.push({ name: 'wouldCreateMatch functionality', passed: false, error: error.message });
    }

    // Test 8: Valid moves detection
    try {
        const detector = new MatchDetector();
        const grid = [];
        
        // Create 4x4 grid with no immediate matches
        for (let y = 0; y < 4; y++) {
            grid[y] = [];
            for (let x = 0; x < 4; x++) {
                grid[y][x] = TestUtils.createMockGhost((x + y) % 3, x, y);
            }
        }
        
        // Set up a scenario with at least one valid move
        grid[0][0] = TestUtils.createMockGhost(1, 0, 0);
        grid[0][1] = TestUtils.createMockGhost(1, 1, 0);
        grid[0][2] = TestUtils.createMockGhost(0, 2, 0);
        grid[1][2] = TestUtils.createMockGhost(1, 2, 1);
        
        const hasValidMoves = detector.hasValidMoves(grid);
        const validMoves = detector.findValidMoves(grid);
        
        if (!hasValidMoves) {
            throw new Error('Should detect valid moves exist');
        }
        
        if (validMoves.length === 0) {
            throw new Error('Should find at least one valid move');
        }
        
        // Verify each valid move actually creates a match
        for (const move of validMoves) {
            const creates = detector.wouldCreateMatch(grid, move.from, move.to);
            if (!creates) {
                throw new Error('Valid move should create a match');
            }
        }
        
        results.push({ name: 'Valid moves detection', passed: true });
    } catch (error) {
        results.push({ name: 'Valid moves detection', passed: false, error: error.message });
    }

    // Test 9: Match statistics
    try {
        const detector = new MatchDetector();
        const matches = [
            // 3-ghost horizontal match of type 0
            [
                { x: 0, y: 0, type: 0 },
                { x: 1, y: 0, type: 0 },
                { x: 2, y: 0, type: 0 }
            ],
            // 4-ghost vertical match of type 1
            [
                { x: 3, y: 0, type: 1 },
                { x: 3, y: 1, type: 1 },
                { x: 3, y: 2, type: 1 },
                { x: 3, y: 3, type: 1 }
            ]
        ];
        
        const stats = detector.getMatchStats(matches);
        
        if (stats.totalMatches !== 2) {
            throw new Error(`Expected 2 total matches, got ${stats.totalMatches}`);
        }
        
        if (stats.totalGhosts !== 7) {
            throw new Error(`Expected 7 total ghosts, got ${stats.totalGhosts}`);
        }
        
        if (stats.horizontalMatches !== 1) {
            throw new Error(`Expected 1 horizontal match, got ${stats.horizontalMatches}`);
        }
        
        if (stats.verticalMatches !== 1) {
            throw new Error(`Expected 1 vertical match, got ${stats.verticalMatches}`);
        }
        
        if (stats.matchSizes[3] !== 1 || stats.matchSizes[4] !== 1) {
            throw new Error('Match size statistics incorrect');
        }
        
        if (stats.ghostTypes[0] !== 1 || stats.ghostTypes[1] !== 1) {
            throw new Error('Ghost type statistics incorrect');
        }
        
        results.push({ name: 'Match statistics', passed: true });
    } catch (error) {
        results.push({ name: 'Match statistics', passed: false, error: error.message });
    }

    // Test 10: Grid copying
    try {
        const detector = new MatchDetector();
        const originalGrid = [];
        
        // Create original grid
        for (let y = 0; y < 3; y++) {
            originalGrid[y] = [];
            for (let x = 0; x < 3; x++) {
                originalGrid[y][x] = TestUtils.createMockGhost(x, x, y);
            }
        }
        
        const copiedGrid = detector.copyGrid(originalGrid);
        
        // Verify copy is independent
        if (copiedGrid === originalGrid) {
            throw new Error('Copied grid should be a different object');
        }
        
        if (copiedGrid[0] === originalGrid[0]) {
            throw new Error('Copied grid rows should be different objects');
        }
        
        // Verify content is the same
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                const original = originalGrid[y][x];
                const copied = copiedGrid[y][x];
                
                if (copied.type !== original.type || copied.x !== original.x || copied.y !== original.y) {
                    throw new Error('Copied grid content should match original');
                }
            }
        }
        
        // Modify copy and verify original is unchanged
        copiedGrid[0][0] = TestUtils.createMockGhost(9, 0, 0);
        
        if (originalGrid[0][0].type === 9) {
            throw new Error('Modifying copy should not affect original');
        }
        
        results.push({ name: 'Grid copying', passed: true });
    } catch (error) {
        results.push({ name: 'Grid copying', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `MatchDetector: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}