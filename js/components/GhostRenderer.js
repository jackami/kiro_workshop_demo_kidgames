// 小鬼渲染器 - DOM渲染、视觉反馈、动画

import { CSS_CLASSES, GAME_CONFIG } from '../constants.js';

export class GhostRenderer {
    constructor(container) {
        this.container = container;
        this.gameBoard = null;
        this.cellElements = [];
        this.scoreElement = null;
        this.comboElement = null;
        this.timerElement = null;
        
        this.initializeElements();
    }

    // 初始化DOM元素
    initializeElements() {
        // 获取UI元素引用
        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.timerElement = document.getElementById('timer');
        
        // 创建游戏板网格
        this.createGameGrid();
    }

    // 创建8x8游戏网格
    createGameGrid() {
        // 清空容器
        this.container.innerHTML = '';
        this.cellElements = [];

        // 创建网格单元格
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            this.cellElements[y] = [];
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const cell = this.createCellElement(x, y);
                this.container.appendChild(cell);
                this.cellElements[y][x] = cell;
            }
        }
    }

    // 创建单个单元格元素
    createCellElement(x, y) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        
        // 添加点击事件监听器
        cell.addEventListener('click', (event) => {
            this.handleCellClick(event, x, y);
        });

        // 添加触摸事件支持
        cell.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.handleCellClick(event, x, y);
        });

        return cell;
    }

    // 处理单元格点击
    handleCellClick(event, x, y) {
        event.preventDefault();
        
        console.log(`GhostRenderer: Cell clicked at (${x}, ${y})`);
        
        // 触发自定义事件 - 在document上触发以便InputHandler能够监听到
        const clickEvent = new CustomEvent('cellClick', {
            detail: { x, y, element: event.target },
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(clickEvent);
        console.log('GhostRenderer: cellClick event dispatched');
    }

    // 设置游戏板引用
    setGameBoard(board) {
        this.gameBoard = board;
    }

    // 设置动画持续时间
    setAnimationDurations(durations) {
        this.animationDurations = durations || GAME_CONFIG.ANIMATION_DURATION;
        console.log('Animation durations set:', this.animationDurations);
    }

    // 渲染游戏板
    renderBoard(board) {
        this.gameBoard = board;
        
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const ghost = board.getCell(x, y);
                this.renderCell(x, y, ghost);
            }
        }
    }

    // 渲染单个单元格
    renderCell(x, y, ghost) {
        const cellElement = this.cellElements[y][x];
        if (!cellElement) return;

        // 清空单元格内容
        cellElement.innerHTML = '';
        
        if (ghost) {
            const ghostElement = this.createGhostElement(ghost);
            cellElement.appendChild(ghostElement);
        }
    }

    // 创建小鬼元素
    createGhostElement(ghost) {
        const ghostElement = document.createElement('div');
        ghostElement.className = `ghost-icon type-${ghost.type}`;
        ghostElement.dataset.type = ghost.type;
        ghostElement.dataset.x = ghost.x;
        ghostElement.dataset.y = ghost.y;
        
        return ghostElement;
    }

    // 高亮选中的单元格
    highlightCell(x, y, highlight = true) {
        const cellElement = this.cellElements[y]?.[x];
        if (!cellElement) return;

        if (highlight) {
            cellElement.classList.add(CSS_CLASSES.SELECTED);
        } else {
            cellElement.classList.remove(CSS_CLASSES.SELECTED);
        }
    }

    // 清除所有高亮
    clearAllHighlights() {
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                this.highlightCell(x, y, false);
            }
        }
    }

    // 交换动画
    animateSwap(pos1, pos2, duration = GAME_CONFIG.ANIMATION_DURATION.SWAP) {
        return new Promise((resolve) => {
            const cell1 = this.cellElements[pos1.y][pos1.x];
            const cell2 = this.cellElements[pos2.y][pos2.x];
            
            if (!cell1 || !cell2) {
                resolve();
                return;
            }

            const ghost1 = cell1.querySelector('.ghost-icon');
            const ghost2 = cell2.querySelector('.ghost-icon');
            
            if (!ghost1 || !ghost2) {
                resolve();
                return;
            }

            // 计算移动距离
            const rect1 = cell1.getBoundingClientRect();
            const rect2 = cell2.getBoundingClientRect();
            const deltaX = rect2.left - rect1.left;
            const deltaY = rect2.top - rect1.top;

            // 添加交换动画类
            ghost1.classList.add(CSS_CLASSES.SWAPPING);
            ghost2.classList.add(CSS_CLASSES.SWAPPING);

            // 设置CSS变量用于动画
            ghost1.style.setProperty('--swap-x', `${deltaX}px`);
            ghost1.style.setProperty('--swap-y', `${deltaY}px`);
            ghost2.style.setProperty('--swap-x', `${-deltaX}px`);
            ghost2.style.setProperty('--swap-y', `${-deltaY}px`);

            // 动画完成后清理
            setTimeout(() => {
                ghost1.classList.remove(CSS_CLASSES.SWAPPING);
                ghost2.classList.remove(CSS_CLASSES.SWAPPING);
                ghost1.style.removeProperty('--swap-x');
                ghost1.style.removeProperty('--swap-y');
                ghost2.style.removeProperty('--swap-x');
                ghost2.style.removeProperty('--swap-y');
                
                // 交换DOM元素
                cell1.appendChild(ghost2);
                cell2.appendChild(ghost1);
                
                resolve();
            }, duration);
        });
    }

    // 匹配消除动画
    animateMatch(matches, duration = GAME_CONFIG.ANIMATION_DURATION.ELIMINATION) {
        return new Promise((resolve) => {
            const ghostElements = [];

            // 收集所有要消除的小鬼元素
            matches.forEach(match => {
                match.forEach(position => {
                    const cell = this.cellElements[position.y]?.[position.x];
                    const ghost = cell?.querySelector('.ghost-icon');
                    if (ghost) {
                        ghostElements.push(ghost);
                        ghost.classList.add(CSS_CLASSES.ELIMINATING);
                    }
                });
            });

            if (ghostElements.length === 0) {
                resolve();
                return;
            }

            // 动画完成后移除元素
            setTimeout(() => {
                ghostElements.forEach(ghost => {
                    if (ghost.parentNode) {
                        ghost.parentNode.removeChild(ghost);
                    }
                });
                resolve();
            }, duration);
        });
    }

    // 下落动画
    animateFall(movements, duration = GAME_CONFIG.ANIMATION_DURATION.FALL) {
        return new Promise((resolve) => {
            if (movements.length === 0) {
                resolve();
                return;
            }

            movements.forEach(movement => {
                const fromCell = this.cellElements[movement.from.y][movement.from.x];
                const toCell = this.cellElements[movement.to.y][movement.to.x];
                const ghost = fromCell?.querySelector('.ghost-icon');

                if (ghost && toCell) {
                    // 计算下落距离
                    const distance = (movement.to.y - movement.from.y) * 100; // 假设每个单元格100%高度
                    
                    ghost.classList.add(CSS_CLASSES.FALLING);
                    ghost.style.setProperty('--fall-start', `-${distance}%`);

                    // 移动到目标位置
                    setTimeout(() => {
                        toCell.appendChild(ghost);
                        ghost.classList.remove(CSS_CLASSES.FALLING);
                        ghost.style.removeProperty('--fall-start');
                    }, duration * 0.8);
                }
            });

            setTimeout(resolve, duration);
        });
    }

    // 新图标出现动画
    animateAppear(newGhosts, duration = GAME_CONFIG.ANIMATION_DURATION.APPEAR) {
        return new Promise((resolve) => {
            if (newGhosts.length === 0) {
                resolve();
                return;
            }

            newGhosts.forEach(({ position, ghost }) => {
                const cell = this.cellElements[position.y][position.x];
                if (cell) {
                    const ghostElement = this.createGhostElement(ghost);
                    ghostElement.classList.add(CSS_CLASSES.APPEARING);
                    cell.appendChild(ghostElement);

                    setTimeout(() => {
                        ghostElement.classList.remove(CSS_CLASSES.APPEARING);
                    }, duration);
                }
            });

            setTimeout(resolve, duration);
        });
    }

    // 无效移动动画
    animateInvalidMove(pos1, pos2) {
        const cell1 = this.cellElements[pos1.y][pos1.x];
        const cell2 = this.cellElements[pos2.y][pos2.x];
        
        [cell1, cell2].forEach(cell => {
            const ghost = cell?.querySelector('.ghost-icon');
            if (ghost) {
                ghost.classList.add(CSS_CLASSES.INVALID_MOVE);
                setTimeout(() => {
                    ghost.classList.remove(CSS_CLASSES.INVALID_MOVE);
                }, 600);
            }
        });
    }

    // 连击效果动画
    animateCombo(comboCount) {
        if (this.comboElement) {
            this.comboElement.classList.add(CSS_CLASSES.COMBO_ANIMATION);
            setTimeout(() => {
                this.comboElement.classList.remove(CSS_CLASSES.COMBO_ANIMATION);
            }, 800);
        }
    }

    // 更新分数显示
    updateScore(score, animated = true) {
        if (this.scoreElement) {
            this.scoreElement.textContent = score.toLocaleString();
            
            if (animated) {
                this.scoreElement.classList.add(CSS_CLASSES.SCORE_ANIMATION);
                setTimeout(() => {
                    this.scoreElement.classList.remove(CSS_CLASSES.SCORE_ANIMATION);
                }, 500);
            }
        }
    }

    // 更新连击显示
    updateCombo(combo) {
        if (this.comboElement) {
            this.comboElement.textContent = combo;
            
            if (combo > 1) {
                this.animateCombo(combo);
            }
        }
    }

    // 更新计时器显示
    updateTimer(timeString) {
        if (this.timerElement) {
            this.timerElement.textContent = timeString;
        }
    }

    // 显示游戏结束效果
    showGameOver() {
        this.container.classList.add(CSS_CLASSES.GAME_OVER);
        
        // 3秒后移除效果
        setTimeout(() => {
            this.container.classList.remove(CSS_CLASSES.GAME_OVER);
        }, 3000);
    }

    // 显示暂停覆盖层
    showPauseOverlay() {
        let overlay = document.getElementById('pause-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'pause-overlay';
            overlay.className = 'pause-overlay';
            overlay.innerHTML = '<div class="pause-message">游戏已暂停</div>';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            overlay.querySelector('.pause-message').style.cssText = `
                color: white;
                font-size: 2rem;
                font-weight: bold;
            `;
            this.container.parentElement.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }

    // 隐藏暂停覆盖层
    hidePauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // 获取单元格元素
    getCellElement(x, y) {
        return this.cellElements[y]?.[x];
    }

    // 获取小鬼元素
    getGhostElement(x, y) {
        const cell = this.getCellElement(x, y);
        return cell?.querySelector('.ghost-icon');
    }

    // 检查是否正在播放动画
    isAnimating() {
        const animatingElements = this.container.querySelectorAll(
            `.${CSS_CLASSES.SWAPPING}, .${CSS_CLASSES.ELIMINATING}, .${CSS_CLASSES.FALLING}, .${CSS_CLASSES.APPEARING}`
        );
        return animatingElements.length > 0;
    }

    // 停止所有动画
    stopAllAnimations() {
        const animatedElements = this.container.querySelectorAll('.ghost-icon');
        animatedElements.forEach(element => {
            element.classList.remove(
                CSS_CLASSES.SWAPPING,
                CSS_CLASSES.ELIMINATING,
                CSS_CLASSES.FALLING,
                CSS_CLASSES.APPEARING,
                CSS_CLASSES.INVALID_MOVE
            );
        });
    }

    // 重置渲染器
    reset() {
        this.clearAllHighlights();
        this.stopAllAnimations();
        this.updateScore(0, false);
        this.updateCombo(0);
        this.updateTimer('00:00');
        
        // 清空所有单元格
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const cell = this.cellElements[y][x];
                if (cell) {
                    cell.innerHTML = '';
                }
            }
        }
    }

    // 清理动画和内存
    cleanupAnimations() {
        // 停止所有正在进行的动画
        this.stopAllAnimations();
        
        // 清理可能的内存泄漏
        const animatedElements = this.container.querySelectorAll('[style*="transition"], [style*="transform"]');
        animatedElements.forEach(element => {
            element.style.removeProperty('transition');
            element.style.removeProperty('transform');
            element.style.removeProperty('--fall-start');
        });
        
        // 清理事件监听器
        const cells = this.container.querySelectorAll('.game-cell');
        cells.forEach(cell => {
            // 克隆节点以移除所有事件监听器
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
        });
        
        // 强制重新绑定点击事件
        this.bindCellEvents();
    }

    // 重新绑定单元格事件
    bindCellEvents() {
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                const cell = this.getCellElement(x, y);
                if (cell) {
                    cell.addEventListener('click', (event) => {
                        this.handleCellClick(x, y, event);
                    });
                }
            }
        }
    }

    // 清理资源
    destroy() {
        this.cleanupAnimations();
        this.container.innerHTML = '';
        this.cellElements = [];
        this.gameBoard = null;
    }
}