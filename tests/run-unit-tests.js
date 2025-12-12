#!/usr/bin/env node

// 单元测试运行器 - 专门运行单元测试

// Import DOM setup first to ensure browser APIs are available
import './setup-dom.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UnitTestRunner {
    constructor() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = Date.now();
    }

    async runUnitTests() {
        console.log('🔧 Ghost Match Game - Unit Tests');
        console.log('================================\n');

        try {
            const unitDir = join(__dirname, 'unit');
            const files = await readdir(unitDir);
            const testFiles = files.filter(f => f.endsWith('.test.js'));
            
            if (testFiles.length === 0) {
                console.log('⚠️  No unit test files found');
                return;
            }

            console.log(`Found ${testFiles.length} unit test file(s)\n`);
            
            for (const file of testFiles) {
                const testPath = join(unitDir, file);
                await this.runUnitTestFile(testPath);
            }
            
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Unit test runner failed:', error);
            process.exit(1);
        }
    }

    async runUnitTestFile(testPath) {
        try {
            const testModule = await import(testPath);
            const testName = testPath.split('/').pop().replace('.test.js', '');
            
            console.log(`🔧 Running Unit Test: ${testName}`);
            console.log('─'.repeat(40));
            
            if (testModule.default && typeof testModule.default === 'function') {
                const result = await testModule.default();
                this.recordUnitResult(testName, result);
            } else if (testModule.runTests && typeof testModule.runTests === 'function') {
                const result = await testModule.runTests();
                this.recordUnitResult(testName, result);
            } else {
                console.log(`⚠️  No test function found in ${testName}\n`);
            }
        } catch (error) {
            console.log(`❌ Failed to run ${testPath}: ${error.message}\n`);
            this.failedTests++;
            this.totalTests++;
        }
    }

    recordUnitResult(testName, result) {
        this.totalTests++;
        
        if (result && result.passed) {
            this.passedTests++;
            console.log(`✅ ${testName} - ${result.message || 'All unit tests passed'}`);
            if (result.details) {
                console.log(`   Details:\n   ${result.details.replace(/\n/g, '\n   ')}`);
            }
        } else {
            this.failedTests++;
            console.log(`❌ ${testName} - ${result?.message || 'Unit tests failed'}`);
            if (result?.details) {
                console.log(`   Details:\n   ${result.details.replace(/\n/g, '\n   ')}`);
            }
        }
        console.log('');
    }

    printSummary() {
        const duration = Date.now() - this.startTime;
        
        console.log('================================');
        console.log('📊 Unit Test Summary');
        console.log('================================');
        console.log(`Total Test Suites: ${this.totalTests}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        
        if (this.failedTests === 0 && this.totalTests > 0) {
            console.log('\n🎉 All unit tests passed!');
            console.log('Individual component functionality is working correctly.');
            process.exit(0);
        } else if (this.totalTests === 0) {
            console.log('\n⚠️  No unit tests were found or executed.');
            process.exit(1);
        } else {
            console.log(`\n💥 ${this.failedTests} unit test suite(s) failed`);
            console.log('Some component functionality is not working correctly.');
            process.exit(1);
        }
    }
}

// 运行单元测试
const runner = new UnitTestRunner();
runner.runUnitTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});