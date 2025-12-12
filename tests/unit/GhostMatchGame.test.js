// Unit tests for GhostMatchGame class (main.js)

import '../setup-dom.js';
import { GhostMatchGame } from '../../js/main.js';

export default async function runTests() {
    const results = [];
    
    // Mock DOM elements for testing
    const mockGameContainer = {
        id: 'game-board',
        innerHTML: '',
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} },
        addEventListener: () => {},
        dispatchEvent: () => {}
    };
    
    // Mock document methods
    const originalGetElementById = document.getElementById;
    const originalCreateElement = document.createElement;
    const originalAddEventListener = document.addEventListener;
    
    // Test 1: Constructor initialization
    try {
        const game = new GhostMatchGame();
        
        if (game.gameEngine !== null) {
            throw new Error('GameEngine should be null initially');
        }
        
        if (game.isInitialized !== false) {
            throw new Error('Game should not be initialized initially');
        }
        
        if (game.gameContainer !== null) {
            throw new Error('Game container should be null initially');
        }
        
        results.push({ name: 'Constructor initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Constructor initialization', passed: false, error: error.message });
    }

    // Test 2: Browser support validation
    try {
        const game = new GhostMatchGame();
        
        // Test with missing features
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        delete window.requestAnimationFrame;
        
        try {
            game.validateBrowserSupport();
            throw new Error('Should throw error for missing features');
        } catch (error) {
            if (!error.message.includes('Browser missing required features')) {
                throw new Error('Should throw specific browser error');
            }
        }
        
        // Restore and test ES6 support
        window.requestAnimationFrame = originalRequestAnimationFrame;
        
        // Mock eval to simulate ES6 failure
        const originalEval = window.eval;
        window.eval = () => { throw new Error('ES6 not supported'); };
        
        try {
            game.validateBrowserSupport();
            throw new Error('Should throw error for ES6 support');
        } catch (error) {
            if (!error.message.includes('ES6 features')) {
                throw new Error('Should throw ES6 error');
            }
        }
        
        // Restore eval
        window.eval = originalEval;
        
        // Test successful validation
        game.validateBrowserSupport(); // Should not throw
        
        results.push({ name: 'Browser support validation', passed: true });
    } catch (error) {
        results.push({ name: 'Browser support validation', passed: false, error: error.message });
    }

    // Test 3: Component creation
    try {
        const game = new GhostMatchGame();
        
        // Test core components creation
        game.createCoreComponents();
        
        if (!game.gameBoard) {
            throw new Error('GameBoard should be created');
        }
        
        if (!game.gameState) {
            throw new Error('GameState should be created');
        }
        
        // Test algorithm components creation
        game.createAlgorithmComponents();
        
        if (!game.matchDetector) {
            throw new Error('MatchDetector should be created');
        }
        
        if (!game.gravitySystem) {
            throw new Error('GravitySystem should be created');
        }
        
        results.push({ name: 'Component creation', passed: true });
    } catch (error) {
        results.push({ name: 'Component creation', passed: false, error: error.message });
    }

    // Test 4: Component validation
    try {
        const game = new GhostMatchGame();
        
        // Test with missing components
        try {
            game.validateComponentInitialization();
            throw new Error('Should throw error for missing components');
        } catch (error) {
            if (!error.message.includes('Failed to initialize components')) {
                throw new Error('Should throw component initialization error');
            }
        }
        
        // Test with all components
        game.createCoreComponents();
        game.createAlgorithmComponents();
        
        // Mock UI components
        game.renderer = { setAnimationDurations: () => {} };
        game.audioManager = { setDefaultVolume: () => {} };
        game.inputHandler = {};
        game.gameEngine = {};
        
        game.validateComponentInitialization(); // Should not throw
        
        results.push({ name: 'Component validation', passed: true });
    } catch (error) {
        results.push({ name: 'Component validation', passed: false, error: error.message });
    }

    // Test 5: Game configuration application
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock components with methods
        game.renderer = { setAnimationDurations: () => {} };
        game.audioManager = { setDefaultVolume: () => {} };
        
        // Mock GAME_CONFIG
        const mockGameConfig = { DEBUG_MODE: true, ANIMATION_DURATION: {} };
        
        // Test configuration application
        game.applyGameConfiguration();
        
        // Should not throw and should handle missing methods gracefully
        results.push({ name: 'Game configuration application', passed: true });
    } catch (error) {
        results.push({ name: 'Game configuration application', passed: false, error: error.message });
    }

    // Test 6: Error handling
    try {
        const game = new GhostMatchGame();
        
        // Test initialization error handling
        const mockError = new Error('Game container not found');
        
        // Mock showError method
        let errorShown = false;
        game.showError = (message) => {
            errorShown = true;
            if (!message.includes('HTML页面结构不完整')) {
                throw new Error('Wrong error message for container not found');
            }
        };
        
        game.handleInitializationError(mockError);
        
        if (!errorShown) {
            throw new Error('Error should be shown');
        }
        
        // Test different error types
        const browserError = new Error('Browser missing required features');
        game.handleInitializationError(browserError);
        
        const es6Error = new Error('ES6 features');
        game.handleInitializationError(es6Error);
        
        results.push({ name: 'Error handling', passed: true });
    } catch (error) {
        results.push({ name: 'Error handling', passed: false, error: error.message });
    }

    // Test 7: Game statistics
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock components with getStats methods
        game.gameState = { getStats: () => ({ score: 100 }) };
        game.gameBoard = { getStats: () => ({ cells: 64 }) };
        game.audioManager = { getStatus: () => ({ volume: 0.7 }) };
        game.matchDetector = { getDetectionStats: () => ({ matches: 5 }) };
        game.gravitySystem = { getStats: () => ({ movements: 3 }) };
        
        const stats = game.getStats();
        
        if (!stats.isInitialized === false) {
            throw new Error('Should report initialization status');
        }
        
        if (!stats.gameState || stats.gameState.score !== 100) {
            throw new Error('Should include game state stats');
        }
        
        if (!stats.performance) {
            throw new Error('Should include performance stats');
        }
        
        results.push({ name: 'Game statistics', passed: true });
    } catch (error) {
        results.push({ name: 'Game statistics', passed: false, error: error.message });
    }

    // Test 8: Performance monitoring
    try {
        const game = new GhostMatchGame();
        
        const perfStats = game.getPerformanceStats();
        
        if (typeof perfStats !== 'object') {
            throw new Error('Performance stats should be an object');
        }
        
        // Test with mock performance.memory
        const originalMemory = performance.memory;
        performance.memory = {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024
        };
        
        const memoryStats = game.getPerformanceStats();
        
        if (!memoryStats.memory || memoryStats.memory.usedJSHeapSize !== 50) {
            throw new Error('Should calculate memory usage in MB');
        }
        
        // Restore original memory
        performance.memory = originalMemory;
        
        results.push({ name: 'Performance monitoring', passed: true });
    } catch (error) {
        results.push({ name: 'Performance monitoring', passed: false, error: error.message });
    }

    // Test 9: Game health check
    try {
        const game = new GhostMatchGame();
        
        const health = game.checkGameHealth();
        
        if (typeof health.healthy !== 'boolean') {
            throw new Error('Health check should return boolean');
        }
        
        if (!Array.isArray(health.issues)) {
            throw new Error('Health check should return issues array');
        }
        
        if (!health.stats) {
            throw new Error('Health check should include stats');
        }
        
        // Test with high memory usage
        const originalMemory = performance.memory;
        performance.memory = {
            usedJSHeapSize: 150 * 1024 * 1024, // 150MB
            totalJSHeapSize: 200 * 1024 * 1024,
            jsHeapSizeLimit: 300 * 1024 * 1024
        };
        
        const unhealthyCheck = game.checkGameHealth();
        
        if (unhealthyCheck.healthy !== false) {
            throw new Error('Should detect high memory usage as unhealthy');
        }
        
        if (!unhealthyCheck.issues.some(issue => issue.includes('memory'))) {
            throw new Error('Should report memory issue');
        }
        
        // Restore original memory
        performance.memory = originalMemory;
        
        results.push({ name: 'Game health check', passed: true });
    } catch (error) {
        results.push({ name: 'Game health check', passed: false, error: error.message });
    }

    // Test 10: Error display
    try {
        const game = new GhostMatchGame();
        
        // Mock document.createElement and appendChild
        let errorElement = null;
        document.createElement = (tag) => {
            if (tag === 'div') {
                errorElement = {
                    className: '',
                    style: { cssText: '' },
                    textContent: ''
                };
                return errorElement;
            }
            return originalCreateElement.call(document, tag);
        };
        
        let appendedToBody = false;
        const originalAppendChild = document.body.appendChild;
        document.body.appendChild = (element) => {
            if (element === errorElement) {
                appendedToBody = true;
            }
        };
        
        game.showError('Test error message');
        
        if (!errorElement) {
            throw new Error('Error element should be created');
        }
        
        if (errorElement.className !== 'error-message') {
            throw new Error('Error element should have correct class');
        }
        
        if (errorElement.textContent !== 'Test error message') {
            throw new Error('Error element should have correct text');
        }
        
        if (!appendedToBody) {
            throw new Error('Error element should be appended to body');
        }
        
        // Restore original methods
        document.createElement = originalCreateElement;
        document.body.appendChild = originalAppendChild;
        
        results.push({ name: 'Error display', passed: true });
    } catch (error) {
        results.push({ name: 'Error display', passed: false, error: error.message });
    }

    // Test 11: Game state management
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock game engine
        game.gameEngine = {
            state: 'playing',
            pause: () => { game.gameEngine.state = 'paused'; },
            resume: () => { game.gameEngine.state = 'playing'; },
            reset: () => { game.gameEngine.state = 'initializing'; }
        };
        
        // Mock renderer and audio manager
        game.renderer = {
            showPauseOverlay: () => {},
            hidePauseOverlay: () => {}
        };
        game.audioManager = {
            pauseAll: () => {},
            resumeAll: () => {}
        };
        
        // Test pause
        game.pause();
        if (game.gameEngine.state !== 'paused') {
            throw new Error('Game should be paused');
        }
        
        // Test resume
        game.resume();
        if (game.gameEngine.state !== 'playing') {
            throw new Error('Game should be resumed');
        }
        
        results.push({ name: 'Game state management', passed: true });
    } catch (error) {
        results.push({ name: 'Game state management', passed: false, error: error.message });
    }

    // Test 12: Resource cleanup
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock components with destroy methods
        game.gameEngine = { destroy: () => {} };
        game.gameState = { destroy: () => {} };
        game.renderer = { destroy: () => {} };
        game.inputHandler = { destroy: () => {} };
        game.audioManager = { destroy: () => {} };
        game.gameBoard = { destroy: () => {} };
        
        // Mock removeEventListeners
        game.removeEventListeners = () => {};
        
        game.cleanup();
        
        if (game.isInitialized !== false) {
            throw new Error('Game should be marked as not initialized');
        }
        
        if (game.gameEngine !== null) {
            throw new Error('Game engine should be null after cleanup');
        }
        
        results.push({ name: 'Resource cleanup', passed: true });
    } catch (error) {
        results.push({ name: 'Resource cleanup', passed: false, error: error.message });
    }

    // Restore original methods
    document.getElementById = originalGetElementById;
    document.createElement = originalCreateElement;
    document.addEventListener = originalAddEventListener;

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `GhostMatchGame: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}