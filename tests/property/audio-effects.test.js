// Property 13: 音效触发一致性 - Verifies: Requirements 7.1, 7.2, 7.5

import fc from 'fast-check';
import { AudioManager } from '../../js/components/AudioManager.js';
import { SOUND_TYPES } from '../../js/constants.js';

// Mock browser environment for testing
if (typeof window === 'undefined') {
    global.window = {
        AudioContext: class MockAudioContext {
            constructor() {
                this.state = 'running';
                this.destination = {};
            }
            createBuffer() { return { copyToChannel: () => {} }; }
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
        },
        webkitAudioContext: class MockWebkitAudioContext {
            constructor() {
                this.state = 'running';
                this.destination = {};
            }
            createBuffer() { return { copyToChannel: () => {} }; }
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
    
    global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    };
}

export default async function runPropertyTests() {
    const results = [];
    
    // Property 13: 音效触发一致性
    // For any game event (elimination, combo, game over), corresponding sound effects should be triggered correctly
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(...Object.values(SOUND_TYPES)), // sound type
                fc.float({ min: 0, max: 1 }), // volume level
                fc.boolean(), // muted state
                (soundType, volume, isMuted) => {
                    const audioManager = new AudioManager();
                    
                    // Set up audio manager state
                    audioManager.setVolume(volume);
                    audioManager.setMuted(isMuted);
                    
                    // Track if sound was attempted to be played
                    let soundPlayAttempted = false;
                    let playedSoundType = null;
                    let playedVolume = null;
                    
                    // Mock the playSound method to track calls
                    const originalPlaySound = audioManager.playSound.bind(audioManager);
                    audioManager.playSound = function(type, vol = 1.0) {
                        soundPlayAttempted = true;
                        playedSoundType = type;
                        playedVolume = vol;
                        
                        // Don't actually play sound in tests, but verify parameters
                        return;
                    };
                    
                    // Test each sound type method
                    switch (soundType) {
                        case SOUND_TYPES.MATCH:
                            audioManager.playMatch();
                            break;
                        case SOUND_TYPES.COMBO:
                            audioManager.playCombo();
                            break;
                        case SOUND_TYPES.SWAP:
                            audioManager.playSwap();
                            break;
                        case SOUND_TYPES.INVALID:
                            audioManager.playInvalid();
                            break;
                        case SOUND_TYPES.GAME_OVER:
                            audioManager.playGameOver();
                            break;
                    }
                    
                    // Property: Sound should be attempted to play if not muted
                    if (!isMuted && !soundPlayAttempted) {
                        console.log(`Sound ${soundType} should have been attempted when not muted`);
                        return false;
                    }
                    
                    // Property: Correct sound type should be played
                    if (!isMuted && playedSoundType !== soundType) {
                        console.log(`Expected sound type: ${soundType}, actual: ${playedSoundType}`);
                        return false;
                    }
                    
                    // Property: Volume should be within valid range
                    if (!isMuted && (playedVolume < 0 || playedVolume > 2)) {
                        console.log(`Volume out of range: ${playedVolume}`);
                        return false;
                    }
                    
                    // Property: Audio manager volume should match set volume
                    if (Math.abs(audioManager.getVolume() - volume) > 0.001) {
                        console.log(`Expected volume: ${volume}, actual: ${audioManager.getVolume()}`);
                        return false;
                    }
                    
                    // Property: Muted state should match set state
                    if (audioManager.isMutedState() !== isMuted) {
                        console.log(`Expected muted: ${isMuted}, actual: ${audioManager.isMutedState()}`);
                        return false;
                    }
                    
                    // Restore original method
                    audioManager.playSound = originalPlaySound;
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: 13,
            name: "音效触发一致性",
            passed: true,
            iterations: 100,
            message: "Audio effects are triggered consistently for all game events"
        });
    } catch (error) {
        results.push({
            property: 13,
            name: "音效触发一致性",
            passed: false,
            message: "Audio effect triggering is inconsistent",
            details: error.message
        });
    }

    // Additional property: Volume control consistency
    try {
        await fc.assert(
            fc.property(
                fc.float({ min: 0, max: 1 }), // initial volume
                fc.float({ min: 0, max: 1 }), // new volume
                (initialVolume, newVolume) => {
                    const audioManager = new AudioManager();
                    
                    // Set initial volume
                    audioManager.setVolume(initialVolume);
                    
                    // Property: Volume should be set correctly
                    if (Math.abs(audioManager.getVolume() - initialVolume) > 0.001) {
                        console.log(`Initial volume not set correctly: expected ${initialVolume}, got ${audioManager.getVolume()}`);
                        return false;
                    }
                    
                    // Change volume
                    audioManager.setVolume(newVolume);
                    
                    // Property: New volume should be set correctly
                    if (Math.abs(audioManager.getVolume() - newVolume) > 0.001) {
                        console.log(`New volume not set correctly: expected ${newVolume}, got ${audioManager.getVolume()}`);
                        return false;
                    }
                    
                    // Property: Volume should be clamped to valid range
                    const clampedVolume = Math.max(0, Math.min(1, newVolume));
                    if (Math.abs(audioManager.getVolume() - clampedVolume) > 0.001) {
                        console.log(`Volume not clamped correctly: expected ${clampedVolume}, got ${audioManager.getVolume()}`);
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "音量控制一致性",
            passed: true,
            iterations: 100,
            message: "Volume control works consistently within valid ranges"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "音量控制一致性",
            passed: false,
            message: "Volume control is inconsistent",
            details: error.message
        });
    }

    // Additional property: Mute state consistency
    try {
        await fc.assert(
            fc.property(
                fc.boolean(), // initial mute state
                fc.integer({ min: 0, max: 10 }), // number of toggles
                (initialMuted, toggleCount) => {
                    const audioManager = new AudioManager();
                    
                    // Set initial mute state
                    audioManager.setMuted(initialMuted);
                    
                    // Property: Initial mute state should be set correctly
                    if (audioManager.isMutedState() !== initialMuted) {
                        console.log(`Initial mute state not set correctly: expected ${initialMuted}, got ${audioManager.isMutedState()}`);
                        return false;
                    }
                    
                    let expectedMuted = initialMuted;
                    
                    // Toggle mute state multiple times
                    for (let i = 0; i < toggleCount; i++) {
                        const newMuted = audioManager.toggleMute();
                        expectedMuted = !expectedMuted;
                        
                        // Property: Toggle should return correct new state
                        if (newMuted !== expectedMuted) {
                            console.log(`Toggle returned wrong state: expected ${expectedMuted}, got ${newMuted}`);
                            return false;
                        }
                        
                        // Property: Internal state should match returned state
                        if (audioManager.isMutedState() !== expectedMuted) {
                            console.log(`Internal mute state inconsistent: expected ${expectedMuted}, got ${audioManager.isMutedState()}`);
                            return false;
                        }
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "静音状态一致性",
            passed: true,
            iterations: 100,
            message: "Mute state toggles and tracking work consistently"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "静音状态一致性",
            passed: false,
            message: "Mute state handling is inconsistent",
            details: error.message
        });
    }

    // Additional property: Audio system initialization
    try {
        await fc.assert(
            fc.property(
                fc.constantFrom(1),
                () => {
                    const audioManager = new AudioManager();
                    
                    // Property: Audio manager should have valid initial state
                    const status = audioManager.getStatus();
                    
                    if (typeof status.isInitialized !== 'boolean') {
                        console.log('isInitialized should be boolean');
                        return false;
                    }
                    
                    if (typeof status.isMuted !== 'boolean') {
                        console.log('isMuted should be boolean');
                        return false;
                    }
                    
                    if (typeof status.volume !== 'number' || status.volume < 0 || status.volume > 1) {
                        console.log('volume should be number between 0 and 1');
                        return false;
                    }
                    
                    if (typeof status.soundsLoaded !== 'number' || status.soundsLoaded < 0) {
                        console.log('soundsLoaded should be non-negative number');
                        return false;
                    }
                    
                    if (typeof status.audioContextState !== 'string') {
                        console.log('audioContextState should be string');
                        return false;
                    }
                    
                    // Property: Volume should be within valid range
                    if (audioManager.getVolume() < 0 || audioManager.getVolume() > 1) {
                        console.log('Initial volume out of range');
                        return false;
                    }
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "音频系统初始化",
            passed: true,
            iterations: 100,
            message: "Audio system initializes with valid state"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "音频系统初始化",
            passed: false,
            message: "Audio system initialization failed",
            details: error.message
        });
    }

    // Additional property: Error handling consistency
    try {
        await fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 20 }), // invalid sound type
                (invalidSoundType) => {
                    // Skip if it's actually a valid sound type
                    if (Object.values(SOUND_TYPES).includes(invalidSoundType)) {
                        return true;
                    }
                    
                    const audioManager = new AudioManager();
                    
                    // Mock console.warn to track error handling
                    let warningLogged = false;
                    const originalWarn = console.warn;
                    console.warn = function(...args) {
                        if (args[0] && args[0].includes('not found')) {
                            warningLogged = true;
                        }
                    };
                    
                    // Try to play invalid sound type
                    audioManager.playSound(invalidSoundType);
                    
                    // Property: Should handle invalid sound types gracefully
                    // (This is tested by ensuring no exceptions are thrown)
                    
                    // Restore console.warn
                    console.warn = originalWarn;
                    
                    return true;
                }
            ),
            { numRuns: 100, timeout: 5000 }
        );
        
        results.push({
            property: "Bonus",
            name: "错误处理一致性",
            passed: true,
            iterations: 100,
            message: "Audio system handles errors gracefully"
        });
    } catch (error) {
        results.push({
            property: "Bonus",
            name: "错误处理一致性",
            passed: false,
            message: "Audio system error handling failed",
            details: error.message
        });
    }

    // Return overall result
    const allPassed = results.every(r => r.passed);
    const failedCount = results.filter(r => !r.passed).length;
    
    return {
        passed: allPassed,
        message: allPassed ? 
            `All ${results.length} audio system properties verified` : 
            `${failedCount} of ${results.length} properties failed`,
        iterations: 100,
        details: results.map(r => `${r.property}: ${r.name} - ${r.passed ? '✅' : '❌'}`).join('\n'),
        results: results
    };
}