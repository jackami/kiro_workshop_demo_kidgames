// Unit tests for AudioManager class

import { AudioManager } from '../../js/components/AudioManager.js';
import { SOUND_TYPES, DEFAULT_SETTINGS } from '../../js/constants.js';

// Mock browser environment for testing
if (typeof window === 'undefined') {
    global.window = {
        AudioContext: class MockAudioContext {
            constructor() {
                this.state = 'running';
                this.destination = {};
            }
            createBuffer(channels, length, sampleRate) { 
                return { 
                    copyToChannel: () => {},
                    length: length,
                    sampleRate: sampleRate
                }; 
            }
            createBufferSource() { 
                return { 
                    buffer: null, 
                    connect: () => {}, 
                    start: () => {},
                    onended: null,
                    disconnect: () => {}
                }; 
            }
            createGain() { 
                return { 
                    gain: { value: 1 }, 
                    connect: () => {},
                    disconnect: () => {}
                }; 
            }
            resume() { return Promise.resolve(); }
            close() { return Promise.resolve(); }
        }
    };
}

export default async function runTests() {
    const results = [];
    
    // Test 1: Constructor initialization
    try {
        const audioManager = new AudioManager();
        
        if (typeof audioManager.volume !== 'number') {
            throw new Error('Volume should be initialized as number');
        }
        
        if (typeof audioManager.isMuted !== 'boolean') {
            throw new Error('isMuted should be initialized as boolean');
        }
        
        if (!(audioManager.sounds instanceof Map)) {
            throw new Error('Sounds should be initialized as Map');
        }
        
        if (typeof audioManager.isInitialized !== 'boolean') {
            throw new Error('isInitialized should be boolean');
        }
        
        results.push({ name: 'Constructor initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Constructor initialization', passed: false, error: error.message });
    }

    // Test 2: Volume control
    try {
        const audioManager = new AudioManager();
        
        // Test setting valid volume
        audioManager.setVolume(0.5);
        if (audioManager.getVolume() !== 0.5) {
            throw new Error(`Expected volume 0.5, got ${audioManager.getVolume()}`);
        }
        
        // Test volume clamping - too high
        audioManager.setVolume(1.5);
        if (audioManager.getVolume() !== 1) {
            throw new Error(`Volume should be clamped to 1, got ${audioManager.getVolume()}`);
        }
        
        // Test volume clamping - too low
        audioManager.setVolume(-0.5);
        if (audioManager.getVolume() !== 0) {
            throw new Error(`Volume should be clamped to 0, got ${audioManager.getVolume()}`);
        }
        
        results.push({ name: 'Volume control', passed: true });
    } catch (error) {
        results.push({ name: 'Volume control', passed: false, error: error.message });
    }

    // Test 3: Mute functionality
    try {
        const audioManager = new AudioManager();
        
        // Test initial mute state
        const initialMuted = audioManager.isMutedState();
        
        // Test toggle mute
        const newMuted = audioManager.toggleMute();
        if (newMuted === initialMuted) {
            throw new Error('Toggle mute should change state');
        }
        
        if (audioManager.isMutedState() !== newMuted) {
            throw new Error('Internal mute state should match returned state');
        }
        
        // Test set muted
        audioManager.setMuted(true);
        if (!audioManager.isMutedState()) {
            throw new Error('setMuted(true) should set muted to true');
        }
        
        audioManager.setMuted(false);
        if (audioManager.isMutedState()) {
            throw new Error('setMuted(false) should set muted to false');
        }
        
        results.push({ name: 'Mute functionality', passed: true });
    } catch (error) {
        results.push({ name: 'Mute functionality', passed: false, error: error.message });
    }

    // Test 4: Sound generation methods
    try {
        const audioManager = new AudioManager();
        
        // Test that sound generation methods exist and return valid data
        const matchSound = audioManager.generateMatchSound();
        if (!matchSound || !matchSound.buffer || !matchSound.sampleRate) {
            throw new Error('generateMatchSound should return valid sound data');
        }
        
        const comboSound = audioManager.generateComboSound();
        if (!comboSound || !comboSound.buffer || !comboSound.sampleRate) {
            throw new Error('generateComboSound should return valid sound data');
        }
        
        const swapSound = audioManager.generateSwapSound();
        if (!swapSound || !swapSound.buffer || !swapSound.sampleRate) {
            throw new Error('generateSwapSound should return valid sound data');
        }
        
        const invalidSound = audioManager.generateInvalidSound();
        if (!invalidSound || !invalidSound.buffer || !invalidSound.sampleRate) {
            throw new Error('generateInvalidSound should return valid sound data');
        }
        
        const gameOverSound = audioManager.generateGameOverSound();
        if (!gameOverSound || !gameOverSound.buffer || !gameOverSound.sampleRate) {
            throw new Error('generateGameOverSound should return valid sound data');
        }
        
        results.push({ name: 'Sound generation methods', passed: true });
    } catch (error) {
        results.push({ name: 'Sound generation methods', passed: false, error: error.message });
    }

    // Test 5: Sound playing methods
    try {
        const audioManager = new AudioManager();
        
        // Mock playSound to track calls
        let playedSounds = [];
        audioManager.playSound = function(type, volume) {
            playedSounds.push({ type, volume });
        };
        
        // Test individual sound methods
        audioManager.playMatch();
        audioManager.playCombo();
        audioManager.playSwap();
        audioManager.playInvalid();
        audioManager.playGameOver();
        
        if (playedSounds.length !== 5) {
            throw new Error(`Expected 5 sound calls, got ${playedSounds.length}`);
        }
        
        // Verify correct sound types were called
        const expectedTypes = [
            SOUND_TYPES.MATCH,
            SOUND_TYPES.COMBO,
            SOUND_TYPES.SWAP,
            SOUND_TYPES.INVALID,
            SOUND_TYPES.GAME_OVER
        ];
        
        for (let i = 0; i < expectedTypes.length; i++) {
            if (playedSounds[i].type !== expectedTypes[i]) {
                throw new Error(`Expected sound type ${expectedTypes[i]}, got ${playedSounds[i].type}`);
            }
        }
        
        results.push({ name: 'Sound playing methods', passed: true });
    } catch (error) {
        results.push({ name: 'Sound playing methods', passed: false, error: error.message });
    }

    // Test 6: Settings persistence with localStorage available
    try {
        // Mock localStorage
        const mockStorage = {};
        global.localStorage = {
            getItem: (key) => mockStorage[key] || null,
            setItem: (key, value) => { mockStorage[key] = value; },
            removeItem: (key) => { delete mockStorage[key]; }
        };
        
        const audioManager = new AudioManager();
        
        // Test saving settings
        const testSettings = {
            volume: 0.8,
            soundEnabled: false
        };
        
        audioManager.saveSettings(testSettings);
        
        // Verify settings were saved
        const savedData = mockStorage['ghostMatch_audioSettings'];
        if (!savedData) {
            throw new Error('Settings should be saved to localStorage');
        }
        
        const parsedSettings = JSON.parse(savedData);
        if (parsedSettings.volume !== 0.8 || parsedSettings.soundEnabled !== false) {
            throw new Error('Saved settings should match input');
        }
        
        // Test loading settings
        const loadedSettings = audioManager.loadSettings();
        if (loadedSettings.volume !== 0.8 || loadedSettings.soundEnabled !== false) {
            throw new Error('Loaded settings should match saved settings');
        }
        
        results.push({ name: 'Settings persistence with localStorage', passed: true });
    } catch (error) {
        results.push({ name: 'Settings persistence with localStorage', passed: false, error: error.message });
    }

    // Test 7: Settings handling without localStorage (NEW TEST FOR CHANGES)
    try {
        // Remove localStorage to test the new availability checks
        const originalLocalStorage = global.localStorage;
        global.localStorage = undefined;
        
        const audioManager = new AudioManager();
        
        // Test loading settings without localStorage
        const loadedSettings = audioManager.loadSettings();
        
        // Should return DEFAULT_SETTINGS when localStorage is unavailable
        if (loadedSettings.volume !== DEFAULT_SETTINGS.volume) {
            throw new Error(`Expected default volume ${DEFAULT_SETTINGS.volume}, got ${loadedSettings.volume}`);
        }
        
        if (loadedSettings.soundEnabled !== DEFAULT_SETTINGS.soundEnabled) {
            throw new Error(`Expected default soundEnabled ${DEFAULT_SETTINGS.soundEnabled}, got ${loadedSettings.soundEnabled}`);
        }
        
        // Test saving settings without localStorage (should not throw)
        const testSettings = { volume: 0.5, soundEnabled: true };
        audioManager.saveSettings(testSettings); // Should complete without error
        
        // Restore localStorage
        global.localStorage = originalLocalStorage;
        
        results.push({ name: 'Settings handling without localStorage', passed: true });
    } catch (error) {
        results.push({ name: 'Settings handling without localStorage', passed: false, error: error.message });
    }

    // Test 8: Settings handling with null localStorage (NEW TEST FOR CHANGES)
    try {
        // Set localStorage to null to test the new availability checks
        const originalLocalStorage = global.localStorage;
        global.localStorage = null;
        
        const audioManager = new AudioManager();
        
        // Test loading settings with null localStorage
        const loadedSettings = audioManager.loadSettings();
        
        // Should return DEFAULT_SETTINGS when localStorage is null
        if (loadedSettings.volume !== DEFAULT_SETTINGS.volume) {
            throw new Error(`Expected default volume ${DEFAULT_SETTINGS.volume}, got ${loadedSettings.volume}`);
        }
        
        // Test saving settings with null localStorage (should not throw)
        const testSettings = { volume: 0.3, soundEnabled: false };
        audioManager.saveSettings(testSettings); // Should complete without error
        
        // Restore localStorage
        global.localStorage = originalLocalStorage;
        
        results.push({ name: 'Settings handling with null localStorage', passed: true });
    } catch (error) {
        results.push({ name: 'Settings handling with null localStorage', passed: false, error: error.message });
    }

    // Test 9: Audio status reporting
    try {
        const audioManager = new AudioManager();
        
        const status = audioManager.getStatus();
        
        // Verify all required status fields
        const requiredFields = ['isInitialized', 'isMuted', 'volume', 'soundsLoaded', 'audioContextState'];
        
        for (const field of requiredFields) {
            if (!(field in status)) {
                throw new Error(`Status should include ${field}`);
            }
        }
        
        // Verify field types
        if (typeof status.isInitialized !== 'boolean') {
            throw new Error('isInitialized should be boolean');
        }
        
        if (typeof status.isMuted !== 'boolean') {
            throw new Error('isMuted should be boolean');
        }
        
        if (typeof status.volume !== 'number') {
            throw new Error('volume should be number');
        }
        
        if (typeof status.soundsLoaded !== 'number') {
            throw new Error('soundsLoaded should be number');
        }
        
        if (typeof status.audioContextState !== 'string') {
            throw new Error('audioContextState should be string');
        }
        
        results.push({ name: 'Audio status reporting', passed: true });
    } catch (error) {
        results.push({ name: 'Audio status reporting', passed: false, error: error.message });
    }

    // Test 10: Error handling in settings operations
    try {
        // Mock localStorage that throws errors
        global.localStorage = {
            getItem: () => { throw new Error('Storage error'); },
            setItem: () => { throw new Error('Storage error'); }
        };
        
        const audioManager = new AudioManager();
        
        // Test that loadSettings handles errors gracefully
        const loadedSettings = audioManager.loadSettings();
        
        // Should return DEFAULT_SETTINGS when localStorage throws
        if (loadedSettings.volume !== DEFAULT_SETTINGS.volume) {
            throw new Error('Should return default settings on error');
        }
        
        // Test that saveSettings handles errors gracefully (should not throw)
        audioManager.saveSettings({ volume: 0.5, soundEnabled: true });
        
        results.push({ name: 'Error handling in settings operations', passed: true });
    } catch (error) {
        results.push({ name: 'Error handling in settings operations', passed: false, error: error.message });
    }

    // Test 11: Audio context initialization
    try {
        const audioManager = new AudioManager();
        
        // Test preloadSounds method
        await audioManager.preloadSounds();
        
        // Should not throw and should complete
        const status = audioManager.getStatus();
        
        // After preload, should have some indication of initialization attempt
        if (typeof status.audioContextState !== 'string') {
            throw new Error('Audio context state should be reported');
        }
        
        results.push({ name: 'Audio context initialization', passed: true });
    } catch (error) {
        results.push({ name: 'Audio context initialization', passed: false, error: error.message });
    }

    // Test 12: Resource cleanup
    try {
        const audioManager = new AudioManager();
        
        // Initialize some state
        audioManager.setVolume(0.7);
        audioManager.setMuted(true);
        
        // Test destroy method
        audioManager.destroy();
        
        // Verify cleanup
        if (audioManager.sounds.size !== 0) {
            throw new Error('Sounds map should be cleared after destroy');
        }
        
        if (audioManager.audioContext !== null) {
            throw new Error('Audio context should be null after destroy');
        }
        
        if (audioManager.isInitialized !== false) {
            throw new Error('isInitialized should be false after destroy');
        }
        
        results.push({ name: 'Resource cleanup', passed: true });
    } catch (error) {
        results.push({ name: 'Resource cleanup', passed: false, error: error.message });
    }

    // Calculate overall result
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    return {
        passed: failed === 0,
        message: `AudioManager: ${passed} passed, ${failed} failed`,
        details: results.map(r => `${r.name}: ${r.passed ? '✅' : '❌' + (r.error ? ' - ' + r.error : '')}`).join('\n')
    };
}