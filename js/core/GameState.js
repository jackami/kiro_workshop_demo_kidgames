// 游戏状态 - 分数、计时器、连击跟踪

import { EVENTS } from '../constants.js';

export class GameState {
    constructor() {
        this.score = 0;
        this.moves = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.playTime = 0;
        this.isPlaying = false;
        this.selectedCell = null;
        this.animating = false;
        this.level = 1;
        this.targetScore = 1000;
        
        this.eventListeners = new Map();
        this.startTime = null;
        this.lastUpdateTime = null;
    }

    // 重置游戏状态
    reset() {
        this.score = 0;
        this.moves = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.playTime = 0;
        this.isPlaying = false;
        this.selectedCell = null;
        this.animating = false;
        this.level = 1;
        this.targetScore = 1000;
        this.startTime = null;
        this.lastUpdateTime = null;
        
        this.emit(EVENTS.SCORE_UPDATE, { score: this.score });
        this.emit(EVENTS.COMBO_UPDATE, { combo: this.combo });
    }

    // 开始游戏
    startGame() {
        this.isPlaying = true;
        this.startTime = Date.now();
        this.lastUpdateTime = this.startTime;
    }

    // 结束游戏
    endGame() {
        this.isPlaying = false;
        this.clearSelection();
    }

    // 暂停游戏
    pauseGame() {
        if (this.isPlaying && this.startTime) {
            // 保存暂停时的游戏时间
            this.playTime = Math.floor((Date.now() - this.startTime) / 1000);
        }
        this.isPlaying = false;
    }

    // 恢复游戏
    resumeGame() {
        if (!this.isPlaying) {
            // 调整开始时间，使得 playTime 保持不变
            this.startTime = Date.now() - (this.playTime * 1000);
            this.lastUpdateTime = Date.now();
        }
        this.isPlaying = true;
    }

    // 增加分数
    addScore(points) {
        if (!this.isPlaying) return;
        
        const oldScore = this.score;
        this.score += points;
        
        // 检查是否升级
        this.checkLevelUp();
        
        this.emit(EVENTS.SCORE_UPDATE, { 
            score: this.score, 
            oldScore: oldScore,
            points: points 
        });
    }

    // 增加移动次数
    incrementMoves() {
        if (!this.isPlaying) return;
        
        this.moves++;
    }

    // 增加连击
    incrementCombo() {
        if (!this.isPlaying) return;
        
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        this.emit(EVENTS.COMBO_UPDATE, { 
            combo: this.combo,
            maxCombo: this.maxCombo 
        });
    }

    // 重置连击
    resetCombo() {
        if (this.combo > 0) {
            this.combo = 0;
            this.emit(EVENTS.COMBO_UPDATE, { 
                combo: this.combo,
                maxCombo: this.maxCombo 
            });
        }
    }

    // 选择单元格
    selectCell(position) {
        this.selectedCell = { ...position };
        this.emit(EVENTS.CELL_SELECT, { position: this.selectedCell });
    }

    // 清除选择
    clearSelection() {
        if (this.selectedCell) {
            this.selectedCell = null;
            this.emit(EVENTS.CELL_SELECT, { position: null });
        }
    }

    // 设置动画状态
    setAnimating(animating) {
        this.animating = animating;
        this.emit(EVENTS.ANIMATION_START + (animating ? '' : '_END'));
    }

    // 更新游戏时间
    updateTime(currentTime) {
        if (!this.isPlaying || !this.startTime) return;
        
        this.playTime = Math.floor((currentTime - this.startTime) / 1000);
        this.lastUpdateTime = currentTime;
    }

    // 获取格式化的游戏时间
    getFormattedTime() {
        const minutes = Math.floor(this.playTime / 60);
        const seconds = this.playTime % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 检查是否升级
    checkLevelUp() {
        const newLevel = Math.floor(this.score / this.targetScore) + 1;
        if (newLevel > this.level) {
            const oldLevel = this.level;
            this.level = newLevel;
            this.targetScore = this.level * 1000;
            
            this.emit('levelUp', { 
                level: this.level, 
                oldLevel: oldLevel,
                targetScore: this.targetScore 
            });
        }
    }

    // 计算连击奖励分数
    calculateComboBonus(baseScore) {
        if (this.combo <= 1) return 0;
        
        // 连击奖励：连击数 * 5
        return (this.combo - 1) * 5;
    }

    // 计算匹配分数
    calculateMatchScore(matchLength, comboMultiplier = 1) {
        const baseScore = matchLength * 10;
        const comboBonus = this.calculateComboBonus(baseScore);
        const levelMultiplier = 1 + (this.level - 1) * 0.1;
        
        return Math.floor((baseScore + comboBonus) * comboMultiplier * levelMultiplier);
    }

    // 获取游戏统计信息
    getStats() {
        return {
            score: this.score,
            moves: this.moves,
            combo: this.combo,
            maxCombo: this.maxCombo,
            playTime: this.playTime,
            level: this.level,
            targetScore: this.targetScore,
            isPlaying: this.isPlaying,
            hasSelection: this.selectedCell !== null,
            animating: this.animating
        };
    }

    // 获取分数排名等级
    getScoreRank() {
        if (this.score >= 10000) return 'S';
        if (this.score >= 7500) return 'A';
        if (this.score >= 5000) return 'B';
        if (this.score >= 2500) return 'C';
        if (this.score >= 1000) return 'D';
        return 'E';
    }

    // 检查是否达到目标分数
    hasReachedTarget() {
        return this.score >= this.targetScore;
    }

    // 获取进度百分比
    getProgress() {
        const previousTarget = (this.level - 1) * 1000;
        const currentProgress = this.score - previousTarget;
        const levelRange = this.targetScore - previousTarget;
        
        return Math.min(100, Math.floor((currentProgress / levelRange) * 100));
    }

    // 保存游戏状态到本地存储
    saveToStorage() {
        const gameState = {
            score: this.score,
            moves: this.moves,
            combo: this.combo,
            maxCombo: this.maxCombo,
            playTime: this.playTime,
            level: this.level,
            targetScore: this.targetScore,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('ghostMatch_gameState', JSON.stringify(gameState));
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }

    // 从本地存储加载游戏状态
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('ghostMatch_gameState');
            if (saved) {
                const gameState = JSON.parse(saved);
                
                // 检查保存时间是否过期（24小时）
                const now = Date.now();
                const saveTime = gameState.timestamp || 0;
                const hoursPassed = (now - saveTime) / (1000 * 60 * 60);
                
                if (hoursPassed < 24) {
                    this.score = gameState.score || 0;
                    this.moves = gameState.moves || 0;
                    this.combo = gameState.combo || 0;
                    this.maxCombo = gameState.maxCombo || 0;
                    this.playTime = gameState.playTime || 0;
                    this.level = gameState.level || 1;
                    this.targetScore = gameState.targetScore || 1000;
                    
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }
        
        return false;
    }

    // 清除保存的游戏状态
    clearSavedState() {
        try {
            localStorage.removeItem('ghostMatch_gameState');
        } catch (error) {
            console.warn('Failed to clear saved state:', error);
        }
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
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // 清理资源
    destroy() {
        this.eventListeners.clear();
        this.clearSelection();
        this.isPlaying = false;
    }
}