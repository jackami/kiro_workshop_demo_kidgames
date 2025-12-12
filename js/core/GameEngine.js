// 游戏引擎 - 状态机、游戏循环、会话管理

import { GAME_STATES, EVENTS } from '../constants.js';

export class GameEngine {
    constructor() {
        this.state = GAME_STATES.INITIALIZING;
        this.gameBoard = null;
        this.gameState = null;
        this.renderer = null;
        this.inputHandler = null;
        this.audioManager = null;
        this.matchDetector = null;
        this.gravitySystem = null;
        
        this.eventListeners = new Map();
        this.gameLoop = null;
        this.startTime = null;
        this.pausedTime = 0;
        
        // 性能监控
        this.performanceMonitor = {
            frameCount: 0,
            lastFrameTime: 0,
            fps: 0,
            memoryWarningThreshold: 50 // MB
        };
    }

    // 初始化游戏引擎
    initialize(components) {
        this.gameBoard = components.gameBoard;
        this.gameState = components.gameState;
        this.renderer = components.renderer;
        this.inputHandler = components.inputHandler;
        this.audioManager = components.audioManager;
        this.matchDetector = components.matchDetector;
        this.gravitySystem = components.gravitySystem;

        this.setupEventListeners();
        this.state = GAME_STATES.PLAYING;
        this.emit(EVENTS.GAME_START);
    }

    // 开始游戏
    start() {
        if (this.state !== GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PLAYING;
            this.startTime = Date.now();
            this.startGameLoop();
            this.emit(EVENTS.GAME_START);
        }
    }

    // 暂停游戏
    pause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            this.pausedTime = Date.now();
            this.stopGameLoop();
            
            // 暂停游戏状态
            if (this.gameState) {
                this.gameState.pauseGame();
            }
            
            // 暂停音效
            if (this.audioManager) {
                this.audioManager.pauseAll();
            }
            
            // 显示暂停覆盖层
            if (this.renderer) {
                this.renderer.showPauseOverlay();
            }
            
            this.emit(EVENTS.GAME_PAUSE);
            console.log('Game paused');
        }
    }

    // 恢复游戏
    resume() {
        if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            if (this.pausedTime) {
                this.startTime += Date.now() - this.pausedTime;
                this.pausedTime = 0;
            }
            this.startGameLoop();
            
            // 恢复游戏状态
            if (this.gameState) {
                this.gameState.resumeGame();
            }
            
            // 恢复音效
            if (this.audioManager) {
                this.audioManager.resumeAll();
            }
            
            // 隐藏暂停覆盖层
            if (this.renderer) {
                this.renderer.hidePauseOverlay();
            }
            
            this.emit(EVENTS.GAME_RESUME);
            console.log('Game resumed');
        }
    }

    // 重置游戏
    reset() {
        console.log('GameEngine: Resetting game');
        
        // 如果游戏处于暂停状态，先清除暂停状态
        if (this.state === GAME_STATES.PAUSED) {
            console.log('GameEngine: Clearing paused state before reset');
            // 隐藏暂停覆盖层
            if (this.renderer) {
                this.renderer.hidePauseOverlay();
            }
            // 恢复音效
            if (this.audioManager) {
                this.audioManager.resumeAll();
            }
            
            // 重置暂停按钮文本
            const pauseBtn = document.getElementById('pause-btn');
            if (pauseBtn) {
                pauseBtn.textContent = '暂停';
            }
        }
        
        this.stopGameLoop();
        this.state = GAME_STATES.INITIALIZING;
        this.startTime = null;
        this.pausedTime = 0;
        
        if (this.gameBoard) {
            this.gameBoard.initializeWithGhosts();
            
            // 确保初始状态无匹配
            this.ensureNoInitialMatches();
        }
        if (this.gameState) {
            this.gameState.reset();
            // 重新启动游戏状态计时器
            this.gameState.startGame();
        }
        
        // 通知渲染器更新游戏板显示
        if (this.renderer) {
            this.renderer.renderBoard(this.gameBoard);
        }
        
        this.state = GAME_STATES.PLAYING;
        this.start();
        console.log('GameEngine: Game reset complete');
    }
    
    // 确保初始状态无匹配
    ensureNoInitialMatches() {
        if (!this.gameBoard || !this.matchDetector) {
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const matches = this.matchDetector.findMatches(this.gameBoard.grid);
            if (matches.length === 0) {
                console.log('GameEngine: No initial matches found - board is valid');
                break;
            }
            
            console.log(`GameEngine: Found ${matches.length} initial matches, regenerating cells...`);
            
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
            console.warn('GameEngine: Could not eliminate all initial matches after', maxAttempts, 'attempts');
        } else if (attempts > 0) {
            console.log(`GameEngine: Successfully eliminated initial matches after ${attempts} attempts`);
        }
    }

    // 结束游戏
    end() {
        this.stopGameLoop();
        this.state = GAME_STATES.ENDED;
        this.emit(EVENTS.GAME_END, {
            finalScore: this.gameState?.score || 0,
            playTime: this.getPlayTime()
        });
    }

    // 游戏循环
    update() {
        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        // 性能监控
        this.updatePerformanceStats();

        // 检查游戏结束条件
        if (this.shouldEndGame()) {
            this.end();
            return;
        }

        // 处理连锁反应
        this.processChainReactions();
    }

    // 处理用户输入
    handleInput(input) {
        console.log('GameEngine: handleInput called', { type: input.type, state: this.state });
        
        // 检查引擎是否已初始化
        if (!this.gameBoard || !this.gameState) {
            console.error('GameEngine: Not properly initialized', {
                hasGameBoard: !!this.gameBoard,
                hasGameState: !!this.gameState
            });
            return false;
        }
        
        // 控制命令（pause, resume, reset）可以在任何状态下执行
        switch (input.type) {
            case 'pause':
                console.log('GameEngine: Processing pause');
                this.pause();
                return true;
            case 'resume':
                console.log('GameEngine: Processing resume');
                this.resume();
                return true;
            case 'reset':
                console.log('GameEngine: Processing reset');
                this.reset();
                return true;
        }
        
        // 游戏操作（cellClick）只能在PLAYING状态下执行
        if (this.state !== GAME_STATES.PLAYING) {
            console.log('GameEngine: Input rejected - not playing', this.state);
            return false;
        }
        
        // 如果正在动画中，拒绝游戏操作
        if (this.state === GAME_STATES.ANIMATING) {
            console.log('GameEngine: Input rejected - animating');
            return false;
        }

        switch (input.type) {
            case 'cellClick':
                console.log('GameEngine: Processing cellClick');
                return this.handleCellClick(input.position);
            default:
                return false;
        }
    }

    // 处理单元格点击
    handleCellClick(position) {
        if (!this.gameState) {
            console.error('GameEngine: gameState is not initialized');
            return false;
        }
        
        const currentSelection = this.gameState.selectedCell;
        
        console.log('GameEngine: handleCellClick', { position, currentSelection });
        
        if (!currentSelection) {
            // 选择第一个单元格
            console.log('GameEngine: Selecting first cell', position);
            this.gameState.selectCell(position);
            this.emit(EVENTS.CELL_SELECT, { position });
            return true;
        }

        if (this.isSamePosition(currentSelection, position)) {
            // 取消选择
            console.log('GameEngine: Deselecting cell');
            this.gameState.clearSelection();
            return true;
        }

        if (this.isAdjacent(currentSelection, position)) {
            // 执行交换
            console.log('GameEngine: Performing swap', { from: currentSelection, to: position });
            return this.performSwap(currentSelection, position);
        } else {
            // 选择新的单元格
            console.log('GameEngine: Selecting new cell', position);
            this.gameState.selectCell(position);
            this.emit(EVENTS.CELL_SELECT, { position });
            return true;
        }
    }

    // 执行交换操作
    async performSwap(pos1, pos2) {
        this.state = GAME_STATES.ANIMATING;
        this.gameState.clearSelection();

        try {
            // 执行交换
            this.gameBoard.swapCells(pos1, pos2);
            this.emit(EVENTS.CELL_SWAP, { from: pos1, to: pos2 });

            // 检查是否形成匹配
            const matches = this.matchDetector.findMatches(this.gameBoard.grid);
            
            if (matches.length === 0) {
                // 无匹配，回滚交换
                await this.delay(400); // 等待交换动画完成
                this.gameBoard.swapCells(pos2, pos1);
                this.audioManager?.playSound('invalid');
            } else {
                // 有匹配，处理消除
                await this.processMatches(matches);
            }
        } finally {
            this.state = GAME_STATES.PLAYING;
        }

        return true;
    }

    // 处理匹配消除
    async processMatches(matches) {
        if (matches.length === 0) return;

        // 播放匹配音效
        this.audioManager?.playSound('match');

        // 计算分数
        const score = this.calculateMatchScore(matches);
        this.gameState.addScore(score);
        this.gameState.incrementCombo();

        // 标记消除动画
        this.emit(EVENTS.MATCH_FOUND, { matches, score });

        // 等待消除动画完成
        await this.delay(600);

        // 移除匹配的图标
        this.gameBoard.removeMatches(matches);

        // 应用重力
        await this.applyGravity();

        // 填充空位
        const newGhosts = this.gameBoard.fillEmpty();
        if (newGhosts.length > 0) {
            this.emit(EVENTS.BOARD_UPDATE, { newGhosts });
        }

        // 检查新的匹配（连锁反应）
        const newMatches = this.matchDetector.findMatches(this.gameBoard.grid);
        if (newMatches.length > 0) {
            this.audioManager?.playSound('combo');
            await this.processMatches(newMatches);
        } else {
            this.gameState.resetCombo();
        }
    }

    // 应用重力系统
    async applyGravity() {
        const movements = this.gravitySystem.applyGravity(this.gameBoard.grid);
        if (movements.length > 0) {
            this.emit(EVENTS.ANIMATION_START, { type: 'gravity', movements });
            await this.delay(500); // 等待下落动画
        }
    }

    // 处理连锁反应
    async processChainReactions() {
        if (this.state !== GAME_STATES.PLAYING || this.state === GAME_STATES.ANIMATING) {
            return false;
        }

        // 检查是否有新的匹配形成
        const matches = this.matchDetector.findMatches(this.gameBoard.grid);
        
        if (matches.length > 0) {
            // 发现连锁反应，处理匹配
            this.state = GAME_STATES.ANIMATING;
            await this.processMatches(matches);
            this.state = GAME_STATES.PLAYING;
            
            // 递归检查是否还有更多连锁反应
            return await this.processChainReactions();
        }
        
        return false;
    }

    // 计算匹配分数
    calculateMatchScore(matches) {
        let totalScore = 0;
        const comboMultiplier = this.gameState.combo;

        matches.forEach(match => {
            const baseScore = match.length * 10;
            const comboBonus = comboMultiplier * 5;
            totalScore += baseScore + comboBonus;
        });

        return totalScore;
    }

    // 检查游戏是否应该结束
    shouldEndGame() {
        // 检查游戏状态是否允许结束检测
        if (this.state === GAME_STATES.ENDED || this.state === GAME_STATES.ANIMATING) {
            return false;
        }
        
        // 检查是否还有可能的移动
        return !this.hasValidMoves();
    }

    // 检查是否有有效移动
    hasValidMoves() {
        if (!this.gameBoard || !this.gameBoard.grid) {
            return false;
        }
        
        const grid = this.gameBoard.grid;
        
        // 检查网格是否完整
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] === null) {
                    return true; // 如果有空位，游戏可以继续
                }
            }
        }
        
        // 检查所有可能的相邻交换
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                // 检查每个位置的相邻交换是否能形成匹配
                const adjacentPositions = this.getAdjacentPositions(x, y);
                
                for (const adjPos of adjacentPositions) {
                    if (this.wouldCreateMatch(x, y, adjPos.x, adjPos.y)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    // 获取所有可能的有效移动
    getAllValidMoves() {
        const validMoves = [];
        
        if (!this.gameBoard || !this.gameBoard.grid) {
            return validMoves;
        }
        
        const grid = this.gameBoard.grid;
        
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const adjacentPositions = this.getAdjacentPositions(x, y);
                
                for (const adjPos of adjacentPositions) {
                    if (this.wouldCreateMatch(x, y, adjPos.x, adjPos.y)) {
                        validMoves.push({
                            from: { x, y },
                            to: { x: adjPos.x, y: adjPos.y }
                        });
                    }
                }
            }
        }
        
        return validMoves;
    }

    // 检查游戏结束条件的详细信息
    getGameEndInfo() {
        const hasValidMoves = this.hasValidMoves();
        const validMoves = hasValidMoves ? this.getAllValidMoves() : [];
        
        return {
            shouldEnd: !hasValidMoves,
            hasValidMoves: hasValidMoves,
            validMovesCount: validMoves.length,
            validMoves: validMoves,
            gameState: this.state,
            score: this.gameState?.score || 0,
            moves: this.gameState?.moves || 0,
            playTime: this.getPlayTime()
        };
    }

    // 检查交换是否会创建匹配
    wouldCreateMatch(x1, y1, x2, y2) {
        // 临时交换
        const grid = this.gameBoard.grid;
        const temp = grid[y1][x1];
        grid[y1][x1] = grid[y2][x2];
        grid[y2][x2] = temp;

        // 检查是否有匹配
        const matches = this.matchDetector.findMatches(grid);
        const hasMatch = matches.length > 0;

        // 恢复交换
        grid[y2][x2] = grid[y1][x1];
        grid[y1][x1] = temp;

        return hasMatch;
    }

    // 获取相邻位置
    getAdjacentPositions(x, y) {
        const positions = [];
        const offsets = [
            { x: 0, y: -1 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: -1, y: 0 }
        ];

        offsets.forEach(offset => {
            const newX = x + offset.x;
            const newY = y + offset.y;
            
            if (this.gameBoard.isValidPosition(newX, newY)) {
                positions.push({ x: newX, y: newY });
            }
        });

        return positions;
    }

    // 检查两个位置是否相邻
    isAdjacent(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    // 检查两个位置是否相同
    isSamePosition(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }

    // 获取游戏时间
    getPlayTime() {
        if (!this.startTime) return 0;
        
        const currentTime = this.state === GAME_STATES.PAUSED ? 
            this.pausedTime : Date.now();
        
        return Math.floor((currentTime - this.startTime) / 1000);
    }

    // 开始游戏循环
    startGameLoop() {
        if (this.gameLoop) return;
        
        this.gameLoop = setInterval(() => {
            this.update();
        }, 16); // ~60 FPS
    }

    // 停止游戏循环
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 这里会设置各种游戏事件的监听器
        // 具体实现会在后续任务中完成
    }

    // 事件系统
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    // 延迟工具函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 更新性能统计
    updatePerformanceStats() {
        const now = performance.now();
        this.performanceMonitor.frameCount++;
        
        // 计算FPS（每秒更新一次）
        if (now - this.performanceMonitor.lastFrameTime >= 1000) {
            this.performanceMonitor.fps = Math.round(
                this.performanceMonitor.frameCount * 1000 / (now - this.performanceMonitor.lastFrameTime)
            );
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastFrameTime = now;
            
            // 检查内存使用情况
            this.checkMemoryUsage();
        }
    }

    // 检查内存使用情况
    checkMemoryUsage() {
        if (performance.memory) {
            const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            
            // 如果内存使用超过阈值，触发垃圾回收建议
            if (memoryUsage > this.performanceMonitor.memoryWarningThreshold) {
                console.warn(`内存使用较高: ${memoryUsage}MB`);
                
                // 建议进行内存清理
                this.suggestMemoryCleanup();
            }
        }
    }

    // 建议内存清理
    suggestMemoryCleanup() {
        // 清理可能的内存泄漏
        if (this.renderer) {
            this.renderer.cleanupAnimations();
        }
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
    }

    // 获取性能统计
    getPerformanceStats() {
        const inputStats = this.inputHandler ? this.inputHandler.getPerformanceStats() : {};
        
        return {
            fps: this.performanceMonitor.fps,
            frameCount: this.performanceMonitor.frameCount,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            } : null,
            inputStats
        };
    }

    // 清理资源
    destroy() {
        this.stopGameLoop();
        this.eventListeners.clear();
        this.state = GAME_STATES.ENDED;
        
        // 清理性能监控
        this.performanceMonitor = null;
    }
}