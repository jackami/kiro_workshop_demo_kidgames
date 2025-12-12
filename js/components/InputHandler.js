// 输入处理器 - 点击/触摸事件、选择、交换验证

import { GAME_CONFIG } from '../constants.js';

export class InputHandler {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameBoard = null;
        this.renderer = null;
        this.isEnabled = true;
        this.touchStartTime = 0;
        this.touchStartPosition = null;
        this.lastTouchTime = 0;
        
        // 性能监控
        this.performanceStats = {
            touchEvents: 0,
            clickEvents: 0,
            gestureEvents: 0,
            averageResponseTime: 0,
            memoryUsage: 0
        };
        
        // 防抖和节流函数
        this.debouncedCellClick = this.debounce(this.handleCellClick.bind(this), 50);
        this.throttledTouchMove = this.throttle(this.handleTouchMove.bind(this), 16); // 60fps
        
        this.setupEventListeners();
        this.startPerformanceMonitoring();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 游戏板点击事件 - 使用防抖优化
        document.addEventListener('cellClick', (event) => {
            this.debouncedCellClick(event.detail);
        });

        // 控制按钮事件
        this.setupControlButtons();
        
        // 键盘事件
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });

        // 触摸事件优化 - 使用被动监听器提升性能
        document.addEventListener('touchstart', (event) => {
            this.handleTouchStart(event);
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            this.throttledTouchMove(event);
        }, { passive: true });

        document.addEventListener('touchend', (event) => {
            this.handleTouchEnd(event);
        }, { passive: true });

        // 防止双击缩放和长按菜单
        document.addEventListener('dblclick', (event) => {
            event.preventDefault();
        });

        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        // 防止页面滚动
        document.addEventListener('touchmove', (event) => {
            if (event.target.closest('.game-board')) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    // 设置控制按钮事件
    setupControlButtons() {
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const muteBtn = document.getElementById('mute-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.handlePauseClick();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.handleResetClick();
            });
        }

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.handleMuteClick();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.handleRestartClick();
            });
        }
    }

    // 设置组件引用
    setComponents(gameBoard, renderer) {
        this.gameBoard = gameBoard;
        this.renderer = renderer;
    }

    // 处理单元格点击
    handleCellClick(detail) {
        const startTime = performance.now();
        
        console.log('InputHandler: Received cellClick event', detail);
        
        if (!this.isEnabled) {
            console.log('InputHandler: Input is disabled');
            return;
        }
        
        if (!this.gameEngine) {
            console.log('InputHandler: GameEngine not available');
            return;
        }

        const { x, y } = detail;
        
        // 验证位置有效性
        if (!this.isValidPosition(x, y)) {
            console.log(`InputHandler: Invalid position (${x}, ${y})`);
            return;
        }

        console.log(`InputHandler: Processing click at (${x}, ${y})`);

        // 添加视觉反馈
        this.addClickFeedback(detail.element);

        // 发送输入到游戏引擎
        this.gameEngine.handleInput({
            type: 'cellClick',
            position: { x, y }
        });

        // 更新性能统计
        this.performanceStats.clickEvents++;
        this.updateResponseTime(startTime);
    }

    // 处理触摸开始
    handleTouchStart(event) {
        this.touchStartTime = performance.now();
        this.performanceStats.touchEvents++;
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartPosition = {
                x: touch.clientX,
                y: touch.clientY
            };
        }
    }

    // 处理触摸移动 - 节流优化
    handleTouchMove(event) {
        // 防止页面滚动，但允许游戏内交互
        if (event.target.closest('.game-board')) {
            event.preventDefault();
        }
    }

    // 处理触摸结束
    handleTouchEnd(event) {
        const touchEndTime = performance.now();
        const touchDuration = touchEndTime - this.touchStartTime;
        
        // 防止快速连续触摸 - 优化为更短的间隔
        if (touchEndTime - this.lastTouchTime < 50) {
            return;
        }
        
        this.lastTouchTime = touchEndTime;

        // 只处理短触摸（点击）- 优化触摸响应时间
        if (touchDuration < 300 && touchDuration > 10) {
            // 触摸事件会自动转换为点击事件，这里不需要额外处理
            // 但我们可以添加触摸反馈
            this.addTouchFeedback(event);
        }

        // 更新响应时间统计
        this.updateResponseTime(this.touchStartTime);
    }

    // 处理键盘输入
    handleKeyboard(event) {
        if (!this.isEnabled) return;

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.gameEngine.handleInput({ type: 'pause' });
                break;
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.gameEngine.handleInput({ type: 'reset' });
                }
                break;
            case ' ':
                event.preventDefault();
                this.gameEngine.handleInput({ type: 'pause' });
                break;
        }
    }

    // 处理暂停按钮点击
    handlePauseClick() {
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.gameEngine.state === 'playing') {
            this.gameEngine.handleInput({ type: 'pause' });
            if (pauseBtn) pauseBtn.textContent = '继续';
        } else if (this.gameEngine.state === 'paused') {
            this.gameEngine.handleInput({ type: 'resume' });
            if (pauseBtn) pauseBtn.textContent = '暂停';
        }
        
        this.addButtonFeedback(pauseBtn);
    }

    // 处理重置按钮点击
    handleResetClick() {
        console.log('InputHandler: Reset button clicked');
        const resetBtn = document.getElementById('reset-btn');
        
        if (confirm('确定要重新开始游戏吗？')) {
            console.log('InputHandler: User confirmed reset');
            this.gameEngine.handleInput({ type: 'reset' });
        } else {
            console.log('InputHandler: User cancelled reset');
        }
        
        this.addButtonFeedback(resetBtn);
    }

    // 处理静音按钮点击
    handleMuteClick() {
        const muteBtn = document.getElementById('mute-btn');
        
        // 切换音效状态
        if (this.gameEngine.audioManager) {
            const isMuted = this.gameEngine.audioManager.toggleMute();
            if (muteBtn) {
                muteBtn.textContent = isMuted ? '开启音效' : '静音';
            }
        }
        
        this.addButtonFeedback(muteBtn);
    }

    // 处理重新开始按钮点击
    handleRestartClick() {
        console.log('InputHandler: Restart button clicked');
        const modal = document.getElementById('game-over-modal');
        const pauseBtn = document.getElementById('pause-btn');
        
        // 重置游戏
        this.gameEngine.handleInput({ type: 'reset' });
        
        // 隐藏游戏结束模态框
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // 重置暂停按钮文本
        if (pauseBtn) {
            pauseBtn.textContent = '暂停';
        }
        
        console.log('InputHandler: Restart complete');
    }

    // 验证移动是否有效
    validateMove(from, to) {
        // 检查位置有效性
        if (!this.isValidPosition(from.x, from.y) || 
            !this.isValidPosition(to.x, to.y)) {
            return false;
        }

        // 检查是否相邻
        if (!this.isAdjacent(from, to)) {
            return false;
        }

        // 检查是否有小鬼
        const ghost1 = this.gameBoard?.getCell(from.x, from.y);
        const ghost2 = this.gameBoard?.getCell(to.x, to.y);
        
        if (!ghost1 || !ghost2) {
            return false;
        }

        return true;
    }

    // 检查位置是否有效
    isValidPosition(x, y) {
        return x >= 0 && x < GAME_CONFIG.BOARD_SIZE && 
               y >= 0 && y < GAME_CONFIG.BOARD_SIZE;
    }

    // 检查两个位置是否相邻
    isAdjacent(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    // 添加点击反馈效果
    addClickFeedback(element) {
        if (!element) return;
        
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 100);
    }

    // 添加按钮反馈效果
    addButtonFeedback(button) {
        if (!button) return;
        
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }

    // 启用输入处理
    enable() {
        this.isEnabled = true;
    }

    // 禁用输入处理
    disable() {
        this.isEnabled = false;
    }

    // 获取触摸位置对应的单元格
    getTouchCell(touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const cell = element?.closest('.game-cell');
        
        if (cell) {
            return {
                x: parseInt(cell.dataset.x),
                y: parseInt(cell.dataset.y)
            };
        }
        
        return null;
    }

    // 处理手势识别
    recognizeGesture(startPos, endPos) {
        if (!startPos || !endPos) return null;
        
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 最小手势距离
        if (distance < 30) return null;
        
        // 判断方向
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    // 防抖处理
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流处理
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 获取输入统计信息
    getInputStats() {
        return {
            isEnabled: this.isEnabled,
            lastTouchTime: this.lastTouchTime,
            touchStartTime: this.touchStartTime
        };
    }

    // 重置输入状态
    reset() {
        this.isEnabled = true;
        this.touchStartTime = 0;
        this.touchStartPosition = null;
        this.lastTouchTime = 0;
        
        // 重置按钮状态
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.textContent = '暂停';
    }

    // 启动性能监控
    startPerformanceMonitoring() {
        // 每5秒更新一次性能统计
        this.performanceInterval = setInterval(() => {
            this.updateMemoryUsage();
            this.logPerformanceStats();
        }, 5000);
    }

    // 更新响应时间统计
    updateResponseTime(startTime) {
        const responseTime = performance.now() - startTime;
        const totalEvents = this.performanceStats.clickEvents + this.performanceStats.touchEvents;
        
        if (totalEvents > 0) {
            this.performanceStats.averageResponseTime = 
                (this.performanceStats.averageResponseTime * (totalEvents - 1) + responseTime) / totalEvents;
        }
    }

    // 更新内存使用统计
    updateMemoryUsage() {
        if (performance.memory) {
            this.performanceStats.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
    }

    // 记录性能统计
    logPerformanceStats() {
        if (GAME_CONFIG.DEBUG_MODE) {
            console.log('Input Performance Stats:', {
                touchEvents: this.performanceStats.touchEvents,
                clickEvents: this.performanceStats.clickEvents,
                averageResponseTime: Math.round(this.performanceStats.averageResponseTime * 100) / 100 + 'ms',
                memoryUsage: this.performanceStats.memoryUsage
            });
        }
    }

    // 添加触摸反馈
    addTouchFeedback(event) {
        if (event.target.closest('.game-cell')) {
            // 添加触觉反馈（如果支持）
            if (navigator.vibrate) {
                navigator.vibrate(10); // 10ms 轻微震动
            }
            
            // 添加视觉反馈
            const cell = event.target.closest('.game-cell');
            if (cell) {
                cell.classList.add('touch-feedback');
                setTimeout(() => {
                    cell.classList.remove('touch-feedback');
                }, 100);
            }
        }
    }

    // 优化的防抖函数
    debounce(func, wait) {
        let timeout;
        let lastCallTime = 0;
        
        return function executedFunction(...args) {
            const now = performance.now();
            
            // 如果距离上次调用时间太短，直接忽略
            if (now - lastCallTime < wait / 2) {
                return;
            }
            
            const later = () => {
                clearTimeout(timeout);
                lastCallTime = performance.now();
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 优化的节流函数
    throttle(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                lastRan = performance.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((performance.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = performance.now();
                    }
                }, limit - (performance.now() - lastRan));
            }
        };
    }

    // 获取性能统计
    getPerformanceStats() {
        return { ...this.performanceStats };
    }

    // 重置性能统计
    resetPerformanceStats() {
        this.performanceStats = {
            touchEvents: 0,
            clickEvents: 0,
            gestureEvents: 0,
            averageResponseTime: 0,
            memoryUsage: 0
        };
    }

    // 清理资源
    destroy() {
        this.disable();
        
        // 清理性能监控
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
        
        this.gameEngine = null;
        this.gameBoard = null;
        this.renderer = null;
        
        // 移除事件监听器
        document.removeEventListener('cellClick', this.debouncedCellClick);
        document.removeEventListener('keydown', this.handleKeyboard);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.throttledTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}