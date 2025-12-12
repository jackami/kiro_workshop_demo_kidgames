// 匹配检测器 - 基于DFS的水平/垂直匹配检测

import { GAME_CONFIG, DIRECTIONS } from '../constants.js';

export class MatchDetector {
    constructor() {
        this.visited = new Set();
        this.gameBoard = null;
    }

    // 设置游戏板引用
    setGameBoard(board) {
        this.gameBoard = board;
    }

    // 查找所有匹配
    findMatches(grid) {
        if (!grid || grid.length === 0) {
            return [];
        }

        this.visited.clear();
        const matches = [];

        // 遍历整个网格
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (!this.visited.has(`${x},${y}`) && grid[y][x] !== null) {
                    // 检查水平匹配
                    const horizontalMatch = this.findHorizontalMatch(grid, x, y);
                    if (horizontalMatch.length >= GAME_CONFIG.MIN_MATCH_LENGTH) {
                        matches.push(horizontalMatch);
                        this.markVisited(horizontalMatch);
                    }

                    // 检查垂直匹配
                    const verticalMatch = this.findVerticalMatch(grid, x, y);
                    if (verticalMatch.length >= GAME_CONFIG.MIN_MATCH_LENGTH) {
                        matches.push(verticalMatch);
                        this.markVisited(verticalMatch);
                    }
                }
            }
        }

        return matches;
    }

    // 查找水平匹配
    findHorizontalMatch(grid, startX, startY) {
        const ghostType = grid[startY][startX]?.type;
        if (ghostType === undefined || ghostType === null) {
            return [];
        }

        const match = [];
        const y = startY;

        // 向左扩展
        for (let x = startX; x >= 0; x--) {
            if (grid[y][x]?.type === ghostType) {
                match.unshift({ x, y, type: ghostType });
            } else {
                break;
            }
        }

        // 向右扩展（跳过起始位置，因为已经包含在向左扩展中）
        for (let x = startX + 1; x < grid[y].length; x++) {
            if (grid[y][x]?.type === ghostType) {
                match.push({ x, y, type: ghostType });
            } else {
                break;
            }
        }

        return match;
    }

    // 查找垂直匹配
    findVerticalMatch(grid, startX, startY) {
        const ghostType = grid[startY][startX]?.type;
        if (ghostType === undefined || ghostType === null) {
            return [];
        }

        const match = [];
        const x = startX;

        // 向上扩展
        for (let y = startY; y >= 0; y--) {
            if (grid[y][x]?.type === ghostType) {
                match.unshift({ x, y, type: ghostType });
            } else {
                break;
            }
        }

        // 向下扩展（跳过起始位置，因为已经包含在向上扩展中）
        for (let y = startY + 1; y < grid.length; y++) {
            if (grid[y][x]?.type === ghostType) {
                match.push({ x, y, type: ghostType });
            } else {
                break;
            }
        }

        return match;
    }

    // 使用DFS查找连接的相同小鬼（用于特殊匹配模式）
    findConnectedGhosts(grid, startX, startY, visited = new Set()) {
        const ghostType = grid[startY]?.[startX]?.type;
        if (ghostType === undefined || ghostType === null) {
            return [];
        }

        const key = `${startX},${startY}`;
        if (visited.has(key)) {
            return [];
        }

        visited.add(key);
        const connected = [{ x: startX, y: startY, type: ghostType }];

        // 检查四个方向的相邻位置
        const directions = [
            { dx: 0, dy: -1 }, // 上
            { dx: 1, dy: 0 },  // 右
            { dx: 0, dy: 1 },  // 下
            { dx: -1, dy: 0 }  // 左
        ];

        directions.forEach(({ dx, dy }) => {
            const newX = startX + dx;
            const newY = startY + dy;
            const newKey = `${newX},${newY}`;

            if (this.isValidPosition(grid, newX, newY) && 
                !visited.has(newKey) && 
                grid[newY][newX]?.type === ghostType) {
                
                const connectedGhosts = this.findConnectedGhosts(grid, newX, newY, visited);
                connected.push(...connectedGhosts);
            }
        });

        return connected;
    }

    // 检查特定交换是否会创建匹配
    wouldCreateMatch(grid, pos1, pos2) {
        // 创建网格副本
        const gridCopy = this.copyGrid(grid);
        
        // 执行交换
        const temp = gridCopy[pos1.y][pos1.x];
        gridCopy[pos1.y][pos1.x] = gridCopy[pos2.y][pos2.x];
        gridCopy[pos2.y][pos2.x] = temp;

        // 检查交换后是否有匹配
        const matches = this.findMatches(gridCopy);
        return matches.length > 0;
    }

    // 查找所有可能的有效移动
    findValidMoves(grid) {
        const validMoves = [];

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                // 检查右侧相邻位置
                if (x < grid[y].length - 1) {
                    const pos1 = { x, y };
                    const pos2 = { x: x + 1, y };
                    
                    if (this.wouldCreateMatch(grid, pos1, pos2)) {
                        validMoves.push({ from: pos1, to: pos2 });
                    }
                }

                // 检查下方相邻位置
                if (y < grid.length - 1) {
                    const pos1 = { x, y };
                    const pos2 = { x, y: y + 1 };
                    
                    if (this.wouldCreateMatch(grid, pos1, pos2)) {
                        validMoves.push({ from: pos1, to: pos2 });
                    }
                }
            }
        }

        return validMoves;
    }

    // 检查是否存在可能的移动
    hasValidMoves(grid) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                // 检查右侧相邻位置
                if (x < grid[y].length - 1) {
                    if (this.wouldCreateMatch(grid, { x, y }, { x: x + 1, y })) {
                        return true;
                    }
                }

                // 检查下方相邻位置
                if (y < grid.length - 1) {
                    if (this.wouldCreateMatch(grid, { x, y }, { x, y: y + 1 })) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // 获取匹配统计信息
    getMatchStats(matches) {
        const stats = {
            totalMatches: matches.length,
            totalGhosts: 0,
            horizontalMatches: 0,
            verticalMatches: 0,
            matchSizes: {},
            ghostTypes: {}
        };

        matches.forEach(match => {
            stats.totalGhosts += match.length;
            
            // 统计匹配大小
            const size = match.length;
            stats.matchSizes[size] = (stats.matchSizes[size] || 0) + 1;

            // 统计小鬼类型
            if (match.length > 0) {
                const type = match[0].type;
                stats.ghostTypes[type] = (stats.ghostTypes[type] || 0) + 1;
            }

            // 判断匹配方向
            if (match.length >= 2) {
                const isHorizontal = match[0].y === match[1].y;
                if (isHorizontal) {
                    stats.horizontalMatches++;
                } else {
                    stats.verticalMatches++;
                }
            }
        });

        return stats;
    }

    // 查找L型或T型匹配（高级匹配模式）
    findSpecialMatches(grid) {
        const specialMatches = [];
        
        for (let y = 1; y < grid.length - 1; y++) {
            for (let x = 1; x < grid[y].length - 1; x++) {
                const centerGhost = grid[y][x];
                if (!centerGhost) continue;

                // 检查T型匹配（十字形）
                const tMatch = this.checkTMatch(grid, x, y, centerGhost.type);
                if (tMatch.length >= 5) {
                    specialMatches.push({
                        type: 'T',
                        positions: tMatch,
                        center: { x, y }
                    });
                }

                // 检查L型匹配
                const lMatch = this.checkLMatch(grid, x, y, centerGhost.type);
                if (lMatch.length >= 5) {
                    specialMatches.push({
                        type: 'L',
                        positions: lMatch,
                        center: { x, y }
                    });
                }
            }
        }

        return specialMatches;
    }

    // 检查T型匹配
    checkTMatch(grid, centerX, centerY, ghostType) {
        const positions = [{ x: centerX, y: centerY }];
        
        // 检查水平线
        let leftCount = 0, rightCount = 0;
        for (let x = centerX - 1; x >= 0 && grid[centerY][x]?.type === ghostType; x--) {
            positions.push({ x, y: centerY });
            leftCount++;
        }
        for (let x = centerX + 1; x < grid[centerY].length && grid[centerY][x]?.type === ghostType; x++) {
            positions.push({ x, y: centerY });
            rightCount++;
        }

        // 检查垂直线
        let upCount = 0, downCount = 0;
        for (let y = centerY - 1; y >= 0 && grid[y][centerX]?.type === ghostType; y--) {
            positions.push({ x: centerX, y });
            upCount++;
        }
        for (let y = centerY + 1; y < grid.length && grid[y][centerX]?.type === ghostType; y++) {
            positions.push({ x: centerX, y });
            downCount++;
        }

        // T型需要至少3个方向有延伸
        const hasHorizontal = leftCount + rightCount >= 2;
        const hasVertical = upCount + downCount >= 2;
        
        return hasHorizontal && hasVertical ? positions : [];
    }

    // 检查L型匹配
    checkLMatch(grid, centerX, centerY, ghostType) {
        const lPatterns = [
            // 右下L
            [{ dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: 2 }],
            // 左下L
            [{ dx: -1, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: 2 }],
            // 右上L
            [{ dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: -2 }],
            // 左上L
            [{ dx: -1, dy: 0 }, { dx: -2, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: -2 }]
        ];

        for (const pattern of lPatterns) {
            const positions = [{ x: centerX, y: centerY }];
            let validPattern = true;

            for (const { dx, dy } of pattern) {
                const newX = centerX + dx;
                const newY = centerY + dy;
                
                if (this.isValidPosition(grid, newX, newY) && 
                    grid[newY][newX]?.type === ghostType) {
                    positions.push({ x: newX, y: newY });
                } else {
                    validPattern = false;
                    break;
                }
            }

            if (validPattern) {
                return positions;
            }
        }

        return [];
    }

    // 标记位置为已访问
    markVisited(match) {
        match.forEach(position => {
            this.visited.add(`${position.x},${position.y}`);
        });
    }

    // 检查位置是否有效
    isValidPosition(grid, x, y) {
        return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length;
    }

    // 复制网格
    copyGrid(grid) {
        return grid.map(row => 
            row.map(cell => cell ? { ...cell } : null)
        );
    }

    // 清除访问标记
    clearVisited() {
        this.visited.clear();
    }

    // 获取匹配检测统计
    getDetectionStats() {
        return {
            visitedCells: this.visited.size,
            lastDetectionTime: this.lastDetectionTime || 0
        };
    }

    // 重置检测器状态
    reset() {
        this.clearVisited();
        this.lastDetectionTime = 0;
    }
}