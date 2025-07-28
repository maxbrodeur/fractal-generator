# WebAssembly Performance Optimization Guide

This document provides specific optimization strategies for improving WebAssembly fractal generation performance, memory usage, and user experience.

## Performance Baselines and Targets

### Expected Performance Ranges (600x600 resolution)

| Fractal Type | Target Time | Min Throughput | Memory Usage |
|--------------|-------------|----------------|--------------|
| Sierpinski Triangle (50K points) | < 1 second | > 50,000 points/sec | < 10 MB |
| Dragon Curve (50K points) | < 1 second | > 50,000 points/sec | < 10 MB |
| Mandelbrot Set (360K pixels) | < 3 seconds | > 120,000 pixels/sec | < 20 MB |
| Julia Set (360K pixels) | < 3 seconds | > 120,000 pixels/sec | < 20 MB |
| Random Chaos (100K points) | < 5 seconds | > 20,000 points/sec | < 15 MB |

### Browser-Specific Performance Characteristics

#### Chrome/Chromium
- **Best overall performance** due to V8 optimizations
- **Hardware acceleration**: Excellent WebAssembly optimization
- **Memory management**: Efficient garbage collection
- **Optimization tip**: Enable hardware acceleration in `chrome://settings/`

#### Firefox
- **Good performance** with SpiderMonkey engine
- **WASM compilation**: Fast startup, good sustained performance
- **Memory usage**: Generally efficient
- **Optimization tip**: Enable `javascript.options.wasm_optimizinglevel` in `about:config`

#### Safari
- **Variable performance** depending on device
- **iOS/macOS differences**: Desktop Safari generally faster
- **Memory constraints**: More conservative memory limits
- **Optimization tip**: Reduce canvas sizes on Safari for better performance

## Optimization Strategies

### 1. Resolution and Iteration Scaling

#### Dynamic Resolution Adjustment
```javascript
// Auto-scale based on device capabilities
function getOptimalCanvasSize() {
    const deviceRatio = window.devicePixelRatio || 1;
    const screenArea = window.screen.width * window.screen.height;
    const memoryLimit = navigator.deviceMemory || 4; // GB
    
    // Base size calculation
    let baseSize = 800;
    
    // Adjust for high-DPI displays
    if (deviceRatio > 2) {
        baseSize = Math.min(1024, baseSize); // Limit for Retina displays
    }
    
    // Adjust for low-memory devices
    if (memoryLimit < 4) {
        baseSize = Math.min(600, baseSize);
    }
    
    // Adjust for small screens
    if (screenArea < 1000000) { // < ~1000x1000
        baseSize = Math.min(400, baseSize);
    }
    
    return baseSize;
}
```

#### Iteration Density Scaling
```javascript
// Maintain consistent visual density across resolutions
function scaleIterationsForResolution(baseIterations, canvasWidth, canvasHeight) {
    const baseResolution = 600 * 600; // Reference resolution
    const currentResolution = canvasWidth * canvasHeight;
    const scalingFactor = Math.sqrt(currentResolution / baseResolution);
    
    // Apply scaling with reasonable bounds
    const minScale = 0.5;
    const maxScale = 3.0;
    const boundedScale = Math.max(minScale, Math.min(maxScale, scalingFactor));
    
    return Math.round(baseIterations * boundedScale);
}
```

### 2. Memory Management Optimization

#### Progressive Memory Allocation
```javascript
// Test memory allocation in chunks to avoid crashes
function safeMemoryAllocation(requestedSize) {
    const maxChunkSize = 50 * 1024 * 1024; // 50MB chunks
    const chunks = Math.ceil(requestedSize / maxChunkSize);
    
    if (chunks > 1) {
        console.warn(`Large allocation (${Math.round(requestedSize / 1024 / 1024)}MB) will be processed in ${chunks} chunks`);
        return true; // Proceed with chunked processing
    }
    
    return false; // Single allocation is safe
}
```

#### Memory Monitoring Integration
```javascript
// Real-time memory monitoring during generation
class MemoryMonitor {
    constructor() {
        this.maxMemoryUsage = 0;
        this.startMemory = 0;
        this.monitoring = false;
    }
    
    startMonitoring() {
        if (!performance.memory) return false;
        
        this.startMemory = performance.memory.usedJSHeapSize;
        this.maxMemoryUsage = this.startMemory;
        this.monitoring = true;
        
        this.interval = setInterval(() => {
            const currentMemory = performance.memory.usedJSHeapSize;
            this.maxMemoryUsage = Math.max(this.maxMemoryUsage, currentMemory);
            
            // Auto-abort if memory usage exceeds safe limits
            const memoryGrowth = currentMemory - this.startMemory;
            if (memoryGrowth > 200 * 1024 * 1024) { // 200MB growth limit
                console.warn('Memory limit exceeded, aborting generation');
                this.stopMonitoring();
                // Trigger abort mechanism
            }
        }, 100);
        
        return true;
    }
    
    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.monitoring = false;
        
        return {
            startMemory: this.startMemory,
            maxMemory: this.maxMemoryUsage,
            peakGrowth: this.maxMemoryUsage - this.startMemory
        };
    }
}
```

### 3. Rendering Optimization

#### Canvas Optimization
```javascript
// Optimize canvas operations for better performance
function optimizeCanvasRendering(canvas, imageData) {
    const ctx = canvas.getContext('2d');
    
    // Disable smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    // Use appropriate composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    // Batch canvas operations
    ctx.putImageData(imageData, 0, 0);
    
    // Force immediate rendering
    ctx.flush && ctx.flush();
}
```

#### Progressive Rendering for Large Datasets
```javascript
// Break large renders into chunks to maintain UI responsiveness
async function progressiveRender(generator, params, canvas, progressCallback) {
    const chunkSize = 10000; // Process 10K points at a time
    const totalPoints = params.iterations;
    const chunks = Math.ceil(totalPoints / chunkSize);
    
    let allPoints = [];
    
    for (let i = 0; i < chunks; i++) {
        const chunkIterations = Math.min(chunkSize, totalPoints - i * chunkSize);
        
        // Generate chunk
        const chunkPoints = generator.chaos_game(
            params.vertices, 
            params.startX, 
            params.startY, 
            chunkIterations, 
            params.transforms, 
            params.rule
        );
        
        allPoints = allPoints.concat(Array.from(chunkPoints));
        
        // Update progress
        const progress = ((i + 1) / chunks) * 100;
        progressCallback && progressCallback(progress);
        
        // Yield control to browser
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    // Final render
    const result = generator.points_to_rgba(allPoints, canvas.width, canvas.height, params.colorScheme);
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(new Uint8ClampedArray(result), canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    return result;
}
```

### 4. Parameter Optimization

#### Smart Default Selection
```javascript
// Choose optimal defaults based on fractal type and system capabilities
function getOptimalParameters(fractalType, systemInfo) {
    const baseParams = {
        sierpinski: { iterations: 50000, maxCanvasSize: 2048 },
        mandelbrot: { iterations: 100, maxCanvasSize: 1024 },
        julia: { iterations: 100, maxCanvasSize: 1024 },
        dragon: { iterations: 50000, maxCanvasSize: 1024 },
        random_chaos: { plotPoints: 100000, testPoints: 50000, maxCanvasSize: 800 }
    };
    
    const params = baseParams[fractalType] || baseParams.sierpinski;
    
    // Adjust for system capabilities
    if (systemInfo.memoryLimit < 4) {
        params.iterations = Math.round(params.iterations * 0.7);
        params.plotPoints = Math.round((params.plotPoints || 0) * 0.7);
        params.maxCanvasSize = Math.min(params.maxCanvasSize, 800);
    }
    
    if (systemInfo.isMobile) {
        params.iterations = Math.round(params.iterations * 0.5);
        params.plotPoints = Math.round((params.plotPoints || 0) * 0.5);
        params.maxCanvasSize = Math.min(params.maxCanvasSize, 600);
    }
    
    return params;
}
```

#### Parameter Validation and Auto-correction
```javascript
// Validate and auto-correct parameters for optimal performance
function validateAndOptimizeParameters(params) {
    const optimized = { ...params };
    const warnings = [];
    
    // Iteration limits
    if (optimized.iterations > 1000000) {
        optimized.iterations = 1000000;
        warnings.push('Iterations capped at 1M for performance');
    }
    
    // Canvas size limits
    const maxCanvasSize = getMaxSafeCanvasSize();
    if (optimized.canvasSize > maxCanvasSize) {
        optimized.canvasSize = maxCanvasSize;
        warnings.push(`Canvas size reduced to ${maxCanvasSize} for memory safety`);
    }
    
    // Memory estimation
    const estimatedMemory = estimateMemoryUsage(optimized);
    if (estimatedMemory > getMemoryLimit()) {
        const reductionFactor = getMemoryLimit() / estimatedMemory;
        optimized.iterations = Math.round(optimized.iterations * reductionFactor);
        warnings.push('Parameters reduced to stay within memory limits');
    }
    
    return { optimized, warnings };
}
```

### 5. Performance Monitoring Integration

#### Real-time Performance Tracking
```javascript
class PerformanceTracker {
    constructor() {
        this.metrics = {
            generationTimes: [],
            throughputHistory: [],
            memoryUsage: [],
            errorCounts: {}
        };
    }
    
    recordGeneration(fractalType, pointCount, duration, memoryUsed) {
        this.metrics.generationTimes.push({
            fractalType,
            pointCount,
            duration,
            memoryUsed,
            timestamp: Date.now(),
            throughput: pointCount / (duration / 1000)
        });
        
        // Keep only last 50 records
        if (this.metrics.generationTimes.length > 50) {
            this.metrics.generationTimes.shift();
        }
        
        this.updateThroughputHistory();
    }
    
    updateThroughputHistory() {
        const recent = this.metrics.generationTimes.slice(-10);
        const avgThroughput = recent.reduce((sum, r) => sum + r.throughput, 0) / recent.length;
        this.metrics.throughputHistory.push(avgThroughput);
        
        if (this.metrics.throughputHistory.length > 20) {
            this.metrics.throughputHistory.shift();
        }
    }
    
    getPerformanceRating() {
        if (this.metrics.throughputHistory.length === 0) return 'Unknown';
        
        const avgThroughput = this.metrics.throughputHistory.reduce((a, b) => a + b, 0) / this.metrics.throughputHistory.length;
        
        if (avgThroughput > 50000) return 'Excellent';
        if (avgThroughput > 25000) return 'Good';
        if (avgThroughput > 10000) return 'Fair';
        return 'Poor';
    }
    
    suggestOptimizations() {
        const suggestions = [];
        const rating = this.getPerformanceRating();
        
        if (rating === 'Poor' || rating === 'Fair') {
            suggestions.push('Consider reducing iteration count or canvas size');
            suggestions.push('Try enabling hardware acceleration in browser settings');
            suggestions.push('Close other browser tabs to free memory');
        }
        
        const recentErrors = Object.keys(this.metrics.errorCounts).filter(
            error => this.metrics.errorCounts[error] > 2
        );
        
        if (recentErrors.length > 0) {
            suggestions.push('Frequent errors detected - check browser console');
        }
        
        return suggestions;
    }
}
```

### 6. System-Specific Optimizations

#### Mobile Device Optimization
```javascript
// Detect and optimize for mobile devices
function detectMobileOptimizations() {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const isSlowConnection = navigator.connection && navigator.connection.effectiveType === 'slow-2g';
    
    return {
        isMobile,
        isLowMemory,
        isSlowConnection,
        recommendedMaxIterations: isMobile ? 25000 : 100000,
        recommendedMaxCanvasSize: isMobile ? 400 : 1024,
        useProgressiveRendering: isMobile || isLowMemory
    };
}
```

#### Battery and Thermal Management
```javascript
// Monitor battery and adjust performance accordingly
function getBatteryOptimizations() {
    if (!navigator.getBattery) return { enabled: false };
    
    return navigator.getBattery().then(battery => {
        const lowBattery = battery.level < 0.2;
        const isCharging = battery.charging;
        
        return {
            enabled: true,
            reducePerformance: lowBattery && !isCharging,
            recommendedIterations: lowBattery ? 0.5 : 1.0, // Scale factor
            batteryLevel: battery.level,
            isCharging
        };
    });
}
```

## Browser-Specific Setup Instructions

### Chrome Optimization
1. **Enable Hardware Acceleration**:
   - Go to `chrome://settings/`
   - Advanced → System
   - Enable "Use hardware acceleration when available"

2. **WebAssembly Optimization**:
   - Go to `chrome://flags/`
   - Enable "WebAssembly lazy compilation"
   - Enable "WebAssembly tiering"

### Firefox Optimization
1. **WebAssembly Settings**:
   - Type `about:config` in address bar
   - Set `javascript.options.wasm_optimizinglevel` to `2`
   - Set `javascript.options.wasm_baselinejit` to `true`

2. **Memory Settings**:
   - Increase `javascript.options.mem.max` if available
   - Enable `dom.workers.enabled` for future Web Worker support

### Safari Optimization
1. **WebGL and Hardware Acceleration**:
   - Safari → Preferences → Advanced
   - Enable "Show Develop menu"
   - Develop → Experimental Features → Enable WebGL extensions

2. **Memory Management**:
   - Regularly clear cache and website data
   - Close unused tabs before running complex fractals

## Performance Testing and Benchmarking

### Automated Performance Testing
```javascript
// Run performance benchmarks automatically
async function runPerformanceBenchmarks() {
    const benchmarks = [
        { type: 'sierpinski', iterations: 50000, canvasSize: 600 },
        { type: 'mandelbrot', pixels: 600 * 600, maxIter: 100 },
        { type: 'dragon', iterations: 50000, canvasSize: 600 }
    ];
    
    const results = {};
    
    for (const benchmark of benchmarks) {
        console.log(`Running ${benchmark.type} benchmark...`);
        
        const startTime = performance.now();
        const startMemory = performance.memory?.usedJSHeapSize || 0;
        
        // Run the benchmark
        await runBenchmarkTest(benchmark);
        
        const endTime = performance.now();
        const endMemory = performance.memory?.usedJSHeapSize || 0;
        
        results[benchmark.type] = {
            duration: endTime - startTime,
            memoryUsed: endMemory - startMemory,
            throughput: calculateThroughput(benchmark, endTime - startTime)
        };
    }
    
    return results;
}
```

### Performance Regression Detection
```javascript
// Detect performance regressions
function detectPerformanceRegression(currentResults, baselineResults) {
    const regressions = [];
    
    for (const [type, current] of Object.entries(currentResults)) {
        const baseline = baselineResults[type];
        if (!baseline) continue;
        
        const performanceRatio = current.duration / baseline.duration;
        const memoryRatio = current.memoryUsed / baseline.memoryUsed;
        
        if (performanceRatio > 1.5) {
            regressions.push({
                type,
                issue: 'performance',
                severity: performanceRatio > 2.0 ? 'high' : 'medium',
                details: `${Math.round((performanceRatio - 1) * 100)}% slower than baseline`
            });
        }
        
        if (memoryRatio > 1.5) {
            regressions.push({
                type,
                issue: 'memory',
                severity: memoryRatio > 2.0 ? 'high' : 'medium',
                details: `${Math.round((memoryRatio - 1) * 100)}% more memory than baseline`
            });
        }
    }
    
    return regressions;
}
```

## Troubleshooting Performance Issues

### Common Performance Problems

#### 1. Slow Initial Loading
**Symptoms**: Long delay before first fractal generation
**Causes**: 
- WebAssembly module compilation
- Large WebAssembly file size
- Network latency

**Solutions**:
```javascript
// Preload and cache WebAssembly module
async function preloadWebAssembly() {
    const wasmResponse = await fetch('./fractal-wasm/pkg/fractal_wasm_bg.wasm');
    const wasmBytes = await wasmResponse.arrayBuffer();
    const wasmModule = await WebAssembly.compile(wasmBytes);
    
    // Cache compiled module
    localStorage.setItem('wasmModuleCache', JSON.stringify({
        timestamp: Date.now(),
        version: '1.0.0' // Update when WASM changes
    }));
    
    return wasmModule;
}
```

#### 2. Memory Leaks
**Symptoms**: Increasing memory usage over time
**Causes**: 
- Accumulating ImageData objects
- Unreleased WebAssembly memory
- Event listener accumulation

**Solutions**:
```javascript
// Proper cleanup after each generation
function cleanupAfterGeneration() {
    // Clear any cached image data
    if (window.lastImageData) {
        window.lastImageData = null;
    }
    
    // Force garbage collection hint
    if (window.gc) {
        window.gc();
    }
    
    // Clear any temporary canvases
    document.querySelectorAll('canvas.temp').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}
```

#### 3. UI Freezing
**Symptoms**: Browser becomes unresponsive during generation
**Causes**: 
- Synchronous heavy computation
- No yielding to event loop
- Large canvas operations

**Solutions**:
```javascript
// Implement cooperative multitasking
async function cooperativeGeneration(generator, params) {
    const chunkSize = 5000;
    const startTime = performance.now();
    
    for (let processed = 0; processed < params.iterations; processed += chunkSize) {
        const currentChunk = Math.min(chunkSize, params.iterations - processed);
        
        // Process chunk
        const chunkResult = generator.processChunk(processed, currentChunk, params);
        
        // Yield control every chunk
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Update progress UI
        const progress = (processed / params.iterations) * 100;
        updateProgressIndicator(progress);
        
        // Check for cancellation
        if (window.generationCancelled) {
            throw new Error('Generation cancelled by user');
        }
    }
}
```

This optimization guide provides comprehensive strategies for improving WebAssembly fractal generation performance across different browsers and devices. Regular performance monitoring and automated optimization will ensure the best user experience.