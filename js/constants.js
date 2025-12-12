// 游戏常量定义文件

// 小鬼类型定义
export const GHOST_TYPES = {
    RED: 0,
    BLUE: 1,
    GREEN: 2,
    YELLOW: 3,
    PURPLE: 4
};

// 游戏配置
export const GAME_CONFIG = {
    BOARD_SIZE: 8,
    MIN_MATCH_LENGTH: 3,
    GHOST_TYPE_COUNT: 5,
    DEBUG_MODE: false, // 设置为 true 启用调试模式
    ANIMATION_DURATION: {
        SWAP: 400,
        ELIMINATION: 600,
        FALL: 500,
        APPEAR: 400
    },
    SCORING: {
        BASE_SCORE: 10,
        COMBO_BONUS: 5,
        MATCH_MULTIPLIER: {
            3: 1,
            4: 1.5,
            5: 2,
            6: 2.5,
            7: 3,
            8: 4
        }
    }
};

// 游戏状态枚举
export const GAME_STATES = {
    INITIALIZING: 'initializing',
    PLAYING: 'playing',
    PAUSED: 'paused',
    ANIMATING: 'animating',
    ENDED: 'ended'
};

// 方向定义（用于匹配检测）
export const DIRECTIONS = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

// 相邻位置偏移量
export const ADJACENT_OFFSETS = [
    { x: 0, y: -1 }, // 上
    { x: 1, y: 0 },  // 右
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }  // 左
];

// CSS类名常量
export const CSS_CLASSES = {
    SELECTED: 'selected',
    SWAPPING: 'swapping',
    ELIMINATING: 'eliminating',
    FALLING: 'falling',
    APPEARING: 'appearing',
    INVALID_MOVE: 'invalid-move',
    COMBO_ANIMATION: 'combo-animation',
    SCORE_ANIMATION: 'score-animation',
    CHAIN_REACTION: 'chain-reaction',
    GAME_OVER: 'game-over',
    HIDDEN: 'hidden',
    PRESSED: 'pressed'
};

// 音效类型
export const SOUND_TYPES = {
    MATCH: 'match',
    COMBO: 'combo',
    SWAP: 'swap',
    INVALID: 'invalid',
    GAME_OVER: 'gameOver'
};

// 事件类型
export const EVENTS = {
    GAME_START: 'gameStart',
    GAME_PAUSE: 'gamePause',
    GAME_RESUME: 'gameResume',
    GAME_END: 'gameEnd',
    SCORE_UPDATE: 'scoreUpdate',
    COMBO_UPDATE: 'comboUpdate',
    MATCH_FOUND: 'matchFound',
    BOARD_UPDATE: 'boardUpdate',
    CELL_SELECT: 'cellSelect',
    CELL_SWAP: 'cellSwap',
    ANIMATION_START: 'animationStart',
    ANIMATION_END: 'animationEnd'
};

// 错误消息
export const ERROR_MESSAGES = {
    INVALID_POSITION: '无效的位置坐标',
    INVALID_GHOST_TYPE: '无效的小鬼类型',
    GAME_NOT_INITIALIZED: '游戏未初始化',
    ANIMATION_IN_PROGRESS: '动画进行中，请稍候',
    NO_VALID_MOVES: '没有可用的移动',
    AUDIO_LOAD_FAILED: '音频加载失败'
};

// 本地存储键名
export const STORAGE_KEYS = {
    HIGH_SCORE: 'ghostMatch_highScore',
    GAME_SETTINGS: 'ghostMatch_settings',
    GAME_STATE: 'ghostMatch_gameState'
};

// 默认游戏设置
export const DEFAULT_SETTINGS = {
    soundEnabled: true,
    volume: 0.7,
    animationsEnabled: true,
    showHints: true
};