#!/usr/bin/env node

// 主测试运行器 - 运行所有测试套件

// Import DOM setup first to ensure browser APIs are available
import './setup-dom.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
    constructor() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🧪 Ghost Match Game - Test Suite');
        console.log('================================\n');

        try {
            // 运行属性测试
            await this.runPropertyTests();
            
            // 运行单元测试
            await this.runUnitTests();
            
            // 运行集成测试
            await this.runIntegrationTests();
            
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Test runner failed:', error);
            process.exit(1);
        }
    }

    async runPropertyTests() {
        console.log('📋 Running Property-Based Tests...\n');
        
        try {
            const propertyDir = join(__dirname, 'property');
            const files = await readdir(propertyDir);
            const testFiles = files.filter(f => f.endsWith('.test.js'));
            
            for (const file of testFiles) {
                const testPath = join(propertyDir, file);
                await this.runTestFile(testPath, 'Property');
            }
        } catch (error) {
            console.log('⚠️  No property tests found or error loading them');
        }
    }

    async runUnitTests() {
        console.log('\n🔧 Running Unit Tests...\n');
        
        try {
            const unitDir = join(__dirname, 'unit');
            const files = await readdir(unitDir);
            const testFiles = files.filter(f => f.endsWith('.test.js'));
            
            for (const file of testFiles) {
                const testPath = join(unitDir, file);
                await this.runTestFile(testPath, 'Unit');
            }
        } catch (error) {
            console.log('⚠️  No unit tests found or error loading them');
        }
    }

    async runIntegrationTests() {
        console.log('\n🔗 Running Integration Tests...\n');
        
        try {
            const integrationDir = join(__dirname, 'integration');
            const files = await readdir(integrationDir);
            const testFiles = files.filter(f => f.endsWith('.test.js'));
            
            for (const file of testFiles) {
                const testPath = join(integrationDir, file);
                await this.runTestFile(testPath, 'Integration');
            }
        } catch (error) {
            console.log('⚠️  No integration tests found or error loading them');
        }
    }

    async runTestFile(testPath, category) {
        try {
            const testModule = await import(testPath);
            const testName = testPath.split('/').pop().replace('.test.js', '');
            
            console.log(`  Running ${category}: ${testName}`);
            
            if (testModule.default && typeof testModule.default === 'function') {
                const result = await testModule.default();
                this.recordTestResult(testName, result);
            } else if (testModule.runTests && typeof testModule.runTests === 'function') {
                const result = await testModule.runTests();
                this.recordTestResult(testName, result);
            } else {
                console.log(`    ⚠️  No test function found in ${testName}`);
            }
        } catch (error) {
            console.log(`    ❌ Failed to run ${testPath}: ${error.message}`);
            this.failedTests++;
            this.totalTests++;
        }
    }

    recordTestResult(testName, result) {
        this.totalTests++;
        
        if (result && result.passed) {
            this.passedTests++;
            console.log(`    ✅ ${testName} - ${result.message || 'Passed'}`);
        } else {
            this.failedTests++;
            console.log(`    ❌ ${testName} - ${result?.message || 'Failed'}`);
            if (result?.details) {
                console.log(`       ${result.details}`);
            }
        }
    }

    printSummary() {
        const duration = Date.now() - this.startTime;
        
        console.log('\n================================');
        console.log('📊 Test Summary');
        console.log('================================');
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All tests passed!');
            process.exit(0);
        } else {
            console.log(`\n💥 ${this.failedTests} test(s) failed`);
            process.exit(1);
        }
    }
}

// 运行测试
const runner = new TestRunner();
runner.runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});