#!/usr/bin/env node

// 属性测试运行器 - 专门运行基于属性的测试

// Import DOM setup first to ensure browser APIs are available
import './setup-dom.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PropertyTestRunner {
    constructor() {
        this.totalProperties = 0;
        this.passedProperties = 0;
        this.failedProperties = 0;
        this.startTime = Date.now();
    }

    async runPropertyTests() {
        console.log('🔍 Ghost Match Game - Property-Based Tests');
        console.log('==========================================\n');

        try {
            const propertyDir = join(__dirname, 'property');
            const files = await readdir(propertyDir);
            const testFiles = files.filter(f => f.endsWith('.test.js'));
            
            if (testFiles.length === 0) {
                console.log('⚠️  No property test files found');
                return;
            }

            console.log(`Found ${testFiles.length} property test file(s)\n`);
            
            for (const file of testFiles) {
                const testPath = join(propertyDir, file);
                await this.runPropertyTestFile(testPath);
            }
            
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Property test runner failed:', error);
            process.exit(1);
        }
    }

    async runPropertyTestFile(testPath) {
        try {
            const testModule = await import(testPath);
            const testName = testPath.split('/').pop().replace('.test.js', '');
            
            console.log(`📋 Running Property Test: ${testName}`);
            console.log('─'.repeat(50));
            
            if (testModule.default && typeof testModule.default === 'function') {
                const result = await testModule.default();
                this.recordPropertyResult(testName, result);
            } else if (testModule.runPropertyTests && typeof testModule.runPropertyTests === 'function') {
                const result = await testModule.runPropertyTests();
                this.recordPropertyResult(testName, result);
            } else {
                console.log(`⚠️  No property test function found in ${testName}\n`);
            }
        } catch (error) {
            console.log(`❌ Failed to run ${testPath}: ${error.message}\n`);
            this.failedProperties++;
            this.totalProperties++;
        }
    }

    recordPropertyResult(testName, result) {
        this.totalProperties++;
        
        if (result && result.passed) {
            this.passedProperties++;
            console.log(`✅ ${testName} - ${result.message || 'All properties verified'}`);
            if (result.iterations) {
                console.log(`   Iterations: ${result.iterations}`);
            }
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }
        } else {
            this.failedProperties++;
            console.log(`❌ ${testName} - ${result?.message || 'Property verification failed'}`);
            if (result?.counterExample) {
                console.log(`   Counter-example: ${JSON.stringify(result.counterExample)}`);
            }
            if (result?.details) {
                console.log(`   Details: ${result.details}`);
            }
        }
        console.log('');
    }

    printSummary() {
        const duration = Date.now() - this.startTime;
        
        console.log('==========================================');
        console.log('📊 Property Test Summary');
        console.log('==========================================');
        console.log(`Total Properties: ${this.totalProperties}`);
        console.log(`✅ Verified: ${this.passedProperties}`);
        console.log(`❌ Failed: ${this.failedProperties}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        
        if (this.failedProperties === 0 && this.totalProperties > 0) {
            console.log('\n🎉 All properties verified successfully!');
            console.log('The game implementation satisfies all correctness properties.');
            process.exit(0);
        } else if (this.totalProperties === 0) {
            console.log('\n⚠️  No property tests were found or executed.');
            process.exit(1);
        } else {
            console.log(`\n💥 ${this.failedProperties} property verification(s) failed`);
            console.log('The game implementation violates some correctness properties.');
            process.exit(1);
        }
    }
}

// 运行属性测试
const runner = new PropertyTestRunner();
runner.runPropertyTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});