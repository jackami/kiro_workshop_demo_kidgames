// Integration test for complete game flow

import { GameBoard } from '../../js/core/GameBoard.js';
import { GameState } from '../../js/core/GameState.js';
import { MatchDetector } from '../../js/algorithms/MatchDetector.js';
import { GravitySystem } from '../../js/algorithms/GravitySystem.js';

export default async function runTests() {
    const results = [];
    
    // Test 1: Complete match-elimination-gravity cycle
    try {
        const gameBoard = new GameBoard(6, 6);
        const gameState = new GameState();
        const matchDetector = new MatchDetector();
        const gravitySystem = new GravitySystem();
        
        gameState.startGame();
        
        // Create a known match scenario
        gameBoard.setCell(0, 2, { type: 1, x: 0, y: 2, color: 'blue', sprite: 'ghost-1' });
        gameBoard.setCell(1, 2, { type: 1, x: 1, y: 2, color: 'blue', sprite: 'ghost-1' });
        gameBoard.setCell(2, 2, { type: 1, x: 2, y: 2, color: 'blue', sprite: 'ghost-1' });
        
        // 1. Find matches
        const matches = matchDetector.findMatches(gameBoard.grid);
        if (matches.length === 0) {
            throw new Error('Should find the created match');
        }
        
        // 2. Calculate and add score
        const matchScore = gameState.calculateMatchScore(3, 1);
        gameState.addScore(matchScore);
        gameState.incrementCombo();
        
        if (gameState.score <= 0) {
            throw new Error('Score should increase after match');
        }
        
        if (gameState.combo !== 1) {
            throw new Error('Combo should increment after match');
        }
        
        // 3. Remove matches
        gameBoard.removeMatches(matches);
        
        // Verify positions are cleared
        if (gameBoard.getCell(0, 2) !== null || 
            gameBoard.getCell(1, 2) !== null || 
            gameBoard.getCell(2, 2) !== null) {
            throw new Error('Matched positions should be cleared');
        }
        
        // 4. Apply gravity
        const movements = gravitySystem.applyGravity(gameBoard.grid);
        
        // 5. Fill empty positions
        const newGhosts = gravitySystem.fillEmpty(gameBoard.grid);
        
        // Verify board is full again
        if (!gameBoard.isFull()) {
            throw new Error('Board should be full after refill');
        }
        
        // 6. Check for new matches (chain reaction)
        const newMatches = matchDetector.findMatches(gameBoard.grid);
        // New matches may or may not exist, but detection should work
        
        results.push({ name: 'Complete match-elimination-gravity cycle', passed: true });
    } catch (error) {
        results.push({ name: 'Complete match-elimination-gravity cycle', passed: false, error: error.message });
    }

    // Test 2: Game state consistency during operations
    try {
        const gameBoard = new GameBoard(4, 4);
        const gameState = new GameState();
        
        gameState.startGame();
        
        // Perform multiple operations
        gameState.selectCell({ x: 1, y: 1 });
        gameState.addScore(100);
        gameState.incrementCombo();
        gameState.incrementMoves();
        
        // Verify state consistency
        if (!gameState.selectedCell || gameState.selectedCell.x !== 1 || gameState.selectedCell.y !== 1) {
            throw new Error('Selected cell should be maintained');
        }
        
        if (gameState.score !== 100) {
            throw new Error('Score should be maintained');
        }
        
        if (gameState.combo !== 1) {
            throw new Error('Combo should be maintained');
        }
        
        if (gameState.moves !== 1) {
            throw new Error('Moves should be maintained');
        }
        
        // Clear selection and verify
        gameState.clearSelection();
        if (gameState.selectedCell !== null) {
            throw new Error('Selection should be cleared');
        }
        
        // Other state should remain
        if (gameState.score !== 100 || gameState.combo !== 1 || gameState.moves !== 1) {
            throw new Error('Other state should remain after clearing selection');
        }
        
        results.push({ name: 'Game state consistency during operations', passed: true });
    } catch (error) {
        results.push({ name: 'Game state consistency during operations', passed: false, error: error.message });
    }

    // Test 3: Component interaction - swap and match detection
    try {
        const gameBoard = new GameBoard(4, 4);
        const matchDetector = new MatchDetector();
        
        // Set up a scenario where swap creates a match
        gameBoard.setCell(0, 1, { type: 2, x: 0, y: 1, color: 'green', sprite: 'ghost-2' });
        gameBoard.setCell(1, 1, { type: 2, x: 1, y: 1, color: 'green', sprite: 'ghost-2' });
        gameBoard.setCell(2, 1, { type: 0, x: 2, y: 1, color: 'red', sprite: 'ghost-0' });
        gameBoard.setCell(3, 1, { type: 2, x: 3, y: 1, color: 'green', sprite: 'ghost-2' });
        
        // Verify no match initially
        const initialMatches = matchDetector.findMatches(gameBoard.grid);
        const type2Matches = initialMatches.filter(match => match[0].type === 2);
        if (type2Matches.length > 0) {
            throw new Error('Should not have type 2 matches initially');
        }
        
        // Swap to create match
        const swapResult = gameBoard.swapCells({ x: 2, y: 1 }, { x: 3, y: 1 });
        if (!swapResult) {
            throw new Error('Swap should succeed');
        }
        
        // Verify match is created
        const afterSwapMatches = matchDetector.findMatches(gameBoard.grid);
        const newType2Matches = afterSwapMatches.filter(match => match[0].type === 2);
        if (newType2Matches.length === 0) {
            throw new Error('Should have type 2 match after swap');
        }
        
        // Verify match has correct positions
        const match = newType2Matches[0];
        if (match.length < 3) {
            throw new Error('Match should have at least 3 ghosts');
        }
        
        results.push({ name: 'Component interaction - swap and match detection', passed: true });
    } catch (error) {
        results.push({ name: 'Component interaction - swap and match detection', passed: false, error: error.message });
    }

    // Test 4: End-to-end game scenario
    try {
        const gameBoard = new GameBoard(5, 5);
        const gameState = new GameState();
        const matchDetector = new MatchDetector();
        const gravitySystem = new GravitySystem();
        
        // Start game
        gameState.startGame();
        
        // Simulate game progression
        let totalScore = 0;
        let totalMoves = 0;
        
        // Perform several match-score cycles
        for (let cycle = 0; cycle < 3; cycle++) {
            // Create matches by modifying board
            const row = cycle;
            gameBoard.setCell(0, row, { type: cycle, x: 0, y: row, color: `color-${cycle}`, sprite: `ghost-${cycle}` });
            gameBoard.setCell(1, row, { type: cycle, x: 1, y: row, color: `color-${cycle}`, sprite: `ghost-${cycle}` });
            gameBoard.setCell(2, row, { type: cycle, x: 2, y: row, color: `color-${cycle}`, sprite: `ghost-${cycle}` });
            
            // Find and process matches
            const matches = matchDetector.findMatches(gameBoard.grid);
            if (matches.length > 0) {
                const score = gameState.calculateMatchScore(3, 1);
                gameState.addScore(score);
                gameState.incrementCombo();
                totalScore += score;
                
                // Remove matches and apply gravity
                gameBoard.removeMatches(matches);
                gravitySystem.applyGravity(gameBoard.grid);
                gravitySystem.fillEmpty(gameBoard.grid);
            }
            
            gameState.incrementMoves();
            totalMoves++;
        }
        
        // Verify final state
        if (gameState.score !== totalScore) {
            throw new Error(`Expected total score ${totalScore}, got ${gameState.score}`);
        }
        
        if (gameState.moves !== totalMoves) {
            throw new Error(`Expected total moves ${totalMoves}, got ${gameState.moves}`);
        }
        
        if (!gameBoard.isFull()) {
            throw new Error('Board should be full at end of scenario');
        }
        
        // Test game statistics
        const stats = gameState.getStats();
        if (stats.score !== gameState.score || stats.moves !== gameState.moves) {
            throw new Error('Statistics should match game state');
        }
        
        results.push({ name: 'End-to-end game scenario', passed: true });
    } catch (error) {
        results.push({ name: 'End-to-end game scenario', passed: false, error: error.message });
    }

    // Test 5: Error handling and edge cases
    try {
        const gameBoard = new GameBoard(3, 3);
        const gameState = new GameState();
        const matchDetector = new MatchDetector();
        
        // Test operations on non-playing game
        const initialScore = gameState.score;
        gameState.addScore(100); // Should not add score when not playing
        if (gameState.score !== initialScore) {
            throw new Error('Score should not change when game not playing');
        }
        
        // Test invalid board operations
        const invalidGet = gameBoard.getCell(-1, 10);
        if (invalidGet !== null) {
            throw new Error('Invalid position should return null');
        }
        
        const invalidSet = gameBoard.setCell(10, -5, { type: 1 });
        if (invalidSet !== false) {
            throw new Error('Invalid position should return false');
        }
        
        // Test match detection on empty areas
        gameBoard.setCell(0, 0, null);
        gameBoard.setCell(1, 1, null);
        const matches = matchDetector.findMatches(gameBoard.grid);
        // Should not crash and should handle null cells properly
        
        results.push({ name: 'Error handling and edge cases', passed: true });
    } catch (error) {
        results.push({ name: 'Error handling and edge cases', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `Integration: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}