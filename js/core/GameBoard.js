// 游戏板 - 8x8网格数据结构、单元格操作
// 需求: 1.1, 1.2, 1.4

import { GAME_CONFIG, GHOST_TYPES } from '../constants.js';

/**
 * GameBoard类 - 管理8x8游戏网格和小鬼图标
 * 实现网格初始化、单元格操作和交换功能
 */
export class GameBoard {
    /**
     * 构造函数 - 创建指定大小的游戏板
     * @param {number} width - 游戏板宽度，默认8
     * @param {number} height - 游戏板高度，默认8
     */
    constructor(width = GAME_CONFIG.BOARD_SIZE, height = GAME_CONFIG.BOARD_SIZE) {
        this.width = width;
        this.height = height;
        this.grid = [];
        
        // 初始化空网格
        this.initializeEmptyGrid();
    }

    /**
     * 初始化空的游戏板网格
     * 创建width x height的二维数组，所有位置初始化为null
     */
    initializeEmptyGrid() {
        this.grid = [];
        
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = null;
            }
        }
    }

    /**
     * 生成随机小鬼类型
     * @returns {number} 0-4之间的随机整数，对应5种小鬼类型
     */
    generateRandomGhostType() {
        return Math.floor(Math.random() * GAME_CONFIG.GHOST_TYPE_COUNT);
    }

    /**
     * 创建小鬼对象
     * @param {number} type - 小鬼类型 (0-4)
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object} 小鬼对象，包含type, color, sprite, x, y属性
     */
    createGhost(type, x, y) {
        // 验证小鬼类型有效性
        if (type < 0 || type >= GAME_CONFIG.GHOST_TYPE_COUNT) {
            throw new Error(`Invalid ghost type: ${type}`);
        }

        return {
            type: type,
            color: this.getGhostColor(type),
            sprite: this.getGhostSprite(type),
            x: x,
            y: y
        };
    }

    /**
     * 根据小鬼类型获取颜色
     * @param {number} type - 小鬼类型
     * @returns {string} 颜色名称
     */
    getGhostColor(type) {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        return colors[type] || 'red';
    }

    /**
     * 根据小鬼类型获取精灵标识
     * @param {number} type - 小鬼类型
     * @returns {string} 精灵CSS类名
     */
    getGhostSprite(type) {
        return `ghost-type-${type}`;
    }

    /**
     * 获取指定位置的单元格
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object|null} 小鬼对象或null
     */
    getCell(x, y) {
        if (!this.isValidPosition(x, y)) {
            return null;
        }
        return this.grid[y][x];
    }

    /**
     * 设置指定位置的单元格
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object|null} ghost - 小鬼对象或null
     * @returns {boolean} 设置是否成功
     */
    setCell(x, y, ghost) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        // 如果设置的是小鬼对象，更新其坐标
        if (ghost) {
            ghost.x = x;
            ghost.y = y;
        }
        
        this.grid[y][x] = ghost;
        return true;
    }

    /**
     * 交换两个单元格的位置
     * @param {Object} pos1 - 第一个位置 {x, y}
     * @param {Object} pos2 - 第二个位置 {x, y}
     * @returns {boolean} 交换是否成功
     */
    swapCells(pos1, pos2) {
        // 验证位置有效性
        if (!this.isValidPosition(pos1.x, pos1.y) || 
            !this.isValidPosition(pos2.x, pos2.y)) {
            return false;
        }

        // 获取两个位置的小鬼对象
        const ghost1 = this.grid[pos1.y][pos1.x];
        const ghost2 = this.grid[pos2.y][pos2.x];

        // 更新小鬼对象的位置信息
        if (ghost1) {
            ghost1.x = pos2.x;
            ghost1.y = pos2.y;
        }
        if (ghost2) {
            ghost2.x = pos1.x;
            ghost2.y = pos1.y;
        }

        // 在网格中交换位置
        this.grid[pos1.y][pos1.x] = ghost2;
        this.grid[pos2.y][pos2.x] = ghost1;

        return true;
    }

    /**
     * 检查位置坐标是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 位置是否有效
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * 获取相邻位置列表
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Array} 相邻位置数组
     */
    getAdjacentPositions(x, y) {
        const positions = [];
        const offsets = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];

        offsets.forEach(offset => {
            const newX = x + offset.x;
            const newY = y + offset.y;
            
            if (this.isValidPosition(newX, newY)) {
                positions.push({ x: newX, y: newY });
            }
        });

        return positions;
    }

    /**
     * 获取网格的深拷贝
     * @returns {Array} 网格副本
     */
    getGridCopy() {
        return this.grid.map(row => 
            row.map(cell => cell ? { ...cell } : null)
        );
    }

    /**
     * 检查网格是否完全填满
     * @returns {boolean} 网格是否已满
     */
    isFull() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 检查网格是否为空
     * @returns {boolean} 网格是否为空
     */
    isEmpty() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 获取网格统计信息
     * @returns {Object} 包含总数、填充数、空位数和类型分布的统计对象
     */
    getStats() {
        const stats = {
            totalCells: this.width * this.height,
            filledCells: 0,
            emptyCells: 0,
            ghostTypes: {}
        };

        // 初始化小鬼类型计数
        for (let i = 0; i < GAME_CONFIG.GHOST_TYPE_COUNT; i++) {
            stats.ghostTypes[i] = 0;
        }

        // 统计网格状态
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] !== null) {
                    stats.filledCells++;
                    stats.ghostTypes[this.grid[y][x].type]++;
                } else {
                    stats.emptyCells++;
                }
            }
        }

        return stats;
    }

    /**
     * 填充网格，确保无初始匹配
     * 实现随机小鬼图标生成算法，并确保初始状态无三连匹配
     */
    fillGridWithoutMatches() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let ghostType;
                let attempts = 0;
                const maxAttempts = 50;

                // 尝试生成不会创建匹配的小鬼类型
                do {
                    ghostType = this.generateRandomGhostType();
                    attempts++;
                } while (
                    this.wouldCreateMatch(x, y, ghostType) && 
                    attempts < maxAttempts
                );

                // 如果尝试次数过多，使用第一个不会创建匹配的类型
                if (attempts >= maxAttempts) {
                    ghostType = this.findSafeGhostType(x, y);
                }

                // 创建并设置小鬼
                const ghost = this.createGhost(ghostType, x, y);
                this.grid[y][x] = ghost;
            }
        }
    }

    /**
     * 检查放置特定类型的小鬼是否会创建匹配
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} ghostType - 小鬼类型
     * @returns {boolean} 是否会创建匹配
     */
    wouldCreateMatch(x, y, ghostType) {
        // 检查水平方向
        let horizontalCount = 1;
        
        // 向左检查
        for (let i = x - 1; i >= 0; i--) {
            if (this.grid[y][i] && this.grid[y][i].type === ghostType) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        // 向右检查
        for (let i = x + 1; i < this.width; i++) {
            if (this.grid[y][i] && this.grid[y][i].type === ghostType) {
                horizontalCount++;
            } else {
                break;
            }
        }

        if (horizontalCount >= GAME_CONFIG.MIN_MATCH_LENGTH) {
            return true;
        }

        // 检查垂直方向
        let verticalCount = 1;
        
        // 向上检查
        for (let i = y - 1; i >= 0; i--) {
            if (this.grid[i][x] && this.grid[i][x].type === ghostType) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        // 向下检查
        for (let i = y + 1; i < this.height; i++) {
            if (this.grid[i][x] && this.grid[i][x].type === ghostType) {
                verticalCount++;
            } else {
                break;
            }
        }

        return verticalCount >= GAME_CONFIG.MIN_MATCH_LENGTH;
    }

    /**
     * 找到一个安全的小鬼类型（不会创建匹配）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {number} 安全的小鬼类型
     */
    findSafeGhostType(x, y) {
        for (let type = 0; type < GAME_CONFIG.GHOST_TYPE_COUNT; type++) {
            if (!this.wouldCreateMatch(x, y, type)) {
                return type;
            }
        }
        // 如果所有类型都会创建匹配（极少情况），返回随机类型
        return this.generateRandomGhostType();
    }

    /**
     * 初始化游戏板并填充随机小鬼图标
     * 确保初始状态无三连匹配
     */
    initializeWithGhosts() {
        this.initializeEmptyGrid();
        this.fillGridWithoutMatches();
    }

    /**
     * 重置游戏板为空状态
     */
    reset() {
        this.initializeEmptyGrid();
    }

    /**
     * 重置游戏板并重新填充小鬼
     */
    resetWithGhosts() {
        this.initializeWithGhosts();
    }

    /**
     * 移除匹配的小鬼图标
     * @param {Array} matches - 匹配数组，每个匹配包含位置信息
     * @returns {number} 移除的小鬼数量
     */
    removeMatches(matches) {
        let removedCount = 0;
        
        if (!matches || matches.length === 0) {
            return removedCount;
        }
        
        // 遍历所有匹配
        matches.forEach(match => {
            if (Array.isArray(match)) {
                match.forEach(ghost => {
                    if (ghost && typeof ghost.x === 'number' && typeof ghost.y === 'number') {
                        if (this.isValidPosition(ghost.x, ghost.y)) {
                            this.grid[ghost.y][ghost.x] = null;
                            removedCount++;
                        }
                    }
                });
            }
        });
        
        return removedCount;
    }

    /**
     * 填充空位置
     * @returns {Array} 新创建的小鬼数组
     */
    fillEmpty() {
        const newGhosts = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === null) {
                    const ghostType = this.generateRandomGhostType();
                    const newGhost = this.createGhost(ghostType, x, y);
                    this.grid[y][x] = newGhost;
                    newGhosts.push(newGhost);
                }
            }
        }
        
        return newGhosts;
    }

    /**
     * 调试用：打印网格状态到控制台
     */
    printGrid() {
        console.log('Game Board Grid:');
        for (let y = 0; y < this.height; y++) {
            const row = this.grid[y].map(cell => 
                cell ? cell.type.toString() : '.'
            ).join(' ');
            console.log(`Row ${y}: ${row}`);
        }
    }
}