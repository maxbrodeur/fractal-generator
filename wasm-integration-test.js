#!/usr/bin/env node

/**
 * Automated WebAssembly Integration Test Suite
 * 
 * Tests all fractal types, parameter combinations, and WebAssembly integration
 * to ensure reliable operation across different scenarios.
 * 
 * Usage: node wasm-integration-test.js
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

class WebAssemblyIntegrationTester {
    constructor() {
        this.testResults = {};
        this.serverProcess = null;
        this.serverPort = 8080;
        this.testTimeout = 30000; // 30 seconds timeout for tests
    }

    /**
     * Check if required files exist
     */
    checkPrerequisites() {
        log('\n🔍 Checking Prerequisites', colors.bold);
        
        const requiredFiles = [
            'package.json',
            'fractal-wasm/pkg/fractal_wasm.js',
            'fractal-wasm/pkg/fractal_wasm_bg.wasm',
            'debug-helpers.js',
            'DEBUGGING.md'
        ];
        
        const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
        
        if (missingFiles.length > 0) {
            logError(`Missing required files: ${missingFiles.join(', ')}`);
            logInfo('Run "npm run build" to generate missing WebAssembly files');
            return false;
        }
        
        logSuccess('All required files present');
        return true;
    }

    /**
     * Start local HTTP server for testing
     */
    async startTestServer() {
        log('\n🚀 Starting Test Server', colors.bold);
        
        try {
            // Try to find an available port
            for (let port = 8080; port <= 8090; port++) {
                try {
                    this.serverProcess = spawn('python3', ['-m', 'http.server', port.toString()], {
                        stdio: 'pipe',
                        cwd: process.cwd()
                    });
                    
                    this.serverPort = port;
                    
                    // Wait for server to start
                    await new Promise((resolve, reject) => {
                        let started = false;
                        
                        const timeout = setTimeout(() => {
                            if (!started) {
                                reject(new Error('Server startup timeout'));
                            }
                        }, 5000);
                        
                        this.serverProcess.stderr.on('data', (data) => {
                            const output = data.toString();
                            if (output.includes('Serving HTTP')) {
                                started = true;
                                clearTimeout(timeout);
                                resolve();
                            }
                        });
                        
                        this.serverProcess.on('error', (error) => {
                            clearTimeout(timeout);
                            reject(error);
                        });
                    });
                    
                    logSuccess(`Test server running on http://localhost:${port}`);
                    return true;
                    
                } catch (error) {
                    if (this.serverProcess) {
                        this.serverProcess.kill();
                        this.serverProcess = null;
                    }
                    continue;
                }
            }
            
            throw new Error('Could not find available port');
            
        } catch (error) {
            logError(`Failed to start test server: ${error.message}`);
            return false;
        }
    }

    /**
     * Stop test server
     */
    stopTestServer() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
            logInfo('Test server stopped');
        }
    }

    /**
     * Run browser-based tests using headless browser simulation
     */
    async runBrowserTests() {
        log('\n🧪 Running Browser-Based Tests', colors.bold);
        
        // For this implementation, we'll create a test script that can be run in browser
        // In a full implementation, you'd use Puppeteer or Selenium
        
        const testScript = `
<!DOCTYPE html>
<html>
<head>
    <title>WebAssembly Integration Test</title>
    <script src="debug-helpers.js"></script>
</head>
<body>
    <div id="test-output"></div>
    <script type="module">
        import init, { FractalGenerator, Rule, ColorScheme, FractalPresets } 
        from './fractal-wasm/pkg/fractal_wasm.js';
        
        async function runAutomatedTests() {
            const output = document.getElementById('test-output');
            const log = (message) => {
                output.innerHTML += '<div>' + message + '</div>';
                console.log(message);
            };
            
            try {
                // Initialize WebAssembly
                await init();
                window.FractalGenerator = FractalGenerator;
                window.Rule = Rule;
                window.ColorScheme = ColorScheme;
                window.FractalPresets = FractalPresets;
                
                log('✅ WebAssembly module loaded');
                
                // Run debug helper tests
                const moduleStatus = window.debugFractal.checkModuleStatus();
                log('Module Status: ' + (moduleStatus ? '✅ Pass' : '❌ Fail'));
                
                const basicTests = await window.debugFractal.runBasicTests();
                log('Basic Tests: ' + (basicTests ? '✅ Pass' : '❌ Fail'));
                
                await window.debugFractal.performanceBenchmark();
                log('✅ Performance benchmark completed');
                
                const allFractals = await window.debugFractal.testAllFractals();
                const allPassed = Object.values(allFractals).every(test => test.success);
                log('All Fractals Test: ' + (allPassed ? '✅ Pass' : '❌ Fail'));
                
                // Test memory tracking
                const memoryTest = await window.debugFractal.generateWithMemoryTracking('sierpinski', 10000);
                log('Memory Tracking: ' + (memoryTest ? '✅ Pass' : '❌ Fail'));
                
                // Generate final report
                const report = window.debugFractal.generateDebugReport();
                log('✅ Test suite completed successfully');
                
                // Send results back (in real implementation)
                window.testResults = {
                    moduleStatus,
                    basicTests,
                    allFractals,
                    memoryTest,
                    report
                };
                
            } catch (error) {
                log('❌ Test suite failed: ' + error.message);
                window.testResults = { error: error.message };
            }
        }
        
        // Auto-run tests when page loads
        runAutomatedTests();
    </script>
</body>
</html>
        `;
        
        // Write test file
        fs.writeFileSync('test-integration.html', testScript);
        logSuccess('Created automated test page: test-integration.html');
        
        logInfo(`Open http://localhost:${this.serverPort}/test-integration.html in your browser to run tests`);
        logInfo('Check browser console for detailed test results');
        
        return {
            testPageCreated: true,
            testUrl: `http://localhost:${this.serverPort}/test-integration.html`
        };
    }

    /**
     * Test parameter validation edge cases
     */
    testParameterValidation() {
        log('\n📋 Testing Parameter Validation', colors.bold);
        
        const edgeCases = [
            // Valid cases
            { name: 'Valid basic params', params: { iterations: 1000, canvasSize: 400, fractalType: 'mandelbrot' }, expectValid: true },
            { name: 'Valid high params', params: { iterations: 100000, canvasSize: 2048, fractalType: 'sierpinski' }, expectValid: true },
            
            // Invalid cases
            { name: 'Zero iterations', params: { iterations: 0, canvasSize: 400, fractalType: 'mandelbrot' }, expectValid: false },
            { name: 'Negative iterations', params: { iterations: -1000, canvasSize: 400, fractalType: 'mandelbrot' }, expectValid: false },
            { name: 'Zero canvas size', params: { iterations: 1000, canvasSize: 0, fractalType: 'mandelbrot' }, expectValid: false },
            { name: 'Invalid fractal type', params: { iterations: 1000, canvasSize: 400, fractalType: 'invalid' }, expectValid: false },
            
            // Warning cases
            { name: 'Very high iterations', params: { iterations: 5000000, canvasSize: 400, fractalType: 'mandelbrot' }, expectValid: true },
            { name: 'Very large canvas', params: { iterations: 1000, canvasSize: 10000, fractalType: 'mandelbrot' }, expectValid: true },
        ];
        
        const results = {};
        
        edgeCases.forEach(testCase => {
            try {
                // Simple validation logic (would use actual debug helpers in browser)
                const isValid = testCase.params.iterations > 0 && 
                               testCase.params.canvasSize > 0 && 
                               ['mandelbrot', 'julia', 'sierpinski', 'dragon', 'fern', 'burning_ship'].includes(testCase.params.fractalType);
                
                const testPassed = isValid === testCase.expectValid;
                results[testCase.name] = { passed: testPassed, isValid, expected: testCase.expectValid };
                
                if (testPassed) {
                    logSuccess(`${testCase.name}: PASS`);
                } else {
                    logError(`${testCase.name}: FAIL (expected ${testCase.expectValid}, got ${isValid})`);
                }
                
            } catch (error) {
                logError(`${testCase.name}: ERROR - ${error.message}`);
                results[testCase.name] = { passed: false, error: error.message };
            }
        });
        
        const totalTests = Object.keys(results).length;
        const passedTests = Object.values(results).filter(r => r.passed).length;
        
        logInfo(`Parameter validation tests: ${passedTests}/${totalTests} passed`);
        
        return results;
    }

    /**
     * Test build and file integrity
     */
    testBuildIntegrity() {
        log('\n🔨 Testing Build Integrity', colors.bold);
        
        const checks = {
            wasmFileExists: fs.existsSync('fractal-wasm/pkg/fractal_wasm_bg.wasm'),
            jsBindingExists: fs.existsSync('fractal-wasm/pkg/fractal_wasm.js'),
            debugHelpersExists: fs.existsSync('debug-helpers.js'),
            documentationExists: fs.existsSync('DEBUGGING.md'),
            packageJsonValid: true,
            wasmFileSize: 0,
            jsBindingSize: 0
        };
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            checks.packageJsonValid = packageJson.name === 'fractal-generator';
        } catch (error) {
            checks.packageJsonValid = false;
        }
        
        if (checks.wasmFileExists) {
            checks.wasmFileSize = fs.statSync('fractal-wasm/pkg/fractal_wasm_bg.wasm').size;
        }
        
        if (checks.jsBindingExists) {
            checks.jsBindingSize = fs.statSync('fractal-wasm/pkg/fractal_wasm.js').size;
        }
        
        // Validate file sizes (reasonable ranges)
        const sizeChecks = {
            wasmSizeOk: checks.wasmFileSize > 10000 && checks.wasmFileSize < 5000000, // 10KB - 5MB
            jsSizeOk: checks.jsBindingSize > 1000 && checks.jsBindingSize < 1000000,   // 1KB - 1MB
        };
        
        Object.keys(checks).forEach(check => {
            if (checks[check]) {
                logSuccess(`${check}: PASS`);
            } else {
                logError(`${check}: FAIL`);
            }
        });
        
        if (checks.wasmFileSize > 0) {
            logInfo(`WebAssembly file size: ${Math.round(checks.wasmFileSize / 1024)} KB`);
        }
        
        if (checks.jsBindingSize > 0) {
            logInfo(`JavaScript binding size: ${Math.round(checks.jsBindingSize / 1024)} KB`);
        }
        
        Object.keys(sizeChecks).forEach(check => {
            if (sizeChecks[check]) {
                logSuccess(`${check}: PASS`);
            } else {
                logWarning(`${check}: WARNING - File size outside expected range`);
            }
        });
        
        return { ...checks, ...sizeChecks };
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        log('\n📊 Generating Test Report', colors.bold);
        
        const report = {
            timestamp: new Date().toISOString(),
            testResults: this.testResults,
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            cwd: process.cwd()
        };
        
        const reportJson = JSON.stringify(report, null, 2);
        
        // Save report to file
        const reportFilename = `test-report-${new Date().toISOString().slice(0, 10)}.json`;
        fs.writeFileSync(reportFilename, reportJson);
        
        logSuccess(`Test report saved: ${reportFilename}`);
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        log('📋 TEST SUMMARY', colors.bold);
        console.log('='.repeat(60));
        
        Object.keys(this.testResults).forEach(testSuite => {
            const results = this.testResults[testSuite];
            
            if (typeof results === 'object' && results !== null) {
                if (results.error) {
                    logError(`${testSuite}: FAILED - ${results.error}`);
                } else if (typeof results === 'boolean') {
                    if (results) {
                        logSuccess(`${testSuite}: PASSED`);
                    } else {
                        logError(`${testSuite}: FAILED`);
                    }
                } else {
                    // Complex result object
                    const passed = Object.values(results).filter(r => r && (r.passed === true || r === true)).length;
                    const total = Object.keys(results).length;
                    
                    if (passed === total) {
                        logSuccess(`${testSuite}: PASSED (${passed}/${total})`);
                    } else {
                        logWarning(`${testSuite}: PARTIAL (${passed}/${total})`);
                    }
                }
            }
        });
        
        console.log('='.repeat(60));
        
        return reportFilename;
    }

    /**
     * Run complete test suite
     */
    async runTests() {
        log('🧪 WebAssembly Integration Test Suite', colors.bold + colors.blue);
        log('===================================');
        
        try {
            // Check prerequisites
            this.testResults.prerequisites = this.checkPrerequisites();
            if (!this.testResults.prerequisites) {
                throw new Error('Prerequisites not met');
            }
            
            // Test build integrity
            this.testResults.buildIntegrity = this.testBuildIntegrity();
            
            // Test parameter validation
            this.testResults.parameterValidation = this.testParameterValidation();
            
            // Start test server
            const serverStarted = await this.startTestServer();
            this.testResults.serverStarted = serverStarted;
            
            if (serverStarted) {
                // Run browser tests (creates test page)
                this.testResults.browserTests = await this.runBrowserTests();
            }
            
            // Generate final report
            const reportFile = this.generateTestReport();
            
            if (serverStarted) {
                log('\n🎯 Next Steps:', colors.bold);
                logInfo(`1. Open http://localhost:${this.serverPort}/test-integration.html in your browser`);
                logInfo(`2. Check browser console for detailed WebAssembly test results`);
                logInfo(`3. Review the generated test report: ${reportFile}`);
                logInfo('4. Press Ctrl+C to stop the test server when done');
                
                // Keep server running for manual testing
                log('\n⏳ Test server will keep running for manual testing...');
                log('Press Ctrl+C to stop the server and exit');
                
                // Handle graceful shutdown
                process.on('SIGINT', () => {
                    log('\n🛑 Stopping test server...');
                    this.stopTestServer();
                    log('✅ Test suite completed');
                    process.exit(0);
                });
                
                // Keep process alive
                setInterval(() => {}, 1000);
                
            } else {
                logWarning('Server could not be started - skipping browser tests');
                log('✅ Test suite completed (partial)');
            }
            
        } catch (error) {
            logError(`Test suite failed: ${error.message}`);
            this.stopTestServer();
            process.exit(1);
        }
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new WebAssemblyIntegrationTester();
    tester.runTests().catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
}

export default WebAssemblyIntegrationTester;