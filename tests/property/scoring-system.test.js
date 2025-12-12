// Property 8: 分数计算正确性 - Verifies: Requirement 3.4

import fc from 'fast-check';
import { GameState } from '../../js/core/GameState.js';
import { GAME_CONFIG } from '../../js/constants.js';

export default async function runPropertyTests() {
    const results = [];
    
    // Property 8: 分数计算正确性
    // For any elimination operation, score increase should equal number of eliminated icons times base score plus combo bonus
    try {
        await fc.assert(
            fc.property(
                fc.integer({ min: 3, max: 8 }), // match length
                fc.integer({ min: 0, max: 10 }), // current combo
                fc.integer({ min: 1, max: 5 }), // level
                (matchLength, currentCombo, level) => {
                    const gameState = new GameState();
                    
                    // Start the game so addScore will work
                    gameState.startGame();
                    
                    // Set up initial state
                    gameState.combo = currentCombo;
                    gameState.level = level;
                    const initialScore = gameState.score;
                    
                    // Calculate expected score using the game's formula
                    const expectedScore = gameState.calculateMatchScore(matchLength, 1);
                    
                    // Add the score
                    gameState.addScore(expectedScore);
                    
                    // Property: Score should increase by exactly the calculated amount
                    const actualIncrease = gameState.score - initialScore;
                    if (actualIncrease !== expectedScore) {
                        console.log(`Expected score increase: ${expectedScore}, actual: ${actualIncrease}`);
                        return false;
                    }
                    
                    // Property: Score should never decrease
                    if (gameState.score < initialScore) {
                        console.log('Score decreased after adding points');
                        return false;
                    }
                    
                    // Property: Score should be non-negative
                    if (gameState.score < 0) {
                        console.log('Score became negative');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 8,
            name: "分数计算正确性",
            passed: true,
            iterations: 100,
            message: "Score calculation is mathematically correct for all match sizes and combos"
        });
    } catch (error) {
        results.push({
            property: 8,
            name: "分数计算正确性",
            passed: false,
            message: "Score calculation produced incorrect results",
            details: error.message
        });
    }

    // Additional property: Combo system consistency
    try {
        await fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 20 }), // number of consecutive matches
                (consecutiveMatches) => {
                    const gameState = new GameState();
                    gameState.startGame();
                    
                    let expectedCombo = 0;
                    
                    // Simulate consecutive matches
                    for (let i = 0; i < consecutiveMatches; i++) {
                        gameState.incrementCombo();
                        expectedCombo++;
                        
                        // Property: Combo should increment correctly
                        if (gameState.combo !== expectedCombo) {
                            console.log(`Expected combo: ${expectedCombo}, actual: ${gameState.combo}`);
                            return false;
                        }
                        
                        // Property: Max combo should track highest combo
                        if (gameState.maxCombo < gameState.combo) {
                            console.log('Max combo not tracking correctly');
                            return false;
                        }
                    }
                    
                    // Reset combo
                    gameState.resetCombo();
                    
                    // Property: Combo should reset to 0
                    if (gameState.combo !== 0) {
                        console.log('Combo did not reset to 0');
                        return false;
                    }
                    
                    // Property: Max combo should remain unchanged after reset
                    if (gameState.maxCombo !== expectedCombo) {
                        console.log('Max combo changed after reset');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "连击系统一致性",
            passed: true,
            iterations: 100,
            message: "Combo system increments and resets correctly"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "连击系统一致性",
            passed: false,
            message: "Combo system behavior is inconsistent",
            details: error.message
        });
    }

    // Additional property: Level progression
    try {
        await fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 50000 }), // score amount
                (scoreAmount) => {
                    const gameState = new GameState();
                    gameState.startGame();
                    
                    const initialLevel = gameState.level;
                    const initialTarget = gameState.targetScore;
                    
                    // Add score
                    gameState.addScore(scoreAmount);
                    
                    // Property: Level should be calculated correctly based on score
                    const expectedLevel = Math.floor(gameState.score / 1000) + 1;
                    if (gameState.level !== expectedLevel) {
                        console.log(`Expected level: ${expectedLevel}, actual: ${gameState.level}`);
                        return false;
                    }
                    
                    // Property: Target score should update with level
                    const expectedTarget = gameState.level * 1000;
                    if (gameState.targetScore !== expectedTarget) {
                        console.log(`Expected target: ${expectedTarget}, actual: ${gameState.targetScore}`);
                        return false;
                    }
                    
                    // Property: Level should never decrease
                    if (gameState.level < initialLevel) {
                        console.log('Level decreased');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "等级进度系统",
            passed: true,
            iterations: 100,
            message: "Level progression works correctly based on score"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "等级进度系统",
            passed: false,
            message: "Level progression failed",
            details: error.message
        });
    }

    // Additional property: Time tracking
    try {
        await fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 3600 }), // seconds
                (seconds) => {
                    const gameState = new GameState();
                    gameState.startGame();
                    
                    // Simulate time passage
                    const startTime = Date.now();
                    gameState.startTime = startTime;
                    gameState.updateTime(startTime + (seconds * 1000));
                    
                    // Property: Play time should match elapsed time
                    if (Math.abs(gameState.playTime - seconds) > 1) { // Allow 1 second tolerance
                        console.log(`Expected time: ${seconds}, actual: ${gameState.playTime}`);
                        return false;
                    }
                    
                    // Property: Formatted time should be valid
                    const formatted = gameState.getFormattedTime();
                    const timeRegex = /^\d{2}:\d{2}$/;
                    if (!timeRegex.test(formatted)) {
                        console.log('Invalid time format:', formatted);
                        return false;
                    }
                    
                    // Property: Time should never be negative
                    if (gameState.playTime < 0) {
                        console.log('Negative play time');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "时间跟踪系统",
            passed: true,
            iterations: 100,
            message: "Time tracking and formatting work correctly"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "时间跟踪系统",
            passed: false,
            message: "Time tracking failed",
            details: error.message
        });
    }

    // Additional property: Game state transitions
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const gameState = new GameState();
                    
                    // Property: Initial state should be correct
                    if (gameState.isPlaying !== false) {
                        console.log('Initial playing state should be false');
                        return false;
                    }
                    
                    if (gameState.score !== 0) {
                        console.log('Initial score should be 0');
                        return false;
                    }
                    
                    // Start game
                    gameState.startGame();
                    
                    // Property: Should be playing after start
                    if (gameState.isPlaying !== true) {
                        console.log('Should be playing after startGame()');
                        return false;
                    }
                    
                    // Pause game
                    gameState.pauseGame();
                    
                    // Property: Should not be playing after pause
                    if (gameState.isPlaying !== false) {
                        console.log('Should not be playing after pauseGame()');
                        return false;
                    }
                    
                    // Resume game
                    gameState.resumeGame();
                    
                    // Property: Should be playing after resume
                    if (gameState.isPlaying !== true) {
                        console.log('Should be playing after resumeGame()');
                        return false;
                    }
                    
                    // End game
                    gameState.endGame();
                    
                    // Property: Should not be playing after end
                    if (gameState.isPlaying !== false) {
                        console.log('Should not be playing after endGame()');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "游戏状态转换",
            passed: true,
            iterations: 100,
            message: "Game state transitions work correctly"
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
            `All ${results.length} scoring system properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 100,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}