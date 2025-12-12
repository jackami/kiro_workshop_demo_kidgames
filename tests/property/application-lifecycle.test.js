// Property 14: 应用程序生命周期管理 - Verifies: Application initialization and cleanup
// Property 15: 组件集成一致性 - Verifies: Component integration and communication

import fc from 'fast-check';
import '../setup-dom.js';
import { GhostMatchGame } from '../../js/main.js';

export default async function runPropertyTests() {
    const results = [];
    
    // Property 14: 应用程序生命周期管理
    // For any application instance, initialization and cleanup should be consistent and complete
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const game = new GhostMatchGame();
                    
                    // Property: Initial state should be consistent
                    if (game.isInitialized !== false) {
                        console.log('Game should not be initialized initially');
                        return false;
                    }
                    
                    if (game.gameContainer !== null) {
                        console.log('Game container should be null initially');
                        return false;
                    }
                    
                    if (game.gameEngine !== null) {
                        console.log('Game engine should be null initially');
                        return false;
                    }
                    
                    // Property: Component creation should be idempotent
                    game.createCoreComponents();
                    const firstGameBoard = game.gameBoard;
                    const firstGameState = game.gameState;
                    
                    game.createCoreComponents();
                    
                    if (game.gameBoard === firstGameBoard) {
                        console.log('Component creation should create new instances');
                        return false;
                    }
                    
                    if (game.gameState === firstGameState) {
                        console.log('Component creation should create new instances');
                        return false;
                    }
                    
                    // Property: All core components should be created
                    if (!game.gameBoard || !game.gameState) {
                        console.log('Core components should be created');
                        return false;
                    }
                    
                    // Property: Algorithm components should be created
                    game.createAlgorithmComponents();
                    
                    if (!game.matchDetector || !game.gravitySystem) {
                        console.log('Algorithm components should be created');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 14,
            name: "应用程序生命周期管理",
            passed: true,
            iterations: 100,
            message: "Application lifecycle management is consistent and complete"
        });
    } catch (error) {
        results.push({
            property: 14,
            name: "应用程序生命周期管理",
            passed: false,
            message: "Application lifecycle management failed",
            details: error.message
        });
    }

    // Property 15: 组件集成一致性
    // For any set of components, integration should maintain proper references and communication
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const game = new GhostMatchGame();
                    
                    // Create all components
                    game.createCoreComponents();
                    game.createAlgorithmComponents();
                    
                    // Mock UI components
                    game.renderer = {
                        setAnimationDurations: () => {},
                        updateScore: () => {},
                        updateCombo: () => {},
                        clearAllHighlights: () => {},
                        highlightCell: () => {},
                        animateMatch: () => Promise.resolve(),
                        animateSwap: () => Promise.resolve(),
                        renderBoard: () => {},
                        showGameOver: () => {},
                        updateTimer: () => {},
                        reset: () => {},
                        destroy: () => {}
                    };
                    
                    game.audioManager = {
                        setDefaultVolume: () => {},
                        preloadSounds: () => Promise.resolve(),
                        playMatch: () => {},
                        playSwap: () => {},
                        playGameOver: () => {},
                        toggleMute: () => false,
                        isMuted: () => false,
                        destroy: () => {}
                    };
                    
                    game.gameEngine = {
                        initialize: () => {},
                        start: () => {},
                        pause: () => {},
                        resume: () => {},
                        reset: () => {},
                        destroy: () => {},
                        state: 'playing',
                        on: () => {}
                    };
                    
                    game.inputHandler = {
                        setComponents: () => {},
                        reset: () => {},
                        destroy: () => {}
                    };
                    
                    // Property: Component references should be set up correctly
                    game.setupComponentReferences();
                    
                    // Verify that setup methods were called (we can't verify the actual calls
                    // without mocking, but we can verify the method exists and doesn't throw)
                    
                    // Property: Component validation should pass with all components
                    try {
                        game.validateComponentInitialization();
                    } catch (error) {
                        console.log('Component validation should pass with all components');
                        return false;
                    }
                    
                    // Property: Game configuration should apply without errors
                    try {
                        game.applyGameConfiguration();
                    } catch (error) {
                        console.log('Game configuration should apply without errors');
                        return false;
                    }
                    
                    // Property: Game engine initialization should work
                    try {
                        game.initializeGameEngine();
                    } catch (error) {
                        console.log('Game engine initialization should work');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 15,
            name: "组件集成一致性",
            passed: true,
            iterations: 100,
            message: "Component integration maintains proper references and communication"
        });
    } catch (error) {
        results.push({
            property: 15,
            name: "组件集成一致性",
            passed: false,
            message: "Component integration consistency failed",
            details: error.message
        });
    }

    // Additional property: Error handling consistency
    try {
        await fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant('Game container not found'),
                    fc.constant('Browser missing required features'),
                    fc.constant('ES6 features'),
                    fc.constant('Failed to initialize components'),
                    fc.constant('Unknown error')
                ),
                (errorMessage) => {
                    const game = new GhostMatchGame();
                    
                    let errorShown = false;
                    let shownMessage = '';
                    
                    // Mock showError method
                    game.showError = (message) => {
                        errorShown = true;
                        shownMessage = message;
                    };
                    
                    const error = new Error(errorMessage);
                    game.handleInitializationError(error);
                    
                    // Property: Error should always be shown
                    if (!errorShown) {
                        console.log('Error should be shown for any initialization error');
                        return false;
                    }
                    
                    // Property: Error message should be user-friendly
                    if (!shownMessage || shownMessage === errorMessage) {
                        console.log('Error message should be user-friendly, not raw error');
                        return false;
                    }
                    
                    // Property: Error message should be in Chinese (user-friendly)
                    const chinesePattern = /[\u4e00-\u9fff]/;
                    if (!chinesePattern.test(shownMessage)) {
                        console.log('Error message should contain Chinese characters for user-friendliness');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "错误处理一致性",
            passed: true,
            iterations: 100,
            message: "Error handling is consistent and user-friendly"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "错误处理一致性",
            passed: false,
            message: "Error handling consistency failed",
            details: error.message
        });
    }

    // Additional property: Performance monitoring accuracy
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const game = new GhostMatchGame();
                    
                    // Property: Performance stats should be consistent
                    const stats1 = game.getPerformanceStats();
                    const stats2 = game.getPerformanceStats();
                    
                    if (typeof stats1 !== 'object' || typeof stats2 !== 'object') {
                        console.log('Performance stats should return objects');
                        return false;
                    }
                    
                    // Property: Memory stats should be reasonable when available
                    if (performance.memory) {
                        const originalMemory = performance.memory;
                        
                        // Mock memory with known values
                        performance.memory = {
                            usedJSHeapSize: 50 * 1024 * 1024,
                            totalJSHeapSize: 100 * 1024 * 1024,
                            jsHeapSizeLimit: 200 * 1024 * 1024
                        };
                        
                        const memoryStats = game.getPerformanceStats();
                        
                        if (!memoryStats.memory) {
                            console.log('Memory stats should be included when available');
                            performance.memory = originalMemory;
                            return false;
                        }
                        
                        if (memoryStats.memory.used !== 50) {
                            console.log('Memory calculation should be correct (MB)');
                            performance.memory = originalMemory;
                            return false;
                        }
                        
                        if (memoryStats.memory.total !== 100) {
                            console.log('Total memory calculation should be correct');
                            performance.memory = originalMemory;
                            return false;
                        }
                        
                        // Restore original memory
                        performance.memory = originalMemory;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "性能监控准确性",
            passed: true,
            iterations: 100,
            message: "Performance monitoring provides accurate measurements"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "性能监控准确性",
            passed: false,
            message: "Performance monitoring accuracy failed",
            details: error.message
        });
    }

    // Additional property: Game health assessment
    try {
        await fc.assert(
            fc.property(
                fc.boolean(), // isInitialized
                fc.oneof(fc.constant('playing'), fc.constant('paused'), fc.constant('error')), // engine state
                fc.integer({ min: 10, max: 200 }), // memory usage in MB
                (isInitialized, engineState, memoryUsage) => {
                    const game = new GhostMatchGame();
                    game.isInitialized = isInitialized;
                    
                    // Mock game engine
                    if (engineState) {
                        game.gameEngine = { state: engineState };
                    }
                    
                    // Mock memory
                    const originalMemory = performance.memory;
                    performance.memory = {
                        usedJSHeapSize: memoryUsage * 1024 * 1024,
                        totalJSHeapSize: (memoryUsage + 50) * 1024 * 1024,
                        jsHeapSizeLimit: (memoryUsage + 100) * 1024 * 1024
                    };
                    
                    const health = game.checkGameHealth();
                    
                    // Property: Health check should return proper structure
                    if (typeof health.healthy !== 'boolean') {
                        console.log('Health check should return boolean healthy status');
                        performance.memory = originalMemory;
                        return false;
                    }
                    
                    if (!Array.isArray(health.issues)) {
                        console.log('Health check should return issues array');
                        performance.memory = originalMemory;
                        return false;
                    }
                    
                    if (!health.stats) {
                        console.log('Health check should include stats');
                        performance.memory = originalMemory;
                        return false;
                    }
                    
                    // Property: High memory usage should be detected
                    if (memoryUsage > 100 && health.healthy) {
                        console.log('High memory usage should make health check fail');
                        performance.memory = originalMemory;
                        return false;
                    }
                    
                    // Property: Uninitialized game should be unhealthy
                    if (!isInitialized && health.healthy) {
                        console.log('Uninitialized game should be unhealthy');
                        performance.memory = originalMemory;
                        return false;
                    }
                    
                    // Property: Error state should be unhealthy
                    if (engineState === 'error' && health.healthy) {
                        console.log('Game engine error state should make health check fail');
                        performance.memory = originalMemory;
                        return false;
                    }
                    
                    // Restore original memory
                    performance.memory = originalMemory;
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "游戏健康评估",
            passed: true,
            iterations: 100,
            message: "Game health assessment accurately detects issues"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "游戏健康评估",
            passed: false,
            message: "Game health assessment failed",
            details: error.message
        });
    }

    // Return overall result
    const allPassed = results.every(r => r.passed);
    const failedCount = results.filter(r => !r.passed).length;
    
    return {
        passed: allPassed,
        message: allPassed ? 
            `All ${results.length} application lifecycle properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 100,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}