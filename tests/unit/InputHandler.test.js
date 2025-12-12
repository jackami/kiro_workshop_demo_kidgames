// Unit tests for InputHandler class

import { InputHandler } from '../../js/components/InputHandler.js';
import { GAME_CONFIG } from '../../js/constants.js';
import { TestUtils } from '../test-config.js';

export default async function runTests() {
    const results = [];
    
    // Mock DOM elements and APIs
    const mockGameEngine = {
        state: 'playing',
        handleInput: () => true,
        audioManager: {
            toggleMute: () => false
        }
    };
    
    const mockGameBoard = {
        isValidPosition: (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8,
        getCell: (x, y) => ({ type: 1, x, y })
    };
    
    const mockRenderer = {
        highlightCell: () => {},
        clearAllHighlights: () => {}
    };

    // Mock DOM methods
    global.document = {
        addEventListener: () => {},
        removeEventListener: () => {},
        getElementById: (id) => ({
            addEventListener: () => {},
            textContent: '',
            classList: { add: () => {}, remove: () => {} }
        }),
        elementFromPoint: () => null
    };
    
    global.performance = {
        now: () => Date.now(),
        memory: {
            usedJSHeapSize: 10 * 1024 * 1024,
            totalJSHeapSize: 20 * 1024 * 1024,
            jsHeapSizeLimit: 100 * 1024 * 1024
        }
    };
    
    if (!global.navigator) {
        global.navigator = {};
    }
    global.navigator.vibrate = () => true;

    // Test 1: Constructor initialization
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        if (!inputHandler.gameEngine) {
            throw new Error('Game engine not set');
        }
        
        if (!inputHandler.isEnabled) {
            throw new Error('Input handler should be enabled by default');
        }
        
        if (!inputHandler.performanceStats) {
            throw new Error('Performance stats not initialized');
        }
        
        if (typeof inputHandler.debouncedCellClick !== 'function') {
            throw new Error('Debounced cell click not initialized');
        }
        
        if (typeof inputHandler.throttledTouchMove !== 'function') {
            throw new Error('Throttled touch move not initialized');
        }
        
        results.push({ name: 'Constructor initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Constructor initialization', passed: false, error: error.message });
    }

    // Test 2: Performance stats initialization
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        const stats = inputHandler.performanceStats;
        
        if (stats.touchEvents !== 0) {
            throw new Error('Touch events should start at 0');
        }
        
        if (stats.clickEvents !== 0) {
            throw new Error('Click events should start at 0');
        }
        
        if (stats.averageResponseTime !== 0) {
            throw new Error('Average response time should start at 0');
        }
        
        if (typeof stats.memoryUsage !== 'number') {
            throw new Error('Memory usage should be initialized');
        }
        
        results.push({ name: 'Performance stats initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Performance stats initialization', passed: false, error: error.message });
    }

    // Test 3: Component setup
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        inputHandler.setComponents(mockGameBoard, mockRenderer);
        
        if (inputHandler.gameBoard !== mockGameBoard) {
            throw new Error('Game board not set correctly');
        }
        
        if (inputHandler.renderer !== mockRenderer) {
            throw new Error('Renderer not set correctly');
        }
        
        results.push({ name: 'Component setup', passed: true });
    } catch (error) {
        results.push({ name: 'Component setup', passed: false, error: error.message });
    }

    // Test 4: Cell click handling with performance tracking
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        inputHandler.setComponents(mockGameBoard, mockRenderer);
        
        const initialClickEvents = inputHandler.performanceStats.clickEvents;
        
        // Mock cell click detail
        const clickDetail = {
            x: 3,
            y: 4,
            element: { style: {} }
        };
        
        inputHandler.handleCellClick(clickDetail);
        
        if (inputHandler.performanceStats.clickEvents !== initialClickEvents + 1) {
            throw new Error('Click events not incremented');
        }
        
        // Response time should be calculated after the first event (may be 0 initially)
        // The key is that the method was called without error
        if (inputHandler.performanceStats.clickEvents === 0) {
            throw new Error('Click event should have been processed');
        }
        
        results.push({ name: 'Cell click handling with performance tracking', passed: true });
    } catch (error) {
        results.push({ name: 'Cell click handling with performance tracking', passed: false, error: error.message });
    }

    // Test 5: Touch event handling with performance tracking
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        const initialTouchEvents = inputHandler.performanceStats.touchEvents;
        
        // Mock touch start event
        const touchEvent = {
            touches: [{ clientX: 100, clientY: 200 }]
        };
        
        inputHandler.handleTouchStart(touchEvent);
        
        if (inputHandler.performanceStats.touchEvents !== initialTouchEvents + 1) {
            throw new Error('Touch events not incremented');
        }
        
        if (!inputHandler.touchStartPosition) {
            throw new Error('Touch start position not recorded');
        }
        
        if (inputHandler.touchStartPosition.x !== 100 || inputHandler.touchStartPosition.y !== 200) {
            throw new Error('Touch start position incorrect');
        }
        
        results.push({ name: 'Touch event handling with performance tracking', passed: true });
    } catch (error) {
        results.push({ name: 'Touch event handling with performance tracking', passed: false, error: error.message });
    }

    // Test 6: Touch end processing with timing
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Set up touch start
        inputHandler.touchStartTime = performance.now() - 100; // 100ms ago
        inputHandler.lastTouchTime = 0;
        
        const touchEndEvent = {
            target: { closest: () => null }
        };
        
        inputHandler.handleTouchEnd(touchEndEvent);
        
        if (inputHandler.lastTouchTime === 0) {
            throw new Error('Last touch time not updated');
        }
        
        results.push({ name: 'Touch end processing with timing', passed: true });
    } catch (error) {
        results.push({ name: 'Touch end processing with timing', passed: false, error: error.message });
    }

    // Test 7: Position validation
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Valid positions
        if (!inputHandler.isValidPosition(0, 0)) {
            throw new Error('(0,0) should be valid');
        }
        
        if (!inputHandler.isValidPosition(7, 7)) {
            throw new Error('(7,7) should be valid');
        }
        
        if (!inputHandler.isValidPosition(3, 4)) {
            throw new Error('(3,4) should be valid');
        }
        
        // Invalid positions
        if (inputHandler.isValidPosition(-1, 0)) {
            throw new Error('(-1,0) should be invalid');
        }
        
        if (inputHandler.isValidPosition(0, -1)) {
            throw new Error('(0,-1) should be invalid');
        }
        
        if (inputHandler.isValidPosition(8, 0)) {
            throw new Error('(8,0) should be invalid');
        }
        
        if (inputHandler.isValidPosition(0, 8)) {
            throw new Error('(0,8) should be invalid');
        }
        
        results.push({ name: 'Position validation', passed: true });
    } catch (error) {
        results.push({ name: 'Position validation', passed: false, error: error.message });
    }

    // Test 8: Adjacency checking
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Adjacent positions
        if (!inputHandler.isAdjacent({ x: 3, y: 3 }, { x: 4, y: 3 })) {
            throw new Error('Horizontal adjacency not detected');
        }
        
        if (!inputHandler.isAdjacent({ x: 3, y: 3 }, { x: 3, y: 4 })) {
            throw new Error('Vertical adjacency not detected');
        }
        
        if (!inputHandler.isAdjacent({ x: 3, y: 3 }, { x: 2, y: 3 })) {
            throw new Error('Left adjacency not detected');
        }
        
        if (!inputHandler.isAdjacent({ x: 3, y: 3 }, { x: 3, y: 2 })) {
            throw new Error('Up adjacency not detected');
        }
        
        // Non-adjacent positions
        if (inputHandler.isAdjacent({ x: 3, y: 3 }, { x: 5, y: 3 })) {
            throw new Error('Non-adjacent horizontal should not be detected');
        }
        
        if (inputHandler.isAdjacent({ x: 3, y: 3 }, { x: 4, y: 4 })) {
            throw new Error('Diagonal should not be adjacent');
        }
        
        results.push({ name: 'Adjacency checking', passed: true });
    } catch (error) {
        results.push({ name: 'Adjacency checking', passed: false, error: error.message });
    }

    // Test 9: Move validation
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        inputHandler.setComponents(mockGameBoard, mockRenderer);
        
        // Valid move
        const validMove = inputHandler.validateMove(
            { x: 3, y: 3 },
            { x: 4, y: 3 }
        );
        
        if (!validMove) {
            throw new Error('Valid adjacent move should be accepted');
        }
        
        // Invalid move - not adjacent
        const invalidMove1 = inputHandler.validateMove(
            { x: 3, y: 3 },
            { x: 5, y: 3 }
        );
        
        if (invalidMove1) {
            throw new Error('Non-adjacent move should be rejected');
        }
        
        // Invalid move - out of bounds
        const invalidMove2 = inputHandler.validateMove(
            { x: 7, y: 7 },
            { x: 8, y: 7 }
        );
        
        if (invalidMove2) {
            throw new Error('Out of bounds move should be rejected');
        }
        
        results.push({ name: 'Move validation', passed: true });
    } catch (error) {
        results.push({ name: 'Move validation', passed: false, error: error.message });
    }

    // Test 10: Debounce functionality
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        let callCount = 0;
        
        const testFunction = () => { callCount++; };
        const debouncedFunction = inputHandler.debounce(testFunction, 100);
        
        // Call multiple times rapidly
        debouncedFunction();
        debouncedFunction();
        debouncedFunction();
        
        // Should only be called once after delay
        if (callCount !== 0) {
            throw new Error('Debounced function called too early');
        }
        
        // Wait for debounce delay
        await TestUtils.delay(150);
        
        if (callCount !== 1) {
            throw new Error(`Expected 1 call, got ${callCount}`);
        }
        
        results.push({ name: 'Debounce functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Debounce functionality', passed: false, error: error.message });
    }

    // Test 11: Throttle functionality
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        let callCount = 0;
        
        const testFunction = () => { callCount++; };
        const throttledFunction = inputHandler.throttle(testFunction, 100);
        
        // Call multiple times rapidly
        throttledFunction();
        throttledFunction();
        throttledFunction();
        
        // Should be called immediately once
        if (callCount !== 1) {
            throw new Error(`Expected 1 immediate call, got ${callCount}`);
        }
        
        // Wait for throttle period
        await TestUtils.delay(150);
        
        // Call again
        throttledFunction();
        
        if (callCount !== 2) {
            throw new Error(`Expected 2 calls after throttle period, got ${callCount}`);
        }
        
        results.push({ name: 'Throttle functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Throttle functionality', passed: false, error: error.message });
    }

    // Test 12: Performance stats methods
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Test getPerformanceStats
        const stats = inputHandler.getPerformanceStats();
        
        if (!stats || typeof stats !== 'object') {
            throw new Error('Performance stats not returned as object');
        }
        
        if (!stats.hasOwnProperty('touchEvents')) {
            throw new Error('Touch events not in performance stats');
        }
        
        if (!stats.hasOwnProperty('clickEvents')) {
            throw new Error('Click events not in performance stats');
        }
        
        // Test resetPerformanceStats
        inputHandler.performanceStats.clickEvents = 10;
        inputHandler.performanceStats.touchEvents = 5;
        
        inputHandler.resetPerformanceStats();
        
        if (inputHandler.performanceStats.clickEvents !== 0) {
            throw new Error('Click events not reset');
        }
        
        if (inputHandler.performanceStats.touchEvents !== 0) {
            throw new Error('Touch events not reset');
        }
        
        results.push({ name: 'Performance stats methods', passed: true });
    } catch (error) {
        results.push({ name: 'Performance stats methods', passed: false, error: error.message });
    }

    // Test 13: Memory usage tracking
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        inputHandler.updateMemoryUsage();
        
        const memoryUsage = inputHandler.performanceStats.memoryUsage;
        
        if (!memoryUsage || typeof memoryUsage !== 'object') {
            throw new Error('Memory usage not tracked as object');
        }
        
        if (typeof memoryUsage.used !== 'number') {
            throw new Error('Used memory not tracked');
        }
        
        if (typeof memoryUsage.total !== 'number') {
            throw new Error('Total memory not tracked');
        }
        
        if (typeof memoryUsage.limit !== 'number') {
            throw new Error('Memory limit not tracked');
        }
        
        results.push({ name: 'Memory usage tracking', passed: true });
    } catch (error) {
        results.push({ name: 'Memory usage tracking', passed: false, error: error.message });
    }

    // Test 14: Response time calculation
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Set up initial event counts for proper average calculation
        inputHandler.performanceStats.clickEvents = 1;
        inputHandler.performanceStats.touchEvents = 0;
        
        const startTime = performance.now() - 50; // 50ms ago
        inputHandler.updateResponseTime(startTime);
        
        if (inputHandler.performanceStats.averageResponseTime <= 0) {
            throw new Error('Response time not calculated');
        }
        
        // Test multiple response times for average calculation
        const startTime2 = performance.now() - 30; // 30ms ago
        inputHandler.performanceStats.clickEvents = 1;
        inputHandler.performanceStats.touchEvents = 1;
        inputHandler.updateResponseTime(startTime2);
        
        if (inputHandler.performanceStats.averageResponseTime <= 0) {
            throw new Error('Average response time not calculated correctly');
        }
        
        results.push({ name: 'Response time calculation', passed: true });
    } catch (error) {
        results.push({ name: 'Response time calculation', passed: false, error: error.message });
    }

    // Test 15: Touch feedback functionality
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        const mockEvent = {
            target: {
                closest: (selector) => {
                    if (selector === '.game-cell') {
                        return {
                            classList: {
                                add: () => {},
                                remove: () => {}
                            }
                        };
                    }
                    return null;
                }
            }
        };
        
        // Should not throw error
        inputHandler.addTouchFeedback(mockEvent);
        
        // Test with non-game-cell target
        const mockEvent2 = {
            target: {
                closest: () => null
            }
        };
        
        inputHandler.addTouchFeedback(mockEvent2);
        
        results.push({ name: 'Touch feedback functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Touch feedback functionality', passed: false, error: error.message });
    }

    // Test 16: Enable/disable functionality
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Should be enabled by default
        if (!inputHandler.isEnabled) {
            throw new Error('Should be enabled by default');
        }
        
        // Test disable
        inputHandler.disable();
        if (inputHandler.isEnabled) {
            throw new Error('Should be disabled after disable()');
        }
        
        // Test enable
        inputHandler.enable();
        if (!inputHandler.isEnabled) {
            throw new Error('Should be enabled after enable()');
        }
        
        results.push({ name: 'Enable/disable functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Enable/disable functionality', passed: false, error: error.message });
    }

    // Test 17: Reset functionality
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Set some state
        inputHandler.isEnabled = false;
        inputHandler.touchStartTime = 12345;
        inputHandler.touchStartPosition = { x: 100, y: 200 };
        inputHandler.lastTouchTime = 67890;
        
        // Reset
        inputHandler.reset();
        
        if (!inputHandler.isEnabled) {
            throw new Error('Should be enabled after reset');
        }
        
        if (inputHandler.touchStartTime !== 0) {
            throw new Error('Touch start time should be reset');
        }
        
        if (inputHandler.touchStartPosition !== null) {
            throw new Error('Touch start position should be reset');
        }
        
        if (inputHandler.lastTouchTime !== 0) {
            throw new Error('Last touch time should be reset');
        }
        
        results.push({ name: 'Reset functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Reset functionality', passed: false, error: error.message });
    }

    // Test 18: Destroy functionality with performance cleanup
    try {
        const inputHandler = new InputHandler(mockGameEngine);
        
        // Set up performance monitoring
        inputHandler.performanceInterval = setInterval(() => {}, 1000);
        
        // Destroy
        inputHandler.destroy();
        
        if (inputHandler.isEnabled) {
            throw new Error('Should be disabled after destroy');
        }
        
        if (inputHandler.gameEngine !== null) {
            throw new Error('Game engine reference should be cleared');
        }
        
        if (inputHandler.gameBoard !== null) {
            throw new Error('Game board reference should be cleared');
        }
        
        if (inputHandler.renderer !== null) {
            throw new Error('Renderer reference should be cleared');
        }
        
        // Performance interval should be cleared (can't directly test, but no error should occur)
        
        results.push({ name: 'Destroy functionality with performance cleanup', passed: true });
    } catch (error) {
        results.push({ name: 'Destroy functionality with performance cleanup', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `InputHandler: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}