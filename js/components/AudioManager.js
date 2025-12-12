// 音频管理器 - 消除、连击、游戏结束音效

import { SOUND_TYPES, DEFAULT_SETTINGS } from '../constants.js';

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.volume = DEFAULT_SETTINGS.volume;
        this.isMuted = !DEFAULT_SETTINGS.soundEnabled;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        // 不在构造函数中初始化 AudioContext，等待用户交互
    }

    // 初始化音频系统（在用户交互后调用）
    async initializeAudio() {
        // 如果已经初始化或正在初始化，直接返回
        if (this.isInitialized) {
            return;
        }
        
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = (async () => {
            try {
                // 创建音频上下文
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // 恢复音频上下文（处理自动播放策略）
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                
                // 加载音效文件
                await this.loadSounds();
                
                this.isInitialized = true;
                console.log('Audio system initialized successfully');
            } catch (error) {
                console.warn('Failed to initialize audio system:', error);
                this.isInitialized = false;
            }
        })();
        
        return this.initializationPromise;
    }

    // 加载音效文件
    async loadSounds() {
        const soundFiles = {
            [SOUND_TYPES.MATCH]: this.generateMatchSound(),
            [SOUND_TYPES.COMBO]: this.generateComboSound(),
            [SOUND_TYPES.SWAP]: this.generateSwapSound(),
            [SOUND_TYPES.INVALID]: this.generateInvalidSound(),
            [SOUND_TYPES.GAME_OVER]: this.generateGameOverSound()
        };

        // 生成并存储音效
        for (const [type, soundData] of Object.entries(soundFiles)) {
            try {
                const audioBuffer = await this.createAudioBuffer(soundData);
                this.sounds.set(type, audioBuffer);
            } catch (error) {
                console.warn(`Failed to load sound ${type}:`, error);
            }
        }
    }

    // 生成匹配音效数据
    generateMatchSound() {
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            // 创建愉快的匹配音效：上升的音调
            const frequency = 440 + (t * 200);
            const envelope = Math.exp(-t * 3);
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
        }

        return { buffer, sampleRate };
    }

    // 生成连击音效数据
    generateComboSound() {
        const sampleRate = 44100;
        const duration = 0.5;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            // 创建激动的连击音效：快速上升音调
            const frequency = 330 + (t * 400);
            const envelope = Math.exp(-t * 2);
            const vibrato = 1 + 0.1 * Math.sin(2 * Math.PI * 8 * t);
            buffer[i] = Math.sin(2 * Math.PI * frequency * t * vibrato) * envelope * 0.4;
        }

        return { buffer, sampleRate };
    }

    // 生成交换音效数据
    generateSwapSound() {
        const sampleRate = 44100;
        const duration = 0.2;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            // 创建轻快的交换音效
            const frequency = 660;
            const envelope = Math.exp(-t * 8);
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
        }

        return { buffer, sampleRate };
    }

    // 生成无效移动音效数据
    generateInvalidSound() {
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            // 创建低沉的错误音效
            const frequency = 150 - (t * 50);
            const envelope = Math.exp(-t * 4);
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
        }

        return { buffer, sampleRate };
    }

    // 生成游戏结束音效数据
    generateGameOverSound() {
        const sampleRate = 44100;
        const duration = 1.0;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            // 创建下降的游戏结束音效
            const frequency = 440 - (t * 200);
            const envelope = Math.exp(-t * 1.5);
            buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
        }

        return { buffer, sampleRate };
    }

    // 创建音频缓冲区
    async createAudioBuffer(soundData) {
        if (!this.audioContext) {
            throw new Error('Audio context not initialized');
        }

        const audioBuffer = this.audioContext.createBuffer(
            1, // 单声道
            soundData.buffer.length,
            soundData.sampleRate
        );

        audioBuffer.copyToChannel(soundData.buffer, 0);
        return audioBuffer;
    }

    // 播放音效
    async playSound(type, volume = 1.0) {
        console.log(`playSound called - type: ${type}, isMuted: ${this.isMuted}`);
        
        // 如果静音，直接返回
        if (this.isMuted) {
            console.log('Sound blocked - muted');
            return;
        }
        
        // 如果未初始化，尝试初始化（用户交互时）
        if (!this.isInitialized) {
            await this.initializeAudio();
        }
        
        // 初始化失败或音频上下文不可用
        if (!this.isInitialized || !this.audioContext) {
            console.log('Sound blocked - not initialized');
            return;
        }

        const audioBuffer = this.sounds.get(type);
        if (!audioBuffer) {
            console.warn(`Sound ${type} not found`);
            return;
        }

        try {
            // 恢复音频上下文（如果被暂停）
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // 创建音频源
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // 设置音量
            gainNode.gain.value = this.volume * volume;

            // 播放音效
            source.start();

            // 清理资源
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };

        } catch (error) {
            console.warn(`Failed to play sound ${type}:`, error);
        }
    }

    // 播放匹配音效
    playMatch() {
        this.playSound(SOUND_TYPES.MATCH);
    }

    // 播放连击音效
    playCombo() {
        this.playSound(SOUND_TYPES.COMBO, 1.2);
    }

    // 播放交换音效
    playSwap() {
        this.playSound(SOUND_TYPES.SWAP, 0.8);
    }

    // 播放无效移动音效
    playInvalid() {
        this.playSound(SOUND_TYPES.INVALID);
    }

    // 播放游戏结束音效
    playGameOver() {
        this.playSound(SOUND_TYPES.GAME_OVER);
    }

    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 保存到本地存储
        try {
            const settings = this.loadSettings();
            settings.volume = this.volume;
            this.saveSettings(settings);
        } catch (error) {
            console.warn('Failed to save volume setting:', error);
        }
    }

    // 设置默认音量（不保存到本地存储）
    setDefaultVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        console.log('Default volume set to:', this.volume);
    }

    // 获取音量
    getVolume() {
        return this.volume;
    }

    // 切换静音状态
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // 保存到本地存储
        try {
            const settings = {
                soundEnabled: !this.isMuted,
                volume: this.volume,
                animationsEnabled: true,
                showHints: true
            };
            this.saveSettings(settings);
        } catch (error) {
            console.warn('Failed to save mute setting:', error);
        }
        
        return this.isMuted;
    }

    // 设置静音状态
    setMuted(muted) {
        this.isMuted = muted;
        
        try {
            const settings = this.loadSettings();
            settings.soundEnabled = !this.isMuted;
            this.saveSettings(settings);
        } catch (error) {
            console.warn('Failed to save mute setting:', error);
        }
    }

    // 检查是否静音
    isMutedState() {
        return this.isMuted;
    }

    // 加载音频设置
    loadSettings() {
        try {
            // Check if localStorage is available
            if (typeof localStorage === 'undefined' || !localStorage) {
                return DEFAULT_SETTINGS;
            }
            
            const saved = localStorage.getItem('ghostMatch_audioSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.volume = settings.volume ?? DEFAULT_SETTINGS.volume;
                this.isMuted = !settings.soundEnabled ?? !DEFAULT_SETTINGS.soundEnabled;
                return settings;
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
        
        return DEFAULT_SETTINGS;
    }

    // 保存音频设置
    saveSettings(settings) {
        try {
            // Check if localStorage is available
            if (typeof localStorage === 'undefined' || !localStorage) {
                return;
            }
            
            localStorage.setItem('ghostMatch_audioSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save audio settings:', error);
        }
    }

    // 获取音频系统状态
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isMuted: this.isMuted,
            volume: this.volume,
            soundsLoaded: this.sounds.size,
            audioContextState: this.audioContext?.state || 'not-initialized'
        };
    }

    // 预加载音效（用户交互后调用）
    async preloadSounds() {
        // 初始化音频系统
        await this.initializeAudio();
        
        // 确保音频上下文已激活
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed after user interaction');
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
            }
        }
    }

    // 暂停所有音效
    pauseAll() {
        if (this.audioContext && this.audioContext.state === 'running') {
            try {
                this.audioContext.suspend();
            } catch (error) {
                console.warn('Failed to pause audio:', error);
            }
        }
    }

    // 恢复所有音效
    resumeAll() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                this.audioContext.resume();
            } catch (error) {
                console.warn('Failed to resume audio:', error);
            }
        }
    }

    // 重置音频系统
    reset() {
        // 停止所有正在播放的音效
        if (this.audioContext) {
            try {
                // 创建新的音频上下文来停止所有音效
                this.audioContext.close();
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.warn('Failed to reset audio context:', error);
            }
        }
    }

    // 清理资源
    destroy() {
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                console.warn('Failed to close audio context:', error);
            }
        }
        
        this.sounds.clear();
        this.audioContext = null;
        this.isInitialized = false;
    }
}