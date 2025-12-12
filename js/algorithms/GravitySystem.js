// 重力系统 - 下落逻辑、补充机制

import { GAME_CONFIG } from '../constants.js';

export class GravitySystem {
    constructor() {
        this.movements = [];
        this.fallSpeed = 1; // 下落速度倍数
        this.gameBoard = null;
    }

    // 设置游戏板引用
    setGameBoard(board) {
        this.gameBoard = board;
    }

    // 应用重力到网格
    applyGravity(grid) {
        if (!grid || grid.length === 0) {
            return [];
        }

        this.movements = [];
        const height = grid.length;
        const width = grid[0].length;

        // 对每一列应用重力
        for (let x = 0; x < width; x++) {
            this.applyGravityToColumn(grid, x, height);
        }

        return this.movements;
    }

    // 对单列应用重力
    applyGravityToColumn(grid, columnX, height) {
        const column = [];
        const movements = [];

        // 收集该列中所有非空的小鬼
        for (let y = 0; y < height; y++) {
            if (grid[y][columnX] !== null) {
                column.push({
                    ghost: grid[y][columnX],
                    originalY: y
                });
            }
        }

        // 清空该列
        for (let y = 0; y < height; y++) {
            grid[y][columnX] = null;
        }

        // 从底部开始重新放置小鬼
        let targetY = height - 1;
        for (let i = column.length - 1; i >= 0; i--) {
            const { ghost, originalY } = column[i];
            
            // 更新小鬼位置
            ghost.x = columnX;
            ghost.y = targetY;
            grid[targetY][columnX] = ghost;

            // 记录移动（如果位置发生变化）
            if (originalY !== targetY) {
                movements.push({
                    from: { x: columnX, y: originalY },
                    to: { x: columnX, y: targetY },
                    ghost: ghost,
                    distance: targetY - originalY
                });
            }

            targetY--;
        }

        // 将该列的移动添加到总移动列表
        this.movements.push(...movements);
    }

    // 填充空位
    fillEmpty(grid, ghostGenerator) {
        if (!grid || grid.length === 0) {
            return [];
        }

        const newGhosts = [];
        const height = grid.length;
        const width = grid[0].length;

        // 从上到下填充空位
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (grid[y][x] === null) {
                    // 生成新的小鬼
                    const ghostType = this.generateRandomGhostType();
                    const newGhost = this.createGhost(ghostType, x, y);
                    
                    grid[y][x] = newGhost;
                    newGhosts.push({
                        position: { x, y },
                        ghost: newGhost
                    });
                }
            }
        }

        return newGhosts;
    }

    // 智能填充（避免立即创建匹配）
    smartFill(grid, matchDetector) {
        if (!grid || grid.length === 0) {
            return [];
        }

        const newGhosts = [];
        const height = grid.length;
        const width = grid[0].length;

        // 从上到下填充空位
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (grid[y][x] === null) {
                    let ghostType;
                    let attempts = 0;
                    const maxAttempts = 20;

                    // 尝试找到不会立即创建匹配的小鬼类型
                    do {
                        ghostType = this.generateRandomGhostType();
                        attempts++;
                    } while (
                        this.wouldCreateImmediateMatch(grid, x, y, ghostType, matchDetector) &&
                        attempts < maxAttempts
                    );

                    // 如果尝试次数过多，使用随机类型
                    if (attempts >= maxAttempts) {
                        ghostType = this.generateRandomGhostType();
                    }

                    const newGhost = this.createGhost(ghostType, x, y);
                    grid[y][x] = newGhost;
                    newGhosts.push({
                        position: { x, y },
                        ghost: newGhost
                    });
                }
            }
        }

        return newGhosts;
    }

    // 检查放置特定类型是否会立即创建匹配
    wouldCreateImmediateMatch(grid, x, y, ghostType, matchDetector) {
        // 临时放置小鬼
        const tempGhost = this.createGhost(ghostType, x, y);
        grid[y][x] = tempGhost;

        // 检查是否创建匹配
        const matches = matchDetector.findMatches(grid);
        const hasMatch = matches.length > 0;

        // 移除临时小鬼
        grid[y][x] = null;

        return hasMatch;
    }

    // 计算下落时间
    calculateFallTime(distance) {
        // 基于距离计算下落时间，距离越远时间越长
        const baseTime = 200; // 基础时间（毫秒）
        const timePerCell = 50; // 每个单元格的额外时间
        return baseTime + (distance * timePerCell * this.fallSpeed);
    }

    // 获取下落动画序列
    getFallAnimationSequence(movements) {
        // 按列分组移动
        const columnMovements = {};
        
        movements.forEach(movement => {
            const column = movement.from.x;
            if (!columnMovements[column]) {
                columnMovements[column] = [];
            }
            columnMovements[column].push(movement);
        });

        // 为每列创建动画序列
        const animationSequence = [];
        
        Object.keys(columnMovements).forEach(column => {
            const colMovements = columnMovements[column];
            
            // 按原始Y位置排序（从上到下）
            colMovements.sort((a, b) => a.from.y - b.from.y);
            
            // 计算每个移动的延迟时间
            colMovements.forEach((movement, index) => {
                animationSequence.push({
                    ...movement,
                    delay: index * 50, // 每个小鬼之间50ms延迟
                    duration: this.calculateFallTime(movement.distance)
                });
            });
        });

        return animationSequence;
    }

    // 检查网格稳定性（是否还有小鬼需要下落）
    isGridStable(grid) {
        if (!grid || grid.length === 0) {
            return true;
        }

        const height = grid.length;
        const width = grid[0].length;

        for (let x = 0; x < width; x++) {
            for (let y = height - 1; y >= 0; y--) {
                if (grid[y][x] === null) {
                    // 检查上方是否有小鬼
                    for (let checkY = y - 1; checkY >= 0; checkY--) {
                        if (grid[checkY][x] !== null) {
                            return false; // 发现需要下落的小鬼
                        }
                    }
                }
            }
        }

        return true;
    }

    // 获取空位统计
    getEmptySpaceStats(grid) {
        if (!grid || grid.length === 0) {
            return { totalEmpty: 0, emptyByColumn: [] };
        }

        const height = grid.length;
        const width = grid[0].length;
        let totalEmpty = 0;
        const emptyByColumn = [];

        for (let x = 0; x < width; x++) {
            let columnEmpty = 0;
            for (let y = 0; y < height; y++) {
                if (grid[y][x] === null) {
                    columnEmpty++;
                    totalEmpty++;
                }
            }
            emptyByColumn.push(columnEmpty);
        }

        return { totalEmpty, emptyByColumn };
    }

    // 预测下落结果
    predictFallResult(grid) {
        // 创建网格副本
        const gridCopy = this.copyGrid(grid);
        
        // 应用重力
        const movements = this.applyGravity(gridCopy);
        
        return {
            resultGrid: gridCopy,
            movements: movements,
            isStable: this.isGridStable(gridCopy)
        };
    }

    // 生成随机小鬼类型
    generateRandomGhostType() {
        return Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT);
    }

    // 创建小鬼对象
    createGhost(type, x, y) {
        return {
            type: type,
            color: this.getGhostColor(type),
            sprite: this.getGhostSprite(type),
            x: x,
            y: y
        };
    }

    // 获取小鬼颜色
    getGhostColor(type) {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        return colors[type] || 'red';
    }

    // 获取小鬼精灵标识
    getGhostSprite(type) {
        return `ghost-type-${type}`;
    }

    // 复制网格
    copyGrid(grid) {
        return grid.map(row => 
            row.map(cell => cell ? { ...cell } : null)
        );
    }

    // 设置下落速度
    setFallSpeed(speed) {
        this.fallSpeed = Math.max(0.1, Math.min(3.0, speed));
    }

    // 获取下落速度
    getFallSpeed() {
        return this.fallSpeed;
    }

    // 获取重力系统统计
    getStats() {
        return {
            lastMovements: this.movements.length,
            fallSpeed: this.fallSpeed
        };
    }

    // 重置重力系统
    reset() {
        this.movements = [];
        this.fallSpeed = 1;
    }
}