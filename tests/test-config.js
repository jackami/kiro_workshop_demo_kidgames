// 测试配置文件

export const TEST_CONFIG = {
    // Property-based testing configuration
    PROPERTY_TEST_RUNS: 100,
    PROPERTY_TEST_TIMEOUT: 5000,
    
    // Unit test configuration
    UNIT_TEST_TIMEOUT: 2000,
    
    // Integration test configuration
    INTEGRATION_TEST_TIMEOUT: 10000,
    
    // Test environment
    HEADLESS: true,
    VERBOSE: false
};

// Test utilities
export class TestUtils {
    static createMockGameBoard(width = 8, height = 8) {
        const grid = [];
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                grid[y][x] = null;
            }
        }
        return { grid, width, height };
    }

    static createMockGhost(type, x, y) {
        return {
            type: type,
            color: `color-${type}`,
            sprite: `sprite-${type}`,
            x: x,
            y: y
        };
    }

    static fillGridWithPattern(grid, pattern) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const type = pattern[y % pattern.length][x % pattern[0].length];
                grid[y][x] = type !== null ? this.createMockGhost(type, x, y) : null;
            }
        }
    }

    static logTestResult(testName, passed, details = '') {
        const status = passed ? '✓' : '✗';
        const color = passed ? '\x1b[32m' : '\x1b[31m';
        console.log(`${color}${status} ${testName}\x1b[0m ${details}`);
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Property test generators (will be used with fast-check)
export class PropertyGenerators {
    static ghostType() {
        // Will be implemented when fast-check is available
        return Math.floor(Math.random() * 5);
    }

    static position(maxX = 7, maxY = 7) {
        return {
            x: Math.floor(Math.random() * (maxX + 1)),
            y: Math.floor(Math.random() * (maxY + 1))
        };
    }

    static gameBoard(width = 8, height = 8) {
        const board = TestUtils.createMockGameBoard(width, height);
        
        // Fill with random ghosts
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() > 0.1) { // 90% chance of having a ghost
                    board.grid[y][x] = TestUtils.createMockGhost(
                        this.ghostType(), x, y
                    );
                }
            }
        }
        
        return board;
    }
}