/**
 * WebAssembly Fractal Generator - Debug Helpers
 * 
 * Comprehensive debugging utilities for WebAssembly integration testing,
 * performance monitoring, memory tracking, and error diagnosis.
 * 
 * Usage: These utilities are automatically available as window.debugFractal
 * when this script is loaded. Open browser console and use the helper functions.
 */

class FractalDebugHelpers {
    constructor() {
        this.memoryMonitoring = {
            active: false,
            startMemory: 0,
            samples: [],
            interval: null
        };
        
        this.performanceMetrics = {
            lastGenerationTime: 0,
            averageTime: 0,
            generationCount: 0,
            pointsPerSecond: 0
        };
        
        this.errorLog = [];
        this.testResults = {};
        
        // Initialize logging
        this.setupErrorLogging();
        console.log('🔧 Fractal Debug Helpers loaded. Use window.debugFractal for debugging tools.');
    }

    /**
     * Set up enhanced error logging for WebAssembly operations
     */
    setupErrorLogging() {
        // Store original console methods
        const originalError = console.error;
        const originalWarn = console.warn;
        
        // Enhanced error logging
        console.error = (...args) => {
            this.logError('ERROR', args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.logError('WARNING', args.join(' '));
            originalWarn.apply(console, args);
        };
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('UNCAUGHT_ERROR', `${event.message} at ${event.filename}:${event.lineno}`);
        });
        
        // WebAssembly-specific error handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('PROMISE_REJECTION', event.reason);
        });
    }

    /**
     * Log errors with timestamp and context
     */
    logError(type, message) {
        const error = {
            timestamp: new Date().toISOString(),
            type,
            message,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorLog.push(error);
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog.shift();
        }
    }

    /**
     * Check WebAssembly module loading status
     */
    checkModuleStatus() {
        console.group('🔍 WebAssembly Module Status Check');
        
        try {
            // Check if WebAssembly is supported
            if (typeof WebAssembly === 'undefined') {
                console.error('❌ WebAssembly not supported in this browser');
                return false;
            }
            console.log('✅ WebAssembly supported');
            
            // Check if our module is loaded
            if (typeof window.FractalGenerator === 'undefined') {
                console.error('❌ FractalGenerator class not available');
                console.log('💡 Make sure to await initWasm() before using debug tools');
                return false;
            }
            console.log('✅ FractalGenerator class available');
            
            // Check if we can create an instance
            try {
                const generator = new window.FractalGenerator();
                console.log('✅ FractalGenerator instance created successfully');
                
                // Check available methods
                const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(generator))
                    .filter(name => typeof generator[name] === 'function' && name !== 'constructor');
                console.log('📋 Available methods:', methods);
                
                // Check if core methods exist
                const coreMethods = ['mandelbrot_set', 'julia_set', 'chaos_game', 'ifs_fractal', 'points_to_rgba'];
                const missingMethods = coreMethods.filter(method => !(method in generator));
                
                if (missingMethods.length > 0) {
                    console.warn('⚠️ Missing core methods:', missingMethods);
                } else {
                    console.log('✅ All core methods available');
                }
                
                return true;
            } catch (error) {
                console.error('❌ Failed to create FractalGenerator instance:', error);
                return false;
            }
        } catch (error) {
            console.error('❌ Module status check failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Run basic functionality tests
     */
    async runBasicTests() {
        console.group('🧪 Basic Functionality Tests');
        
        if (!this.checkModuleStatus()) {
            console.error('❌ Cannot run tests - module not loaded');
            console.groupEnd();
            return false;
        }
        
        const generator = new window.FractalGenerator();
        const results = {};
        
        try {
            // Test 1: Simple Sierpinski Triangle
            console.log('Test 1: Sierpinski Triangle (1000 points)');
            const startTime1 = performance.now();
            
            const vertices = window.FractalPresets.sierpinski_triangle();
            const transforms = [[0.5, 0]];
            const rule = new window.Rule(0, 0, false);
            
            const sierpinskiPoints = generator.chaos_game(vertices, 0.0, 0.0, 1000, transforms, rule);
            const endTime1 = performance.now();
            
            results.sierpinski = {
                success: sierpinskiPoints.length > 0,
                pointCount: sierpinskiPoints.length / 2,
                duration: endTime1 - startTime1
            };
            
            console.log(`✅ Generated ${results.sierpinski.pointCount} points in ${results.sierpinski.duration.toFixed(2)}ms`);
            
            // Test 2: Mandelbrot Set (small)
            console.log('Test 2: Mandelbrot Set (100x100 pixels)');
            const startTime2 = performance.now();
            
            const mandelbrotData = generator.mandelbrot_set(100, 100, -2.5, 1.0, -1.25, 1.25, 50);
            const endTime2 = performance.now();
            
            results.mandelbrot = {
                success: mandelbrotData.length > 0,
                pixelCount: mandelbrotData.length,
                duration: endTime2 - startTime2
            };
            
            console.log(`✅ Generated ${results.mandelbrot.pixelCount} pixels in ${results.mandelbrot.duration.toFixed(2)}ms`);
            
            // Test 3: Color conversion
            console.log('Test 3: Color conversion');
            const startTime3 = performance.now();
            
            const rgba = generator.points_to_rgba(sierpinskiPoints, 200, 200, 0); // Fire color scheme
            const endTime3 = performance.now();
            
            results.colorConversion = {
                success: rgba.length > 0,
                rgbaLength: rgba.length,
                duration: endTime3 - startTime3
            };
            
            console.log(`✅ Generated ${results.colorConversion.rgbaLength} RGBA values in ${results.colorConversion.duration.toFixed(2)}ms`);
            
            // Test 4: Memory allocation test
            console.log('Test 4: Memory allocation (larger dataset)');
            const startTime4 = performance.now();
            
            const largePoints = generator.chaos_game(vertices, 0.0, 0.0, 10000, transforms, rule);
            const endTime4 = performance.now();
            
            results.memoryTest = {
                success: largePoints.length > 0,
                pointCount: largePoints.length / 2,
                duration: endTime4 - startTime4
            };
            
            console.log(`✅ Generated ${results.memoryTest.pointCount} points in ${results.memoryTest.duration.toFixed(2)}ms`);
            
            // Summary
            console.log('\n📊 Test Summary:');
            const allPassed = Object.values(results).every(test => test.success);
            
            if (allPassed) {
                console.log('✅ All basic tests passed!');
                console.log('🚀 WebAssembly integration is working correctly');
            } else {
                console.error('❌ Some tests failed. Check individual results above.');
            }
            
            this.testResults = { ...this.testResults, basic: results };
            return allPassed;
            
        } catch (error) {
            console.error('❌ Basic tests failed:', error);
            this.logError('TEST_FAILURE', `Basic tests failed: ${error.message}`);
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Performance benchmark across different fractal types
     */
    async performanceBenchmark() {
        console.group('⚡ Performance Benchmark');
        
        if (!this.checkModuleStatus()) {
            console.error('❌ Cannot run benchmark - module not loaded');
            console.groupEnd();
            return;
        }
        
        const generator = new window.FractalGenerator();
        const benchmarkResults = {};
        
        // Benchmark configuration
        const benchmarks = [
            {
                name: 'Sierpinski Triangle',
                test: () => {
                    const vertices = window.FractalPresets.sierpinski_triangle();
                    const transforms = [[0.5, 0]];
                    const rule = new window.Rule(0, 0, false);
                    return generator.chaos_game(vertices, 0.0, 0.0, 50000, transforms, rule);
                },
                unit: 'points'
            },
            {
                name: 'Dragon Curve',
                test: () => {
                    const transforms = window.FractalPresets.dragon_curve();
                    const probabilities = window.FractalPresets.dragon_curve_probs();
                    return generator.ifs_fractal(0.0, 0.0, 50000, transforms, probabilities, "borke");
                },
                unit: 'points'
            },
            {
                name: 'Mandelbrot Set',
                test: () => {
                    return generator.mandelbrot_set(400, 400, -2.5, 1.0, -1.25, 1.25, 100);
                },
                unit: 'pixels'
            },
            {
                name: 'Julia Set',
                test: () => {
                    return generator.julia_set(400, 400, -2.0, 2.0, -2.0, 2.0, -0.7, 0.27015, 100);
                },
                unit: 'pixels'
            }
        ];
        
        console.log('Running performance benchmarks...\n');
        
        for (const benchmark of benchmarks) {
            try {
                console.log(`🔄 Testing ${benchmark.name}...`);
                
                // Warm-up run
                benchmark.test();
                
                // Actual benchmark - multiple runs for accuracy
                const runs = 3;
                const times = [];
                
                for (let i = 0; i < runs; i++) {
                    const startTime = performance.now();
                    const result = benchmark.test();
                    const endTime = performance.now();
                    
                    times.push(endTime - startTime);
                }
                
                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                const dataCount = benchmark.unit === 'points' ? 50000 : 400 * 400;
                const throughput = (dataCount / avgTime * 1000).toFixed(0);
                
                benchmarkResults[benchmark.name] = {
                    averageTime: avgTime,
                    throughput: throughput,
                    unit: benchmark.unit
                };
                
                console.log(`✅ ${benchmark.name}: ${avgTime.toFixed(2)}ms avg (${throughput} ${benchmark.unit}/sec)`);
                
            } catch (error) {
                console.error(`❌ ${benchmark.name} failed:`, error);
                benchmarkResults[benchmark.name] = { error: error.message };
            }
        }
        
        // Performance summary
        console.log('\n📊 Performance Summary:');
        console.table(benchmarkResults);
        
        // Performance rating
        const mandelbrotThroughput = parseInt(benchmarkResults['Mandelbrot Set']?.throughput || 0);
        const sierpinskiThroughput = parseInt(benchmarkResults['Sierpinski Triangle']?.throughput || 0);
        
        let rating = 'Unknown';
        if (mandelbrotThroughput > 100000 && sierpinskiThroughput > 40000) {
            rating = 'Excellent';
        } else if (mandelbrotThroughput > 50000 && sierpinskiThroughput > 20000) {
            rating = 'Good';
        } else if (mandelbrotThroughput > 20000 && sierpinskiThroughput > 10000) {
            rating = 'Fair';
        } else {
            rating = 'Poor';
        }
        
        console.log(`🏆 Overall Performance Rating: ${rating}`);
        
        this.testResults = { ...this.testResults, performance: benchmarkResults };
        console.groupEnd();
    }

    /**
     * Start memory usage monitoring
     */
    startMemoryMonitoring() {
        if (this.memoryMonitoring.active) {
            console.warn('⚠️ Memory monitoring already active');
            return;
        }
        
        if (!performance.memory) {
            console.warn('⚠️ Memory monitoring not available in this browser');
            return;
        }
        
        console.log('🔍 Starting memory monitoring...');
        
        this.memoryMonitoring.active = true;
        this.memoryMonitoring.startMemory = performance.memory.usedJSHeapSize;
        this.memoryMonitoring.samples = [];
        
        this.memoryMonitoring.interval = setInterval(() => {
            if (performance.memory) {
                this.memoryMonitoring.samples.push({
                    timestamp: performance.now(),
                    usedHeap: performance.memory.usedJSHeapSize,
                    totalHeap: performance.memory.totalJSHeapSize,
                    heapLimit: performance.memory.jsHeapSizeLimit
                });
            }
        }, 100); // Sample every 100ms
        
        console.log('✅ Memory monitoring started');
    }

    /**
     * Stop memory monitoring and generate report
     */
    stopMemoryMonitoring() {
        if (!this.memoryMonitoring.active) {
            console.warn('⚠️ Memory monitoring not active');
            return;
        }
        
        console.group('📊 Memory Usage Report');
        
        clearInterval(this.memoryMonitoring.interval);
        this.memoryMonitoring.active = false;
        
        const samples = this.memoryMonitoring.samples;
        if (samples.length === 0) {
            console.warn('⚠️ No memory samples collected');
            console.groupEnd();
            return;
        }
        
        const startMemory = this.memoryMonitoring.startMemory;
        const endMemory = samples[samples.length - 1].usedHeap;
        const maxMemory = Math.max(...samples.map(s => s.usedHeap));
        const minMemory = Math.min(...samples.map(s => s.usedHeap));
        
        const formatBytes = (bytes) => {
            return (bytes / 1024 / 1024).toFixed(2) + ' MB';
        };
        
        console.log('Memory Usage Summary:');
        console.log(`Start Memory: ${formatBytes(startMemory)}`);
        console.log(`End Memory: ${formatBytes(endMemory)}`);
        console.log(`Peak Memory: ${formatBytes(maxMemory)}`);
        console.log(`Memory Delta: ${formatBytes(endMemory - startMemory)}`);
        console.log(`Sample Count: ${samples.length}`);
        
        // Check for memory leaks
        const memoryGrowth = endMemory - startMemory;
        if (memoryGrowth > 50 * 1024 * 1024) { // > 50MB growth
            console.warn(`⚠️ Potential memory leak detected: ${formatBytes(memoryGrowth)} growth`);
        } else if (memoryGrowth > 10 * 1024 * 1024) { // > 10MB growth
            console.log(`🔄 Moderate memory usage: ${formatBytes(memoryGrowth)} growth`);
        } else {
            console.log(`✅ Good memory usage: ${formatBytes(memoryGrowth)} growth`);
        }
        
        // Memory usage over time chart data
        if (samples.length > 1) {
            console.log('\nMemory Usage Over Time (for charting):');
            const chartData = samples.map(s => ({
                time: Math.round(s.timestamp - samples[0].timestamp),
                memory: Math.round(s.usedHeap / 1024 / 1024)
            }));
            console.table(chartData.slice(0, 10)); // Show first 10 samples
            
            if (chartData.length > 10) {
                console.log(`... and ${chartData.length - 10} more samples`);
            }
        }
        
        console.groupEnd();
        
        return {
            startMemory,
            endMemory,
            maxMemory,
            minMemory,
            memoryGrowth,
            samples: samples.length
        };
    }

    /**
     * Generate fractal with memory tracking
     */
    async generateWithMemoryTracking(fractalType, iterations = 50000) {
        console.group(`🧪 Memory Tracking Test: ${fractalType}`);
        
        if (!this.checkModuleStatus()) {
            console.error('❌ Cannot run test - module not loaded');
            console.groupEnd();
            return;
        }
        
        this.startMemoryMonitoring();
        
        try {
            const generator = new window.FractalGenerator();
            const startTime = performance.now();
            
            let result;
            
            switch (fractalType.toLowerCase()) {
                case 'sierpinski':
                    const vertices = window.FractalPresets.sierpinski_triangle();
                    const transforms = [[0.5, 0]];
                    const rule = new window.Rule(0, 0, false);
                    result = generator.chaos_game(vertices, 0.0, 0.0, iterations, transforms, rule);
                    break;
                    
                case 'mandelbrot':
                    const size = Math.sqrt(iterations); // Approximate square dimensions
                    result = generator.mandelbrot_set(size, size, -2.5, 1.0, -1.25, 1.25, 100);
                    break;
                    
                case 'dragon':
                    const dragonTransforms = window.FractalPresets.dragon_curve();
                    const dragonProbs = window.FractalPresets.dragon_curve_probs();
                    result = generator.ifs_fractal(0.0, 0.0, iterations, dragonTransforms, dragonProbs, "borke");
                    break;
                    
                default:
                    throw new Error(`Unknown fractal type: ${fractalType}`);
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`✅ Generated ${fractalType} in ${duration.toFixed(2)}ms`);
            console.log(`📊 Result size: ${result.length} values`);
            
            // Wait a moment for memory to stabilize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const memoryReport = this.stopMemoryMonitoring();
            
            return {
                fractalType,
                iterations,
                duration,
                resultSize: result.length,
                memoryReport
            };
            
        } catch (error) {
            console.error(`❌ Failed to generate ${fractalType}:`, error);
            this.stopMemoryMonitoring();
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Validate parameter ranges
     */
    validateParameters(params) {
        console.group('✅ Parameter Validation');
        
        const validationResults = {
            valid: true,
            errors: [],
            warnings: []
        };
        
        // Validate iterations
        if (params.iterations !== undefined) {
            if (typeof params.iterations !== 'number' || params.iterations < 1) {
                validationResults.errors.push('Iterations must be a positive number');
                validationResults.valid = false;
            } else if (params.iterations > 10000000) {
                validationResults.warnings.push('Very high iteration count may cause performance issues');
            }
        }
        
        // Validate canvas size
        if (params.canvasSize !== undefined) {
            if (typeof params.canvasSize !== 'number' || params.canvasSize < 1) {
                validationResults.errors.push('Canvas size must be a positive number');
                validationResults.valid = false;
            } else if (params.canvasSize > 8192) {
                validationResults.warnings.push('Very large canvas size may cause memory issues');
            }
        }
        
        // Validate fractal type
        if (params.fractalType !== undefined) {
            const validTypes = ['mandelbrot', 'julia', 'sierpinski', 'dragon', 'fern', 'burning_ship'];
            if (!validTypes.includes(params.fractalType.toLowerCase())) {
                validationResults.errors.push(`Unknown fractal type: ${params.fractalType}`);
                validationResults.valid = false;
            }
        }
        
        // Validate Julia parameters
        if (params.juliaReal !== undefined || params.juliaImag !== undefined) {
            if (typeof params.juliaReal !== 'number' || typeof params.juliaImag !== 'number') {
                validationResults.errors.push('Julia parameters must be numbers');
                validationResults.valid = false;
            }
        }
        
        // Display results
        if (validationResults.valid) {
            console.log('✅ All parameters valid');
        } else {
            console.error('❌ Parameter validation failed');
            validationResults.errors.forEach(error => console.error(`  • ${error}`));
        }
        
        if (validationResults.warnings.length > 0) {
            console.warn('⚠️ Parameter warnings:');
            validationResults.warnings.forEach(warning => console.warn(`  • ${warning}`));
        }
        
        console.log('📋 Validation Summary:', validationResults);
        console.groupEnd();
        
        return validationResults;
    }

    /**
     * Test all fractal types with basic parameters
     */
    async testAllFractals() {
        console.group('🌟 Comprehensive Fractal Testing');
        
        if (!this.checkModuleStatus()) {
            console.error('❌ Cannot run tests - module not loaded');
            console.groupEnd();
            return;
        }
        
        const generator = new window.FractalGenerator();
        const testResults = {};
        
        const tests = [
            {
                name: 'Mandelbrot Set',
                test: () => generator.mandelbrot_set(200, 200, -2.5, 1.0, -1.25, 1.25, 50),
                expectedSize: 200 * 200
            },
            {
                name: 'Julia Set',
                test: () => generator.julia_set(200, 200, -2.0, 2.0, -2.0, 2.0, -0.7, 0.27015, 50),
                expectedSize: 200 * 200
            },
            {
                name: 'Burning Ship',
                test: () => generator.burning_ship(200, 200, -2.5, 1.0, -2.0, 1.0, 50),
                expectedSize: 200 * 200
            },
            {
                name: 'Sierpinski Triangle',
                test: () => {
                    const vertices = window.FractalPresets.sierpinski_triangle();
                    const transforms = [[0.5, 0]];
                    const rule = new window.Rule(0, 0, false);
                    return generator.chaos_game(vertices, 0.0, 0.0, 5000, transforms, rule);
                },
                expectedSize: 5000 * 2
            },
            {
                name: 'Dragon Curve',
                test: () => {
                    const transforms = window.FractalPresets.dragon_curve();
                    const probabilities = window.FractalPresets.dragon_curve_probs();
                    return generator.ifs_fractal(0.0, 0.0, 5000, transforms, probabilities, "borke");
                },
                expectedSize: 5000 * 2
            },
            {
                name: 'Barnsley Fern',
                test: () => {
                    const transforms = window.FractalPresets.barnsley_fern();
                    const probabilities = window.FractalPresets.barnsley_fern_probs();
                    return generator.ifs_fractal(0.0, 0.0, 5000, transforms, probabilities, "borke");
                },
                expectedSize: 5000 * 2
            }
        ];
        
        for (const test of tests) {
            try {
                console.log(`🔄 Testing ${test.name}...`);
                
                const startTime = performance.now();
                const result = test.test();
                const endTime = performance.now();
                
                const success = result && result.length >= test.expectedSize;
                
                testResults[test.name] = {
                    success,
                    duration: endTime - startTime,
                    resultSize: result ? result.length : 0,
                    expectedSize: test.expectedSize
                };
                
                if (success) {
                    console.log(`✅ ${test.name}: ${(endTime - startTime).toFixed(2)}ms`);
                } else {
                    console.error(`❌ ${test.name}: Failed or insufficient data`);
                }
                
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                testResults[test.name] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        // Summary
        const totalTests = Object.keys(testResults).length;
        const passedTests = Object.values(testResults).filter(r => r.success).length;
        
        console.log('\n📊 Test Summary:');
        console.table(testResults);
        
        if (passedTests === totalTests) {
            console.log(`✅ All ${totalTests} fractal types working correctly!`);
        } else {
            console.error(`❌ ${totalTests - passedTests} of ${totalTests} tests failed`);
        }
        
        this.testResults = { ...this.testResults, comprehensive: testResults };
        console.groupEnd();
        
        return testResults;
    }

    /**
     * Generate comprehensive debug report
     */
    generateDebugReport() {
        console.group('📋 Debug Report Generation');
        
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            webAssemblySupport: typeof WebAssembly !== 'undefined',
            moduleStatus: this.checkModuleStatus(),
            memorySupport: !!performance.memory,
            errorLog: this.errorLog.slice(-10), // Last 10 errors
            testResults: this.testResults,
            performanceMemory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
        
        console.log('📊 Complete Debug Report:');
        console.log(JSON.stringify(report, null, 2));
        
        // Also create a downloadable version
        const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const reportUrl = URL.createObjectURL(reportBlob);
        
        console.log('💾 Download debug report:', reportUrl);
        console.log('📋 Copy this report when submitting bug reports');
        
        console.groupEnd();
        
        return report;
    }

    /**
     * Test specific parameter edge cases
     */
    testParameters(params) {
        console.group(`🧪 Parameter Edge Case Test`);
        
        console.log('Testing parameters:', params);
        
        const validation = this.validateParameters(params);
        
        if (!validation.valid) {
            console.log('❌ Parameters failed validation - test aborted');
            console.groupEnd();
            return { success: false, validation };
        }
        
        try {
            if (!this.checkModuleStatus()) {
                throw new Error('WebAssembly module not available');
            }
            
            const generator = new window.FractalGenerator();
            const startTime = performance.now();
            
            // Use Sierpinski Triangle as a safe test fractal
            const vertices = window.FractalPresets.sierpinski_triangle();
            const transforms = [[0.5, 0]];
            const rule = new window.Rule(0, 0, false);
            
            const iterations = params.iterations || 1000;
            const result = generator.chaos_game(vertices, 0.0, 0.0, iterations, transforms, rule);
            
            const endTime = performance.now();
            
            console.log(`✅ Parameter test completed in ${(endTime - startTime).toFixed(2)}ms`);
            console.log(`📊 Generated ${result.length / 2} points`);
            
            console.groupEnd();
            return { 
                success: true, 
                duration: endTime - startTime, 
                pointCount: result.length / 2,
                validation 
            };
            
        } catch (error) {
            console.error(`❌ Parameter test failed: ${error.message}`);
            console.groupEnd();
            return { success: false, error: error.message, validation };
        }
    }
}

// Initialize debug helpers and make globally available
window.debugFractal = new FractalDebugHelpers();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FractalDebugHelpers;
}