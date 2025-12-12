// Unit tests for GameState class

import { GameState } from '../../js/core/GameState.js';
import { EVENTS } from '../../js/constants.js';

export default async function runTests() {
    const results = [];
    
    // Test 1: Initial state
    try {
        const gameState = new GameState();
        
        if (gameState.score !== 0) {
            throw new Error(`Expected initial score 0, got ${gameState.score}`);
        }
        
        if (gameState.moves !== 0) {
            throw new Error(`Expected initial moves 0, got ${gameState.moves}`);
        }
        
        if (gameState.combo !== 0) {
            throw new Error(`Expected initial combo 0, got ${gameState.combo}`);
        }
        
        if (gameState.isPlaying !== false) {
            throw new Error('Game should not be playing initially');
        }
        
        if (gameState.selectedCell !== null) {
            throw new Error('No cell should be selected initially');
        }
        
        results.push({ name: 'Initial state', passed: true });
    } catch (error) {
        results.push({ name: 'Initial state', passed: false, error: error.message });
    }

    // Test 2: Game state transitions
    try {
        const gameState = new GameState();
        
        // Start game
        gameState.startGame();
        if (!gameState.isPlaying) {
            throw new Error('Game should be playing after startGame()');
        }
        
        // Pause game
        gameState.pauseGame();
        if (gameState.isPlaying) {
            throw new Error('Game should not be playing after pauseGame()');
        }
        
        // Resume game
        gameState.resumeGame();
        if (!gameState.isPlaying) {
            throw new Error('Game should be playing after resumeGame()');
        }
        
        // End game
        gameState.endGame();
        if (gameState.isPlaying) {
            throw new Error('Game should not be playing after endGame()');
        }
        
        results.push({ name: 'Game state transitions', passed: true });
    } catch (error) {
        results.push({ name: 'Game state transitions', passed: false, error: error.message });
    }

    // Test 3: Score management
    try {
        const gameState = new GameState();
        gameState.startGame();
        
        const initialScore = gameState.score;
        
        // Add score
        gameState.addScore(100);
        if (gameState.score !== initialScore + 100) {
            throw new Error(`Expected score ${initialScore + 100}, got ${gameState.score}`);
        }
        
        // Add more score
        gameState.addScore(50);
        if (gameState.score !== initialScore + 150) {
            throw new Error(`Expected score ${initialScore + 150}, got ${gameState.score}`);
        }
        
        // Score should not change when not playing
        gameState.endGame();
        const scoreBeforeAdd = gameState.score;
        gameState.addScore(25);
        if (gameState.score !== scoreBeforeAdd) {
            throw new Error('Score should not change when not playing');
        }
        
        results.push({ name: 'Score management', passed: true });
    } catch (error) {
        results.push({ name: 'Score management', passed: false, error: error.message });
    }

    // Test 4: Combo system
    try {
        const gameState = new GameState();
        gameState.startGame();
        
        // Initial combo should be 0
        if (gameState.combo !== 0) {
            throw new Error(`Expected initial combo 0, got ${gameState.combo}`);
        }
        
        // Increment combo
        gameState.incrementCombo();
        if (gameState.combo !== 1) {
            throw new Error(`Expected combo 1, got ${gameState.combo}`);
        }
        
        gameState.incrementCombo();
        if (gameState.combo !== 2) {
            throw new Error(`Expected combo 2, got ${gameState.combo}`);
        }
        
        // Max combo should track highest
        if (gameState.maxCombo !== 2) {
            throw new Error(`Expected maxCombo 2, got ${gameState.maxCombo}`);
        }
        
        // Reset combo
        gameState.resetCombo();
        if (gameState.combo !== 0) {
            throw new Error(`Expected combo 0 after reset, got ${gameState.combo}`);
        }
        
        // Max combo should remain
        if (gameState.maxCombo !== 2) {
            throw new Error(`Expected maxCombo 2 after reset, got ${gameState.maxCombo}`);
        }
        
        results.push({ name: 'Combo system', passed: true });
    } catch (error) {
        results.push({ name: 'Combo system', passed: false, error: error.message });
    }

    // Test 5: Cell selection
    try {
        const gameState = new GameState();
        
        // Select cell
        const position = { x: 2, y: 3 };
        gameState.selectCell(position);
        
        if (!gameState.selectedCell) {
            throw new Error('Cell should be selected');
        }
        
        if (gameState.selectedCell.x !== 2 || gameState.selectedCell.y !== 3) {
            throw new Error('Selected cell position incorrect');
        }
        
        // Clear selection
        gameState.clearSelection();
        if (gameState.selectedCell !== null) {
            throw new Error('Selection should be cleared');
        }
        
        results.push({ name: 'Cell selection', passed: true });
    } catch (error) {
        results.push({ name: 'Cell selection', passed: false, error: error.message });
    }

    // Test 6: Level progression
    try {
        const gameState = new GameState();
        gameState.startGame();
        
        // Initial level should be 1
        if (gameState.level !== 1) {
            throw new Error(`Expected initial level 1, got ${gameState.level}`);
        }
        
        // Add enough score to level up
        gameState.addScore(1000);
        if (gameState.level !== 2) {
            throw new Error(`Expected level 2 after 1000 points, got ${gameState.level}`);
        }
        
        // Target score should update
        if (gameState.targetScore !== 2000) {
            throw new Error(`Expected target score 2000, got ${gameState.targetScore}`);
        }
        
        results.push({ name: 'Level progression', passed: true });
    } catch (error) {
        results.push({ name: 'Level progression', passed: false, error: error.message });
    }

    // Test 7: Time formatting
    try {
        const gameState = new GameState();
        
        // Test various time values
        gameState.playTime = 0;
        if (gameState.getFormattedTime() !== '00:00') {
            throw new Error(`Expected '00:00', got '${gameState.getFormattedTime()}'`);
        }
        
        gameState.playTime = 65; // 1 minute 5 seconds
        if (gameState.getFormattedTime() !== '01:05') {
            throw new Error(`Expected '01:05', got '${gameState.getFormattedTime()}'`);
        }
        
        gameState.playTime = 3661; // 61 minutes 1 second
        if (gameState.getFormattedTime() !== '61:01') {
            throw new Error(`Expected '61:01', got '${gameState.getFormattedTime()}'`);
        }
        
        results.push({ name: 'Time formatting', passed: true });
    } catch (error) {
        results.push({ name: 'Time formatting', passed: false, error: error.message });
    }

    // Test 8: Statistics
    try {
        const gameState = new GameState();
        gameState.startGame();
        gameState.addScore(500);
        gameState.incrementCombo();
        gameState.incrementMoves();
        
        const stats = gameState.getStats();
        
        if (stats.score !== 500) {
            throw new Error(`Expected stats score 500, got ${stats.score}`);
        }
        
        if (stats.combo !== 1) {
            throw new Error(`Expected stats combo 1, got ${stats.combo}`);
        }
        
        if (stats.moves !== 1) {
            throw new Error(`Expected stats moves 1, got ${stats.moves}`);
        }
        
        if (stats.isPlaying !== true) {
            throw new Error('Stats should show game is playing');
        }
        
        results.push({ name: 'Statistics', passed: true });
    } catch (error) {
        results.push({ name: 'Statistics', passed: false, error: error.message });
    }

    // Test 9: Score calculation
    try {
        const gameState = new GameState();
        
        // Test match score calculation
        const score3 = gameState.calculateMatchScore(3, 1);
        if (score3 <= 0) {
            throw new Error('Match score should be positive');
        }
        
        const score4 = gameState.calculateMatchScore(4, 1);
        if (score4 <= score3) {
            throw new Error('Longer matches should score more');
        }
        
        // Test combo bonus
        gameState.combo = 2;
        const scoreWithCombo = gameState.calculateMatchScore(3, 1);
        if (scoreWithCombo <= score3) {
            throw new Error('Combo should increase score');
        }
        
        results.push({ name: 'Score calculation', passed: true });
    } catch (error) {
        results.push({ name: 'Score calculation', passed: false, error: error.message });
    }

    // Test 10: Reset functionality
    try {
        const gameState = new GameState();
        gameState.startGame();
        
        // Modify state
        gameState.addScore(1000);
        gameState.incrementCombo();
        gameState.incrementMoves();
        gameState.selectCell({ x: 1, y: 1 });
        
        // Reset
        gameState.reset();
        
        // Check all values are reset
        if (gameState.score !== 0) {
            throw new Error(`Score should be 0 after reset, got ${gameState.score}`);
        }
        
        if (gameState.combo !== 0) {
            throw new Error(`Combo should be 0 after reset, got ${gameState.combo}`);
        }
        
        if (gameState.moves !== 0) {
            throw new Error(`Moves should be 0 after reset, got ${gameState.moves}`);
        }
        
        if (gameState.selectedCell !== null) {
            throw new Error('Selection should be cleared after reset');
        }
        
        if (gameState.level !== 1) {
            throw new Error(`Level should be 1 after reset, got ${gameState.level}`);
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
        message: `GameState: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}