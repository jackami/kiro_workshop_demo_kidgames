// Integration tests for GhostMatchGame application (main.js)

import '../setup-dom.js';
import { GhostMatchGame } from '../../js/main.js';

export default async function runTests() {
    const results = [];
    
    // Mock DOM environment
    const mockDOM = {
        elements: new Map(),
        eventListeners: new Map()
    };
    
    // Mock document methods
    const originalGetElementById = document.getElementById;
    const originalCreateElement = document.createElement;
    const originalAddEventListener = document.addEventListener;
    const originalAppendChild = document.body.appendChild;
    
    document.getElementById = (id) => {
        if (id === 'game-board') {
            return {
                innerHTML: '',
                appendChild: () => {},
                classList: { add: () => {}, remove: () => {} },
                addEventListener: () => {},
                dispatchEvent: () => {}
            };
        }
        return mockDOM.elements.get(id) || null;
    };
    
    document.createElement = (tag) => {
        if (tag === 'div') {
            return {
                className: '',
                style: { cssText: '' },
                textContent: '',
                classList: { add: () => {}, remove: () => {} }
            };
        }
        return originalCreateElement.call(document, tag);
    };
    
    document.addEventListener = (event, handler) => {
        if (!mockDOM.eventListeners.has(event)) {
            mockDOM.eventListeners.set(event, []);
        }
        mockDOM.eventListeners.get(event).push(handler);
    };
    
    document.body.appendChild = () => {};

    // Test 1: Complete application initialization flow
    try {
        const game = new GhostMatchGame();
        
        // Mock all required methods for initialization
        game.validateBrowserSupport = () => {}; // Skip browser validation
        game.createUIComponents = async () => {
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
        };
        
        game.createGameEngine = () => {
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
        };
        
        game.setupComponentReferences = () => {};
        game.setupEventListeners = () => {};
        game.startGame = () => {};
        
        // Test initialization flow
        await game.initialize();
        
        if (!game.isInitialized) {
            throw new Error('Game should be initialized after successful initialization');
        }
        
        if (!game.gameBoard || !game.gameState) {
            throw new Error('Core components should be created');
        }
        
        if (!game.matchDetector || !game.gravitySystem) {
            throw new Error('Algorithm components should be created');
        }
        
        if (!game.renderer || !game.audioManager) {
            throw new Error('UI components should be created');
        }
        
        if (!game.gameEngine || !game.inputHandler) {
            throw new Error('Engine and input components should be created');
        }
        
        results.push({ name: 'Complete application initialization flow', passed: true });
    } catch (error) {
        results.push({ name: 'Complete application initialization flow', passed: false, error: error.message });
    }

    // Test 2: Error recovery during initialization
    try {
        const game = new GhostMatchGame();
        
        // Mock container not found scenario
        document.getElementById = () => null;
        
        let errorHandled = false;
        game.handleInitializationError = (error) => {
            errorHandled = true;
            if (!error.message.includes('Game container not found')) {
                throw new Error('Should handle container not found error');
            }
        };
        
        try {
            await game.initialize();
        } catch (error) {
            // Expected to fail
        }
        
        if (!errorHandled) {
            throw new Error('Error should be handled when container not found');
        }
        
        // Restore getElementById for next tests
        document.getElementById = (id) => {
            if (id === 'game-board') {
                return {
                    innerHTML: '',
                    appendChild: () => {},
                    classList: { add: () => {}, remove: () => {} },
                    addEventListener: () => {},
                    dispatchEvent: () => {}
                };
            }
            return mockDOM.elements.get(id) || null;
        };
        
        results.push({ name: 'Error recovery during initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Error recovery during initialization', passed: false, error: error.message });
    }

    // Test 3: Game state transitions integration
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock game engine with state tracking
        let currentState = 'playing';
        game.gameEngine = {
            state: currentState,
            pause: () => { currentState = 'paused'; game.gameEngine.state = 'paused'; },
            resume: () => { currentState = 'playing'; game.gameEngine.state = 'playing'; },
            reset: () => { currentState = 'initializing'; game.gameEngine.state = 'initializing'; },
            destroy: () => {}
        };
        
        // Mock renderer and audio manager
        let pauseOverlayShown = false;
        let audiosPaused = false;
        
        game.renderer = {
            showPauseOverlay: () => { pauseOverlayShown = true; },
            hidePauseOverlay: () => { pauseOverlayShown = false; },
            destroy: () => {}
        };
        
        game.audioManager = {
            pauseAll: () => { audiosPaused = true; },
            resumeAll: () => { audiosPaused = false; },
            destroy: () => {}
        };
        
        // Test pause functionality
        game.pause();
        
        if (game.gameEngine.state !== 'paused') {
            throw new Error('Game engine should be paused');
        }
        
        if (!pauseOverlayShown) {
            throw new Error('Pause overlay should be shown');
        }
        
        if (!audiosPaused) {
            throw new Error('Audio should be paused');
        }
        
        // Test resume functionality
        game.resume();
        
        if (game.gameEngine.state !== 'playing') {
            throw new Error('Game engine should be resumed');
        }
        
        if (pauseOverlayShown) {
            throw new Error('Pause overlay should be hidden');
        }
        
        if (audiosPaused) {
            throw new Error('Audio should be resumed');
        }
        
        results.push({ name: 'Game state transitions integration', passed: true });
    } catch (error) {
        results.push({ name: 'Game state transitions integration', passed: false, error: error.message });
    }

    // Test 4: UI controls integration
    try {
        const game = new GhostMatchGame();
        
        // Mock UI elements
        const mockButtons = {
            'pause-btn': {
                textContent: '暂停',
                disabled: false,
                addEventListener: (event, handler) => {
                    mockButtons['pause-btn'].clickHandler = handler;
                }
            },
            'reset-btn': {
                textContent: '重置',
                disabled: false,
                addEventListener: (event, handler) => {
                    mockButtons['reset-btn'].clickHandler = handler;
                }
            },
            'mute-btn': {
                textContent: '静音',
                disabled: false,
                addEventListener: (event, handler) => {
                    mockButtons['mute-btn'].clickHandler = handler;
                }
            }
        };
        
        document.getElementById = (id) => mockButtons[id] || null;
        
        // Mock game engine and audio manager
        game.gameEngine = {
            state: 'playing',
            pause: () => { game.gameEngine.state = 'paused'; },
            resume: () => { game.gameEngine.state = 'playing'; }
        };
        
        game.audioManager = {
            toggleMute: () => true // Return muted state
        };
        
        // Mock confirm dialog
        const originalConfirm = window.confirm;
        window.confirm = () => true;
        
        // Mock reset and startGame methods
        game.reset = () => {};
        game.startGame = () => {};
        
        // Setup UI controls
        game.setupUIControls();
        
        // Test pause button
        if (mockButtons['pause-btn'].clickHandler) {
            mockButtons['pause-btn'].clickHandler();
            
            if (game.gameEngine.state !== 'paused') {
                throw new Error('Pause button should pause the game');
            }
            
            if (mockButtons['pause-btn'].textContent !== '继续') {
                throw new Error('Pause button text should change to continue');
            }
        }
        
        // Test mute button
        if (mockButtons['mute-btn'].clickHandler) {
            mockButtons['mute-btn'].clickHandler();
            
            if (mockButtons['mute-btn'].textContent !== '开启音效') {
                throw new Error('Mute button text should change when muted');
            }
        }
        
        // Restore confirm
        window.confirm = originalConfirm;
        
        results.push({ name: 'UI controls integration', passed: true });
    } catch (error) {
        results.push({ name: 'UI controls integration', passed: false, error: error.message });
    }

    // Test 5: Event system integration
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock components with event system
        let eventHandlers = {};
        
        game.gameState = {
            on: (event, handler) => {
                eventHandlers[event] = handler;
            },
            reset: () => {},
            startGame: () => {},
            endGame: () => {},
            destroy: () => {}
        };
        
        game.gameEngine = {
            on: (event, handler) => {
                eventHandlers[event] = handler;
            },
            initialize: () => {},
            start: () => {},
            destroy: () => {}
        };
        
        game.renderer = {
            updateScore: () => {},
            updateCombo: () => {},
            clearAllHighlights: () => {},
            highlightCell: () => {},
            animateMatch: () => Promise.resolve(),
            animateSwap: () => Promise.resolve(),
            renderBoard: () => {},
            showGameOver: () => {},
            destroy: () => {}
        };
        
        game.audioManager = {
            playMatch: () => {},
            playSwap: () => {},
            playGameOver: () => {},
            destroy: () => {}
        };
        
        // Mock other required methods
        game.setupUIControls = () => {};
        game.showGameOver = () => {};
        
        // Setup event listeners
        game.setupEventListeners();
        
        // Test that event handlers are registered
        if (!eventHandlers['SCORE_UPDATE']) {
            throw new Error('Score update event handler should be registered');
        }
        
        if (!eventHandlers['GAME_START']) {
            throw new Error('Game start event handler should be registered');
        }
        
        if (!eventHandlers['MATCH_FOUND']) {
            throw new Error('Match found event handler should be registered');
        }
        
        // Test event handler execution
        let scoreUpdated = false;
        game.renderer.updateScore = (score, animated) => {
            scoreUpdated = true;
            if (score !== 100 || animated !== true) {
                throw new Error('Score update should pass correct parameters');
            }
        };
        
        eventHandlers['SCORE_UPDATE']({ score: 100 });
        
        if (!scoreUpdated) {
            throw new Error('Score update event should trigger renderer update');
        }
        
        results.push({ name: 'Event system integration', passed: true });
    } catch (error) {
        results.push({ name: 'Event system integration', passed: false, error: error.message });
    }

    // Test 6: Resource cleanup integration
    try {
        const game = new GhostMatchGame();
        game.createCoreComponents();
        
        // Mock all components with destroy methods
        let destroyCalls = [];
        
        game.gameEngine = {
            destroy: () => { destroyCalls.push('gameEngine'); }
        };
        
        game.gameState = {
            destroy: () => { destroyCalls.push('gameState'); }
        };
        
        game.renderer = {
            destroy: () => { destroyCalls.push('renderer'); }
        };
        
        game.inputHandler = {
            destroy: () => { destroyCalls.push('inputHandler'); }
        };
        
        game.audioManager = {
            destroy: () => { destroyCalls.push('audioManager'); }
        };
        
        game.gameBoard = {
            destroy: () => { destroyCalls.push('gameBoard'); }
        };
        
        game.matchDetector = {
            reset: () => { destroyCalls.push('matchDetector'); }
        };
        
        game.gravitySystem = {
            reset: () => { destroyCalls.push('gravitySystem'); }
        };
        
        // Mock removeEventListeners
        game.removeEventListeners = () => { destroyCalls.push('eventListeners'); };
        
        // Test cleanup
        game.cleanup();
        
        // Verify all components were cleaned up
        const expectedCalls = [
            'gameEngine', 'gameState', 'renderer', 'inputHandler',
            'audioManager', 'gameBoard', 'matchDetector', 'gravitySystem',
            'eventListeners'
        ];
        
        for (const expectedCall of expectedCalls) {
            if (!destroyCalls.includes(expectedCall)) {
                throw new Error(`${expectedCall} cleanup should be called`);
            }
        }
        
        // Verify state is reset
        if (game.isInitialized !== false) {
            throw new Error('Game should be marked as not initialized');
        }
        
        if (game.gameEngine !== null) {
            throw new Error('Game engine reference should be null');
        }
        
        results.push({ name: 'Resource cleanup integration', passed: true });
    } catch (error) {
        results.push({ name: 'Resource cleanup integration', passed: false, error: error.message });
    }

    // Test 7: Performance monitoring integration
    try {
        const game = new GhostMatchGame();
        
        // Test performance stats collection
        const stats = game.getStats();
        
        if (typeof stats !== 'object') {
            throw new Error('Stats should return an object');
        }
        
        if (typeof stats.isInitialized !== 'boolean') {
            throw new Error('Stats should include initialization status');
        }
        
        if (!stats.performance) {
            throw new Error('Stats should include performance data');
        }
        
        // Test health check integration
        const health = game.checkGameHealth();
        
        if (typeof health.healthy !== 'boolean') {
            throw new Error('Health check should return boolean status');
        }
        
        if (!Array.isArray(health.issues)) {
            throw new Error('Health check should return issues array');
        }
        
        if (!health.stats) {
            throw new Error('Health check should include stats');
        }
        
        // Test with unhealthy conditions
        game.isInitialized = false;
        const unhealthyCheck = game.checkGameHealth();
        
        if (unhealthyCheck.healthy !== false) {
            throw new Error('Uninitialized game should be unhealthy');
        }
        
        if (unhealthyCheck.issues.length === 0) {
            throw new Error('Unhealthy game should have issues');
        }
        
        results.push({ name: 'Performance monitoring integration', passed: true });
    } catch (error) {
        results.push({ name: 'Performance monitoring integration', passed: false, error: error.message });
    }

    // Restore original DOM methods
    document.getElementById = originalGetElementById;
    document.createElement = originalCreateElement;
    document.addEventListener = originalAddEventListener;
    document.body.appendChild = originalAppendChild;

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `Application Integration: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}