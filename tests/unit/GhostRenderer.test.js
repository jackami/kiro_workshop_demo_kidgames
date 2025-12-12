// Unit tests for GhostRenderer class

import { GhostRenderer } from '../../js/components/GhostRenderer.js';
import { GameBoard } from '../../js/core/GameBoard.js';
import { GAME_CONFIG } from '../../js/constants.js';

export default async function runTests() {
    const results = [];
    
    // Test 1: Constructor and initialization
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        if (!renderer.container) {
            throw new Error('Container should be set');
        }
        
        if (!renderer.cellElements || renderer.cellElements.length === 0) {
            throw new Error('Cell elements should be initialized');
        }
        
        // Check grid structure
        if (renderer.cellElements.length !== GAME_CONFIG.BOARD_SIZE) {
            throw new Error(`Expected ${GAME_CONFIG.BOARD_SIZE} rows, got ${renderer.cellElements.length}`);
        }
        
        if (renderer.cellElements[0].length !== GAME_CONFIG.BOARD_SIZE) {
            throw new Error(`Expected ${GAME_CONFIG.BOARD_SIZE} columns, got ${renderer.cellElements[0].length}`);
        }
        
        results.push({ name: 'Constructor and initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Constructor and initialization', passed: false, error: error.message });
    }

    // Test 2: Cell element creation
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Check that all cells are created
        const totalCells = GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.BOARD_SIZE;
        const createdCells = container.querySelectorAll('.game-cell');
        
        if (createdCells.length !== totalCells) {
            throw new Error(`Expected ${totalCells} cells, got ${createdCells.length}`);
        }
        
        // Check cell data attributes
        const firstCell = createdCells[0];
        if (!firstCell.dataset.x || !firstCell.dataset.y) {
            throw new Error('Cells should have x and y data attributes');
        }
        
        results.push({ name: 'Cell element creation', passed: true });
    } catch (error) {
        results.push({ name: 'Cell element creation', passed: false, error: error.message });
    }

    // Test 3: Cell click event dispatching
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        let eventReceived = false;
        let eventDetail = null;
        
        // Listen for cellClick event on document (as per the fix)
        const listener = (event) => {
            eventReceived = true;
            eventDetail = event.detail;
        };
        document.addEventListener('cellClick', listener);
        
        // Simulate cell click
        const cell = renderer.cellElements[2][3];
        cell.click();
        
        // Wait for event propagation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (!eventReceived) {
            throw new Error('cellClick event should be dispatched on document');
        }
        
        if (!eventDetail || eventDetail.x !== 3 || eventDetail.y !== 2) {
            throw new Error('Event detail should contain correct coordinates');
        }
        
        if (!eventDetail.element) {
            throw new Error('Event detail should contain element reference');
        }
        
        // Cleanup
        document.removeEventListener('cellClick', listener);
        
        results.push({ name: 'Cell click event dispatching', passed: true });
    } catch (error) {
        results.push({ name: 'Cell click event dispatching', passed: false, error: error.message });
    }

    // Test 4: Event bubbling and cancelable properties
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        let capturedEvent = null;
        
        const listener = (event) => {
            capturedEvent = event;
        };
        document.addEventListener('cellClick', listener);
        
        // Trigger click
        const cell = renderer.cellElements[0][0];
        cell.click();
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (!capturedEvent) {
            throw new Error('Event should be captured');
        }
        
        if (!capturedEvent.bubbles) {
            throw new Error('Event should bubble');
        }
        
        if (!capturedEvent.cancelable) {
            throw new Error('Event should be cancelable');
        }
        
        document.removeEventListener('cellClick', listener);
        
        results.push({ name: 'Event bubbling and cancelable properties', passed: true });
    } catch (error) {
        results.push({ name: 'Event bubbling and cancelable properties', passed: false, error: error.message });
    }

    // Test 5: Render board with ghosts
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        const gameBoard = new GameBoard();
        
        gameBoard.initializeWithGhosts();
        renderer.renderBoard(gameBoard);
        
        // Check that ghosts are rendered
        const ghostIcons = container.querySelectorAll('.ghost-icon');
        const expectedGhosts = GAME_CONFIG.BOARD_SIZE * GAME_CONFIG.BOARD_SIZE;
        
        if (ghostIcons.length !== expectedGhosts) {
            throw new Error(`Expected ${expectedGhosts} ghost icons, got ${ghostIcons.length}`);
        }
        
        // Check ghost properties
        const firstGhost = ghostIcons[0];
        if (!firstGhost.dataset.type) {
            throw new Error('Ghost should have type data attribute');
        }
        
        if (!firstGhost.dataset.x || !firstGhost.dataset.y) {
            throw new Error('Ghost should have position data attributes');
        }
        
        results.push({ name: 'Render board with ghosts', passed: true });
    } catch (error) {
        results.push({ name: 'Render board with ghosts', passed: false, error: error.message });
    }

    // Test 6: Highlight cell selection
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Highlight a cell
        renderer.highlightCell(2, 3, true);
        
        const cell = renderer.cellElements[3][2];
        if (!cell.classList.contains('selected')) {
            throw new Error('Cell should have selected class');
        }
        
        // Remove highlight
        renderer.highlightCell(2, 3, false);
        
        if (cell.classList.contains('selected')) {
            throw new Error('Cell should not have selected class after removal');
        }
        
        results.push({ name: 'Highlight cell selection', passed: true });
    } catch (error) {
        results.push({ name: 'Highlight cell selection', passed: false, error: error.message });
    }

    // Test 7: Clear all highlights
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Highlight multiple cells
        renderer.highlightCell(0, 0, true);
        renderer.highlightCell(1, 1, true);
        renderer.highlightCell(2, 2, true);
        
        // Clear all
        renderer.clearAllHighlights();
        
        // Check no cells are highlighted
        const highlightedCells = container.querySelectorAll('.game-cell.selected');
        if (highlightedCells.length !== 0) {
            throw new Error('No cells should be highlighted after clearAllHighlights');
        }
        
        results.push({ name: 'Clear all highlights', passed: true });
    } catch (error) {
        results.push({ name: 'Clear all highlights', passed: false, error: error.message });
    }

    // Test 8: Update score display
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Create score element
        const scoreElement = document.createElement('span');
        scoreElement.id = 'score';
        document.body.appendChild(scoreElement);
        renderer.scoreElement = scoreElement;
        
        // Update score
        renderer.updateScore(1234, false);
        
        if (scoreElement.textContent !== '1,234') {
            throw new Error(`Expected '1,234', got '${scoreElement.textContent}'`);
        }
        
        // Cleanup
        document.body.removeChild(scoreElement);
        
        results.push({ name: 'Update score display', passed: true });
    } catch (error) {
        results.push({ name: 'Update score display', passed: false, error: error.message });
    }

    // Test 9: Update combo display
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Create combo element
        const comboElement = document.createElement('span');
        comboElement.id = 'combo';
        document.body.appendChild(comboElement);
        renderer.comboElement = comboElement;
        
        // Update combo
        renderer.updateCombo(5);
        
        if (comboElement.textContent !== '5') {
            throw new Error(`Expected '5', got '${comboElement.textContent}'`);
        }
        
        // Cleanup
        document.body.removeChild(comboElement);
        
        results.push({ name: 'Update combo display', passed: true });
    } catch (error) {
        results.push({ name: 'Update combo display', passed: false, error: error.message });
    }

    // Test 10: Update timer display
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Create timer element
        const timerElement = document.createElement('span');
        timerElement.id = 'timer';
        document.body.appendChild(timerElement);
        renderer.timerElement = timerElement;
        
        // Update timer
        renderer.updateTimer('12:34');
        
        if (timerElement.textContent !== '12:34') {
            throw new Error(`Expected '12:34', got '${timerElement.textContent}'`);
        }
        
        // Cleanup
        document.body.removeChild(timerElement);
        
        results.push({ name: 'Update timer display', passed: true });
    } catch (error) {
        results.push({ name: 'Update timer display', passed: false, error: error.message });
    }

    // Test 11: Get cell and ghost elements
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        const gameBoard = new GameBoard();
        
        gameBoard.initializeWithGhosts();
        renderer.renderBoard(gameBoard);
        
        // Get cell element
        const cellElement = renderer.getCellElement(3, 2);
        if (!cellElement) {
            throw new Error('Should return cell element');
        }
        
        if (cellElement.dataset.x !== '3' || cellElement.dataset.y !== '2') {
            throw new Error('Cell element should have correct coordinates');
        }
        
        // Get ghost element
        const ghostElement = renderer.getGhostElement(3, 2);
        if (!ghostElement) {
            throw new Error('Should return ghost element');
        }
        
        if (!ghostElement.classList.contains('ghost-icon')) {
            throw new Error('Ghost element should have ghost-icon class');
        }
        
        results.push({ name: 'Get cell and ghost elements', passed: true });
    } catch (error) {
        results.push({ name: 'Get cell and ghost elements', passed: false, error: error.message });
    }

    // Test 12: Reset functionality
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        const gameBoard = new GameBoard();
        
        // Create UI elements
        const scoreElement = document.createElement('span');
        scoreElement.id = 'score';
        const comboElement = document.createElement('span');
        comboElement.id = 'combo';
        const timerElement = document.createElement('span');
        timerElement.id = 'timer';
        
        document.body.appendChild(scoreElement);
        document.body.appendChild(comboElement);
        document.body.appendChild(timerElement);
        
        renderer.scoreElement = scoreElement;
        renderer.comboElement = comboElement;
        renderer.timerElement = timerElement;
        
        // Set up some state
        gameBoard.initializeWithGhosts();
        renderer.renderBoard(gameBoard);
        renderer.updateScore(1000, false);
        renderer.updateCombo(5);
        renderer.highlightCell(2, 2, true);
        
        // Reset
        renderer.reset();
        
        // Check reset state
        if (scoreElement.textContent !== '0') {
            throw new Error('Score should be reset to 0');
        }
        
        if (comboElement.textContent !== '0') {
            throw new Error('Combo should be reset to 0');
        }
        
        if (timerElement.textContent !== '00:00') {
            throw new Error('Timer should be reset to 00:00');
        }
        
        const highlightedCells = container.querySelectorAll('.game-cell.selected');
        if (highlightedCells.length !== 0) {
            throw new Error('No cells should be highlighted after reset');
        }
        
        // Cleanup
        document.body.removeChild(scoreElement);
        document.body.removeChild(comboElement);
        document.body.removeChild(timerElement);
        
        results.push({ name: 'Reset functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Reset functionality', passed: false, error: error.message });
    }

    // Test 13: Animation state detection
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        const gameBoard = new GameBoard();
        
        gameBoard.initializeWithGhosts();
        renderer.renderBoard(gameBoard);
        
        // Initially no animations
        if (renderer.isAnimating()) {
            throw new Error('Should not be animating initially');
        }
        
        // Add animation class to a ghost
        const ghost = container.querySelector('.ghost-icon');
        ghost.classList.add('swapping');
        
        // Should detect animation
        if (!renderer.isAnimating()) {
            throw new Error('Should detect animation');
        }
        
        // Remove animation class
        ghost.classList.remove('swapping');
        
        // Should not be animating
        if (renderer.isAnimating()) {
            throw new Error('Should not be animating after removal');
        }
        
        results.push({ name: 'Animation state detection', passed: true });
    } catch (error) {
        results.push({ name: 'Animation state detection', passed: false, error: error.message });
    }

    // Test 14: Stop all animations
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        const gameBoard = new GameBoard();
        
        gameBoard.initializeWithGhosts();
        renderer.renderBoard(gameBoard);
        
        // Add various animation classes
        const ghosts = container.querySelectorAll('.ghost-icon');
        ghosts[0].classList.add('swapping');
        ghosts[1].classList.add('eliminating');
        ghosts[2].classList.add('falling');
        ghosts[3].classList.add('appearing');
        
        // Stop all animations
        renderer.stopAllAnimations();
        
        // Check no animation classes remain
        const animatingGhosts = container.querySelectorAll('.swapping, .eliminating, .falling, .appearing');
        if (animatingGhosts.length !== 0) {
            throw new Error('All animation classes should be removed');
        }
        
        results.push({ name: 'Stop all animations', passed: true });
    } catch (error) {
        results.push({ name: 'Stop all animations', passed: false, error: error.message });
    }

    // Test 15: Render cell with null ghost
    try {
        const container = document.createElement('div');
        const renderer = new GhostRenderer(container);
        
        // Render empty cell
        renderer.renderCell(0, 0, null);
        
        const cell = renderer.cellElements[0][0];
        const ghostIcon = cell.querySelector('.ghost-icon');
        
        if (ghostIcon) {
            throw new Error('Empty cell should not have ghost icon');
        }
        
        results.push({ name: 'Render cell with null ghost', passed: true });
    } catch (error) {
        results.push({ name: 'Render cell with null ghost', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `GhostRenderer: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}
