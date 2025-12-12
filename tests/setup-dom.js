// DOM setup for Node.js testing environment

// Mock DOM environment for Node.js testing
if (typeof document === 'undefined') {
    global.document = {
        getElementById: (id) => {
            if (id === 'game-container') {
                return {
                    id: 'game-container',
                    innerHTML: '',
                    appendChild: () => {},
                    classList: { 
                        add: () => {}, 
                        remove: () => {},
                        contains: () => false,
                        toggle: () => {}
                    },
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    dispatchEvent: () => {},
                    style: { cssText: '' },
                    children: [],
                    childNodes: [],
                    querySelector: () => null,
                    querySelectorAll: () => []
                };
            }
            return {
                innerHTML: '',
                appendChild: () => {},
                classList: { add: () => {}, remove: () => {} },
                addEventListener: () => {},
                dispatchEvent: () => {}
            };
        },
        querySelector: () => ({
            innerHTML: '',
            appendChild: () => {},
            classList: { add: () => {}, remove: () => {} },
            addEventListener: () => {},
            dispatchEvent: () => {}
        }),
        createElement: (tagName) => ({
            tagName: tagName.toUpperCase(),
            className: '',
            style: { cssText: '' },
            textContent: '',
            innerHTML: '',
            classList: { 
                add: () => {}, 
                remove: () => {},
                contains: () => false,
                toggle: () => {}
            },
            appendChild: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            replaceWith: () => {},
            cloneNode: () => ({
                addEventListener: () => {},
                classList: { add: () => {}, remove: () => {} }
            }),
            parentNode: {
                removeChild: () => {}
            },
            setAttribute: () => {},
            getAttribute: () => null,
            removeAttribute: () => {},
            hasAttribute: () => false,
            dataset: {},
            children: [],
            childNodes: []
        }),
        addEventListener: () => {},
        removeEventListener: () => {},
        body: { 
            appendChild: () => {},
            removeChild: () => {}
        }
    };
}

if (typeof window === 'undefined') {
    global.window = {
        requestAnimationFrame: (callback) => setTimeout(callback, 16),
        cancelAnimationFrame: (id) => clearTimeout(id),
        addEventListener: () => {},
        removeEventListener: () => {},
        confirm: () => true,
        eval: eval,
        location: { reload: () => {} },
        querySelector: () => ({
            innerHTML: '',
            appendChild: () => {},
            classList: { add: () => {}, remove: () => {} },
            addEventListener: () => {},
            dispatchEvent: () => {}
        }),
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        },
        navigator: {
            vibrate: () => true
        },
        AudioContext: class MockAudioContext {
            constructor() {
                this.state = 'running';
                this.destination = {};
            }
            
            createBuffer() {
                return {
                    copyToChannel: () => {}
                };
            }
            
            createBufferSource() {
                return {
                    buffer: null,
                    connect: () => {},
                    disconnect: () => {},
                    start: () => {},
                    onended: null
                };
            }
            
            createGain() {
                return {
                    gain: { value: 1 },
                    connect: () => {},
                    disconnect: () => {}
                };
            }
            
            resume() {
                return Promise.resolve();
            }
            
            close() {
                return Promise.resolve();
            }
        },
        webkitAudioContext: class MockAudioContext {
            constructor() {
                this.state = 'running';
                this.destination = {};
            }
            
            createBuffer() {
                return {
                    copyToChannel: () => {}
                };
            }
            
            createBufferSource() {
                return {
                    buffer: null,
                    connect: () => {},
                    disconnect: () => {},
                    start: () => {},
                    onended: null
                };
            }
            
            createGain() {
                return {
                    gain: { value: 1 },
                    connect: () => {},
                    disconnect: () => {}
                };
            }
            
            resume() {
                return Promise.resolve();
            }
            
            close() {
                return Promise.resolve();
            }
        }
    };
}

if (typeof performance === 'undefined') {
    global.performance = {
        now: () => Date.now(),
        memory: {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024
        },
        timing: {
            loadEventEnd: Date.now(),
            navigationStart: Date.now() - 1000,
            domContentLoadedEventEnd: Date.now() - 500
        }
    };
}

// Mock Element constructor
if (typeof Element === 'undefined') {
    global.Element = class MockElement {
        constructor() {
            this.classList = { add: () => {}, remove: () => {} };
            this.addEventListener = () => {};
            this.removeEventListener = () => {};
        }
    };
    
    // Set prototype properties without assignment
    Object.defineProperty(global.Element.prototype, 'classList', {
        value: { add: () => {}, remove: () => {} },
        writable: true,
        configurable: true
    });
    
    Object.defineProperty(global.Element.prototype, 'addEventListener', {
        value: () => {},
        writable: true,
        configurable: true
    });
    
    Object.defineProperty(global.Element.prototype, 'removeEventListener', {
        value: () => {},
        writable: true,
        configurable: true
    });
}

// Mock AudioContext for audio tests
if (typeof AudioContext === 'undefined') {
    global.AudioContext = class MockAudioContext {
        constructor() {
            this.state = 'running';
            this.destination = {};
        }
        
        createBuffer() {
            return {
                copyToChannel: () => {}
            };
        }
        
        createBufferSource() {
            return {
                buffer: null,
                connect: () => {},
                disconnect: () => {},
                start: () => {},
                onended: null
            };
        }
        
        createGain() {
            return {
                gain: { value: 1 },
                connect: () => {},
                disconnect: () => {}
            };
        }
        
        resume() {
            return Promise.resolve();
        }
        
        close() {
            return Promise.resolve();
        }
    };
    
    global.webkitAudioContext = global.AudioContext;
}

// Mock localStorage
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    };
}

export default {};