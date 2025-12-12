// 主入口文件 - 应用程序初始化和设置

import { GameEngine } from './core/GameEngine.js';
import { GameBoard } from './core/GameBoard.js';
import { GameState } from './core/GameState.js';
import { GhostRenderer } from './components/GhostRenderer.js';
import { InputHandler } from './components/InputHandler.js';
import { AudioManager } from './components/AudioManager.js';
import { MatchDetector } from './algorithms/MatchDetector.js';
import { GravitySystem } from './algorithms/GravitySystem.js';
import { GAME_CONFIG, EVENTS } from './constants.js';

class GhostMatchGame {
    constructor() {
        this.gameEngine = null;
        this.gameBoard = null;
        this.gameState = null;
        this.renderer = null;
        this.inputHandler = null;
        this.audioManager = null;
        this.matchDetector = null;
        this.gravitySystem = null;
        
        this.isInitialized = false;
        this.gameContainer = null;
    }

    // 初始化游戏
    async initialize() {
        try {
            console.log('Initializing Ghost Match Game...');
            
            // 验证浏览器兼容性
            this.validateBrowserSupport();
            
            // 获取游戏容器
            this.gameContainer = document.getElementById('game-board');
            if (!this.gameContainer) {
                throw new Error('Game container not found');
            }

            // 创建核心组件
            this.createCoreComponents();
            
            // 创建算法组件
            this.createAlgorithmComponents();
            
            // 创建UI组件
            await this.createUIComponents();
            
            // 创建游戏引擎
            this.createGameEngine();
            
            // 设置组件间的引用
            this.setupComponentReferences();
            
            // 验证组件初始化
            this.validateComponentInitialization();
            
            // 应用游戏配置
            this.applyGameConfiguration();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 初始化游戏引擎
            this.initializeGameEngine();
            
            this.isInitialized = true;
            console.log('Game initialized successfully');
            
            // 开始游戏
            this.startGame();
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleInitializationError(error);
        }
    }

    // 验证浏览器支持
    validateBrowserSupport() {
        const requiredFeatures = [
            'requestAnimationFrame',
            'addEventListener',
            'querySelector',
            'classList',
            'localStorage'
        ];

        const missingFeatures = requiredFeatures.filter(feature => {
            return !(feature in window) && !(feature in document) && !(feature in Element.prototype);
        });

        if (missingFeatures.length > 0) {
            throw new Error(`Browser missing required features: ${missingFeatures.join(', ')}`);
        }

        // 检查ES6支持
        try {
            eval('const test = () => {}; class Test {}');
        } catch (e) {
            throw new Error('Browser does not support ES6 features');
        }
    }

    // 验证组件初始化
    validateComponentInitialization() {
        const requiredComponents = [
            'gameBoard', 'gameState', 'renderer', 'inputHandler', 
            'audioManager', 'matchDetector', 'gravitySystem', 'gameEngine'
        ];

        const missingComponents = requiredComponents.filter(component => !this[component]);

        if (missingComponents.length > 0) {
            throw new Error(`Failed to initialize components: ${missingComponents.join(', ')}`);
        }

        console.log('All components initialized successfully');
    }

    // 应用游戏配置
    applyGameConfiguration() {
        // 设置调试模式
        if (GAME_CONFIG.DEBUG_MODE) {
            console.log('Debug mode enabled');
            window.gameDebug = {
                game: this,
                stats: () => this.getStats(),
                health: () => this.checkGameHealth()
            };
        }

        // 应用动画配置
        if (this.renderer) {
            this.renderer.setAnimationDurations(GAME_CONFIG.ANIMATION_DURATION);
        }

        // 应用音频配置
        if (this.audioManager) {
            this.audioManager.setDefaultVolume(0.7);
        }

        console.log('Game configuration applied');
    }

    // 处理初始化错误
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        let errorMessage = '游戏初始化失败。';
        let shouldRetry = false;

        if (error.message.includes('Game container not found')) {
            errorMessage = 'HTML页面结构不完整，请刷新页面。';
        } else if (error.message.includes('Browser missing required features')) {
            errorMessage = '您的浏览器不支持此游戏，请使用现代浏览器。';
        } else if (error.message.includes('ES6 features')) {
            errorMessage = '您的浏览器版本过低，请更新浏览器。';
        } else if (error.message.includes('Failed to initialize components')) {
            errorMessage = '游戏组件加载失败，正在重试...';
            shouldRetry = true;
        } else {
            errorMessage = '游戏初始化失败，请刷新页面重试。';
        }

        this.showError(errorMessage);

        if (shouldRetry) {
            // 延迟重试
            setTimeout(() => {
                console.log('Retrying initialization...');
                this.initialize();
            }, 2000);
        }
    }

    // 创建核心组件
    createCoreComponents() {
        this.gameBoard = new GameBoard();
        this.gameState = new GameState();
        
        console.log('Core components created');
    }

    // 创建算法组件
    createAlgorithmComponents() {
        this.matchDetector = new MatchDetector();
        this.gravitySystem = new GravitySystem();
        
        console.log('Algorithm components created');
    }

    // 创建UI组件
    async createUIComponents() {
        // 创建渲染器
        this.renderer = new GhostRenderer(this.gameContainer);
        
        // 创建音频管理器（不立即初始化，等待用户交互）
        this.audioManager = new AudioManager();
        
        console.log('UI components created');
    }

    // 创建游戏引擎
    createGameEngine() {
        this.gameEngine = new GameEngine();
        
        // 创建输入处理器（需要游戏引擎引用）
        this.inputHandler = new InputHandler(this.gameEngine);
        
        console.log('Game engine created');
    }

    // 设置组件间的引用
    setupComponentReferences() {
        // 设置输入处理器的组件引用
        this.inputHandler.setComponents(this.gameBoard, this.renderer);
        
        // 设置渲染器的游戏板引用
        this.renderer.setGameBoard(this.gameBoard);
        
        // 设置匹配检测器的游戏板引用
        this.matchDetector.setGameBoard(this.gameBoard);
        
        // 设置重力系统的游戏板引用
        this.gravitySystem.setGameBoard(this.gameBoard);
        
        console.log('Component references set up');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 设置首次用户交互监听器来初始化音频
        this.setupAudioInitialization();
        
        // 游戏状态事件
        this.gameState.on(EVENTS.SCORE_UPDATE, (data) => {
            this.renderer.updateScore(data.score, true);
        });

        this.gameState.on(EVENTS.COMBO_UPDATE, (data) => {
            this.renderer.updateCombo(data.combo);
        });

        this.gameState.on(EVENTS.CELL_SELECT, (data) => {
            this.renderer.clearAllHighlights();
            if (data.position) {
                this.renderer.highlightCell(data.position.x, data.position.y, true);
            }
        });

        // 游戏引擎事件
        this.gameEngine.on(EVENTS.GAME_START, () => {
            console.log('Game started');
            this.gameState.startGame();
        });

        this.gameEngine.on(EVENTS.GAME_END, (data) => {
            console.log('Game ended', data);
            this.gameState.endGame();
            this.showGameOver(data.finalScore);
        });

        this.gameEngine.on(EVENTS.MATCH_FOUND, async (data) => {
            await this.renderer.animateMatch(data.matches);
            // 播放匹配音效
            this.audioManager?.playMatch();
        });

        this.gameEngine.on(EVENTS.CELL_SWAP, async (data) => {
            await this.renderer.animateSwap(data.from, data.to);
            // 播放交换音效
            this.audioManager?.playSwap();
        });

        // 游戏板更新事件
        this.gameEngine.on(EVENTS.BOARD_UPDATE, () => {
            this.renderer.renderBoard(this.gameBoard);
        });

        // 动画事件
        this.gameEngine.on(EVENTS.ANIMATION_START, () => {
            this.gameState.setAnimating(true);
        });

        this.gameEngine.on(EVENTS.ANIMATION_END, () => {
            this.gameState.setAnimating(false);
        });

        // 设置UI控制按钮事件
        this.setupUIControls();

        // 页面事件
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.gameEngine && this.gameEngine.state === 'playing') {
                    this.gameEngine.pause();
                }
            } else {
                // 页面重新可见时，如果游戏是暂停状态，询问是否继续
                if (this.gameEngine && this.gameEngine.state === 'paused') {
                    // 自动恢复游戏（可以根据需要修改为询问用户）
                    setTimeout(() => {
                        if (this.gameEngine.state === 'paused') {
                            this.gameEngine.resume();
                        }
                    }, 1000);
                }
            }
        });

        // 错误处理
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });

        console.log('Event listeners set up');
    }

    // 初始化游戏引擎
    initializeGameEngine() {
        const components = {
            gameBoard: this.gameBoard,
            gameState: this.gameState,
            renderer: this.renderer,
            inputHandler: this.inputHandler,
            audioManager: this.audioManager,
            matchDetector: this.matchDetector,
            gravitySystem: this.gravitySystem
        };

        this.gameEngine.initialize(components);
        console.log('Game engine initialized');
    }

    // 开始游戏
    startGame() {
        if (!this.isInitialized) {
            console.error('Cannot start game: not initialized');
            return;
        }

        try {
            // 重置游戏状态
            this.gameState.reset();
            
            // 初始化游戏板（使用正确的方法名）
            this.gameBoard.initializeWithGhosts();
            
            // 确保初始状态无匹配
            this.ensureNoInitialMatches();
            
            // 渲染初始游戏板
            this.renderer.renderBoard(this.gameBoard);
            
            // 启动游戏状态计时器
            this.gameState.startGame();
            
            // 启动游戏引擎
            this.gameEngine.start();
            
            // 启动游戏循环更新UI
            this.startUIUpdateLoop();
            
            // 更新UI按钮状态
            this.updateUIButtonStates();
            
            console.log('Game started successfully');
            
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('游戏启动失败，请刷新页面重试。');
        }
    }

    // 确保初始状态无匹配
    ensureNoInitialMatches() {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const matches = this.matchDetector.findMatches(this.gameBoard.grid);
            if (matches.length === 0) {
                console.log('No initial matches found - board is valid');
                break;
            }
            
            console.log(`Found ${matches.length} initial matches, regenerating cells...`);
            
            // 重新生成有匹配的位置
            matches.forEach(match => {
                match.forEach(pos => {
                    // 生成新的小鬼类型，确保不会创建新匹配
                    let newType;
                    let typeAttempts = 0;
                    do {
                        newType = this.gameBoard.generateRandomGhostType();
                        typeAttempts++;
                    } while (
                        this.gameBoard.wouldCreateMatch(pos.x, pos.y, newType) && 
                        typeAttempts < 20
                    );
                    
                    // 如果尝试多次仍会创建匹配，使用安全类型
                    if (typeAttempts >= 20) {
                        newType = this.gameBoard.findSafeGhostType(pos.x, pos.y);
                    }
                    
                    // 创建新小鬼并设置到网格
                    const newGhost = this.gameBoard.createGhost(newType, pos.x, pos.y);
                    this.gameBoard.setCell(pos.x, pos.y, newGhost);
                });
            });
            
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.warn('Could not eliminate all initial matches after', maxAttempts, 'attempts');
        } else if (attempts > 0) {
            console.log(`Successfully eliminated initial matches after ${attempts} attempts`);
        }
    }

    // 更新UI按钮状态
    updateUIButtonStates() {
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const muteBtn = document.getElementById('mute-btn');
        
        if (pauseBtn) {
            pauseBtn.textContent = '暂停';
            pauseBtn.disabled = false;
        }
        
        if (resetBtn) {
            resetBtn.disabled = false;
        }
        
        if (muteBtn) {
            const isMuted = this.audioManager?.isMuted || false;
            muteBtn.textContent = isMuted ? '开启音效' : '静音';
        }
    }

    // 启动UI更新循环
    startUIUpdateLoop() {
        const updateUI = () => {
            if (this.gameState && this.renderer) {
                // 更新游戏时间
                this.gameState.updateTime(Date.now());
                
                // 更新计时器显示
                const timeString = this.gameState.getFormattedTime();
                this.renderer.updateTimer(timeString);
            }
            
            // 继续更新循环
            if (this.isInitialized) {
                requestAnimationFrame(updateUI);
            }
        };
        
        requestAnimationFrame(updateUI);
    }

    // 显示游戏结束界面
    showGameOver(finalScore) {
        const modal = document.getElementById('game-over-modal');
        const finalScoreElement = document.getElementById('final-score');
        
        if (modal && finalScoreElement) {
            finalScoreElement.textContent = finalScore.toLocaleString();
            modal.classList.remove('hidden');
        }
        
        // 播放游戏结束音效
        this.audioManager?.playGameOver();
        
        // 显示游戏结束效果
        this.renderer?.showGameOver();
    }

    // 设置音频初始化（在首次用户交互时）
    setupAudioInitialization() {
        let audioInitialized = false;
        
        const initAudio = async () => {
            if (!audioInitialized && this.audioManager) {
                try {
                    await this.audioManager.preloadSounds();
                    audioInitialized = true;
                    console.log('Audio initialized after user interaction');
                } catch (error) {
                    console.warn('Failed to initialize audio:', error);
                }
            }
        };
        
        // 监听首次点击事件
        const handleFirstClick = async () => {
            await initAudio();
            document.removeEventListener('click', handleFirstClick);
        };
        
        // 监听首次触摸事件
        const handleFirstTouch = async () => {
            await initAudio();
            document.removeEventListener('touchstart', handleFirstTouch);
        };
        
        document.addEventListener('click', handleFirstClick, { once: true });
        document.addEventListener('touchstart', handleFirstTouch, { once: true });
    }

    // 设置UI控制按钮
    setupUIControls() {
        // 注意：暂停、重置、静音、重新开始按钮的事件监听器
        // 已经在 InputHandler 中设置，这里不需要重复设置
        // InputHandler 会通过 gameEngine.handleInput() 正确处理这些事件
        
        console.log('UI controls are managed by InputHandler');
    }

    // 处理全局错误
    handleGlobalError(error) {
        console.error('Game error:', error);
        
        // 根据错误类型采取不同的处理策略
        if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
            this.showError('游戏组件初始化错误，正在尝试重新加载...');
            // 尝试重新初始化
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else if (error.name === 'ReferenceError') {
            this.showError('游戏资源加载失败，请检查网络连接。');
        } else {
            this.showError('游戏发生未知错误，请刷新页面重试。');
        }
    }

    // 显示错误信息
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2rem;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // 重置游戏
    reset() {
        try {
            console.log('Resetting game...');
            
            // 停止当前游戏
            if (this.gameEngine) {
                this.gameEngine.reset();
            }
            
            // 重置游戏状态
            if (this.gameState) {
                this.gameState.reset();
            }
            
            // 重置游戏板
            if (this.gameBoard) {
                this.gameBoard.reset();
            }
            
            // 重置渲染器
            if (this.renderer) {
                this.renderer.reset();
            }
            
            // 重置输入处理器
            if (this.inputHandler) {
                this.inputHandler.reset();
            }
            
            // 重置算法组件
            if (this.matchDetector) {
                this.matchDetector.reset();
            }
            
            if (this.gravitySystem) {
                this.gravitySystem.reset();
            }
            
            // 隐藏游戏结束模态框
            const modal = document.getElementById('game-over-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // 更新UI状态
            this.updateUIButtonStates();
            
            console.log('Game reset successfully');
            
        } catch (error) {
            console.error('Failed to reset game:', error);
            this.showError('游戏重置失败，请刷新页面。');
        }
    }

    // 暂停游戏
    pause() {
        if (this.gameEngine && this.gameEngine.state === 'playing') {
            this.gameEngine.pause();
            this.gameState.pauseGame();
            
            // 显示暂停状态
            this.renderer?.showPauseOverlay();
            
            // 暂停音效
            this.audioManager?.pauseAll();
            
            console.log('Game paused');
        }
    }

    // 恢复游戏
    resume() {
        if (this.gameEngine && this.gameEngine.state === 'paused') {
            this.gameEngine.resume();
            this.gameState.resumeGame();
            
            // 隐藏暂停状态
            this.renderer?.hidePauseOverlay();
            
            // 恢复音效
            this.audioManager?.resumeAll();
            
            console.log('Game resumed');
        }
    }

    // 获取游戏统计信息
    getStats() {
        return {
            isInitialized: this.isInitialized,
            gameState: this.gameState?.getStats() || null,
            gameBoard: this.gameBoard?.getStats() || null,
            audio: this.audioManager?.getStatus() || null,
            matchDetector: this.matchDetector?.getDetectionStats() || null,
            gravitySystem: this.gravitySystem?.getStats() || null,
            performance: this.getPerformanceStats()
        };
    }

    // 获取性能统计信息
    getPerformanceStats() {
        const memoryInfo = performance.memory ? {
            usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null;

        return {
            memory: memoryInfo,
            timing: performance.timing ? {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null
        };
    }

    // 检查游戏健康状态
    checkGameHealth() {
        const stats = this.getStats();
        const issues = [];

        // 检查内存使用
        if (stats.performance.memory && stats.performance.memory.usedJSHeapSize > 100) {
            issues.push('High memory usage detected');
        }

        // 检查组件状态
        if (!this.isInitialized) {
            issues.push('Game not properly initialized');
        }

        if (this.gameEngine && this.gameEngine.state === 'error') {
            issues.push('Game engine in error state');
        }

        return {
            healthy: issues.length === 0,
            issues: issues,
            stats: stats
        };
    }

    // 清理资源
    cleanup() {
        console.log('Cleaning up game resources...');
        
        try {
            this.isInitialized = false;
            
            // 停止游戏循环
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            
            // 清理组件
            if (this.gameEngine) {
                this.gameEngine.destroy();
                this.gameEngine = null;
            }
            
            if (this.gameState) {
                this.gameState.destroy();
                this.gameState = null;
            }
            
            if (this.renderer) {
                this.renderer.destroy();
                this.renderer = null;
            }
            
            if (this.inputHandler) {
                this.inputHandler.destroy();
                this.inputHandler = null;
            }
            
            if (this.audioManager) {
                this.audioManager.destroy();
                this.audioManager = null;
            }
            
            if (this.matchDetector) {
                this.matchDetector.reset();
                this.matchDetector = null;
            }
            
            if (this.gravitySystem) {
                this.gravitySystem.reset();
                this.gravitySystem = null;
            }
            
            if (this.gameBoard) {
                this.gameBoard.destroy();
                this.gameBoard = null;
            }
            
            // 清理DOM事件监听器
            this.removeEventListeners();
            
            console.log('Game resources cleaned up successfully');
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // 移除事件监听器
    removeEventListeners() {
        // 移除全局事件监听器
        window.removeEventListener('beforeunload', this.cleanup);
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleGlobalError);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 移除按钮事件监听器
        const buttons = ['pause-btn', 'reset-btn', 'mute-btn', 'restart-btn'];
        buttons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.replaceWith(button.cloneNode(true)); // 移除所有事件监听器
            }
        });
    }
}

// 全局游戏实例
let gameInstance = null;

// DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('=== DOM loaded, initializing game ===');
        console.log('Creating GhostMatchGame instance...');
        
        gameInstance = new GhostMatchGame();
        console.log('GhostMatchGame instance created:', gameInstance);
        
        console.log('Calling initialize()...');
        await gameInstance.initialize();
        
        console.log('Game initialized successfully!');
        
        // 将游戏实例暴露到全局作用域（用于调试）
        window.ghostMatchGame = gameInstance;
        console.log('Game instance exposed to window.ghostMatchGame');
        
        // 验证游戏实例
        if (window.ghostMatchGame) {
            console.log('✓ Game instance is accessible globally');
            console.log('Game state:', {
                isInitialized: gameInstance.isInitialized,
                hasGameBoard: !!gameInstance.gameBoard,
                hasGameEngine: !!gameInstance.gameEngine,
                hasRenderer: !!gameInstance.renderer
            });
        }
        
    } catch (error) {
        console.error('❌ Failed to start game:', error);
        console.error('Error stack:', error.stack);
        
        // 显示错误给用户
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            max-width: 500px;
        `;
        errorDiv.innerHTML = `
            <h3>游戏初始化失败</h3>
            <p>${error.message}</p>
            <p style="font-size: 12px; margin-top: 10px;">请打开浏览器控制台查看详细错误信息</p>
        `;
        document.body.appendChild(errorDiv);
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (gameInstance) {
        gameInstance.cleanup();
    }
});

// 导出游戏类（用于测试）
export { GhostMatchGame };