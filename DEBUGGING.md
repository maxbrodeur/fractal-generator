# WebAssembly Fractal Generator - Debugging Guide

This guide provides comprehensive debugging tools and solutions for common WebAssembly integration issues in the fractal generator.

## Quick Debugging Checklist

### ✅ Initial Setup Verification
- [ ] **WebAssembly module loads**: Open browser console and verify no WASM loading errors
- [ ] **Local server running**: Ensure using `http://localhost:8000` (not `file://`)
- [ ] **Browser compatibility**: Use Chrome 57+, Firefox 52+, or Safari 11+
- [ ] **Console clear of errors**: Check for CORS, module import, or compilation errors

### ✅ Function Call Testing
- [ ] **Module initialization**: Verify `FractalGenerator` class instantiates successfully
- [ ] **Basic fractal generation**: Test with Sierpinski Triangle (lowest complexity)
- [ ] **Parameter validation**: Ensure all inputs are within valid ranges
- [ ] **Memory allocation**: Check large iteration counts work without crashes

### ✅ Performance Verification
- [ ] **Render times reasonable**: < 5 seconds for 50K points at 600x600
- [ ] **Memory usage stable**: No continuous growth during repeated generations
- [ ] **UI responsiveness**: Interface remains interactive during generation
- [ ] **Canvas updates properly**: Visual output matches expected fractal patterns

## Common Issues and Solutions

### 🚨 WebAssembly Loading Issues

#### Issue: "Module not found" or Import Errors
```
Error: Failed to resolve module specifier "./fractal-wasm/pkg/fractal_wasm.js"
```

**Causes & Solutions:**
- **File:// Protocol**: Must use HTTP server, not direct file access
  ```bash
  # Fix: Start local server
  python3 -m http.server 8000
  # or
  npx serve .
  ```

- **Incorrect Path**: Verify WebAssembly module location
  ```javascript
  // Correct import path
  import init, { FractalGenerator } from './fractal-wasm/pkg/fractal_wasm.js';
  ```

- **Build Not Run**: WebAssembly module not compiled
  ```bash
  # Fix: Build WebAssembly module
  npm run build
  # or manually
  cd fractal-wasm && wasm-pack build --target web
  ```

#### Issue: CORS Errors
```
Cross-Origin Request Blocked: Same-Origin Policy disallows reading the remote resource
```

**Solutions:**
- Use proper HTTP server (not file:// protocol)
- For development, use local server with CORS enabled:
  ```bash
  python3 -m http.server 8000
  # Access via: http://localhost:8000
  ```

### 🚨 Function Call Errors

#### Issue: "Function not found" or Undefined Methods
```
TypeError: generator.mandelbrot_set is not a function
```

**Debug Steps:**
1. **Verify Module Import**:
   ```javascript
   console.log(typeof FractalGenerator); // Should be "function"
   console.log(Object.getOwnPropertyNames(FractalGenerator.prototype));
   ```

2. **Check Instance Creation**:
   ```javascript
   const generator = new FractalGenerator();
   console.log(generator); // Should show available methods
   ```

3. **Validate WebAssembly Compilation**:
   ```bash
   # Check generated files exist
   ls fractal-wasm/pkg/
   # Should include: fractal_wasm.js, fractal_wasm_bg.wasm
   ```

#### Issue: Parameter Type Mismatches
```
TypeError: Invalid value used in weak set
RuntimeError: unreachable
```

**Common Causes & Fixes:**
- **Wrong Parameter Types**: Ensure correct JavaScript types
  ```javascript
  // ❌ Wrong: String parameters
  generator.mandelbrot_set("600", "600", "-2.5", "1.0", "-1.25", "1.25", "100");
  
  // ✅ Correct: Numeric parameters
  generator.mandelbrot_set(600, 600, -2.5, 1.0, -1.25, 1.25, 100);
  ```

- **Array/Object Issues**: Use proper data structures
  ```javascript
  // ❌ Wrong: Plain arrays
  const rule = [0, 0, false];
  
  // ✅ Correct: Proper Rule object
  const rule = new Rule(0, 0, false);
  ```

### 🚨 Memory Issues

#### Issue: Out of Memory Errors
```
RuntimeError: memory access out of bounds
RangeError: Maximum call stack size exceeded
```

**Prevention & Solutions:**
- **Limit Iteration Counts**: Start with smaller values
  ```javascript
  // Safe starting points
  const iterations = Math.min(parseInt(userInput), 1000000); // Cap at 1M
  ```

- **Progressive Testing**: Gradually increase complexity
  ```javascript
  // Test progression: 1K → 10K → 100K → 1M
  const testSizes = [1000, 10000, 100000, 1000000];
  ```

- **Memory Monitoring**: Track usage patterns
  ```javascript
  // Before generation
  const startMemory = performance.memory?.usedJSHeapSize || 0;
  
  // After generation
  const endMemory = performance.memory?.usedJSHeapSize || 0;
  console.log(`Memory used: ${(endMemory - startMemory) / 1024 / 1024} MB`);
  ```

### 🚨 Performance Issues

#### Issue: Slow Rendering (> 10 seconds for basic fractals)
```
Generation taking too long...
```

**Optimization Strategies:**
1. **Hardware Acceleration**: Enable in browser settings
2. **Resolution Scaling**: Adjust canvas size based on performance
   ```javascript
   // Auto-scale based on device capabilities
   const deviceRatio = window.devicePixelRatio || 1;
   const maxSize = deviceRatio > 2 ? 1024 : 2048; // Retina displays get smaller size
   ```

3. **Iteration Scaling**: Scale points with resolution
   ```javascript
   // Maintain consistent density
   const scaleFactor = Math.sqrt(canvasArea / baseArea);
   const scaledIterations = baseIterations * scaleFactor;
   ```

#### Issue: UI Freezing During Generation
```
Browser becomes unresponsive
```

**Solutions:**
- **Progress Indicators**: Show loading state
- **Async Processing**: Use requestAnimationFrame for UI updates
- **Web Workers**: Consider moving heavy computation (future enhancement)

## Debugging Tools and Utilities

### Console Debugging Commands

Open browser console and use these debug helpers:

#### Module Status Check
```javascript
// Check if WebAssembly is loaded
window.debugFractal?.checkModuleStatus();

// Test basic functionality  
window.debugFractal?.runBasicTests();

// Performance benchmark
window.debugFractal?.performanceBenchmark();
```

#### Memory Monitoring
```javascript
// Start memory tracking
window.debugFractal?.startMemoryMonitoring();

// Generate fractal with memory tracking
window.debugFractal?.generateWithMemoryTracking('sierpinski', 50000);

// Stop tracking and show report
window.debugFractal?.stopMemoryMonitoring();
```

#### Parameter Validation
```javascript
// Test parameter ranges
window.debugFractal?.validateParameters({
  iterations: 50000,
  canvasSize: 600,
  fractalType: 'mandelbrot'
});
```

### Browser Developer Tools Integration

#### Performance Profiling
1. **Open Dev Tools** → Performance tab
2. **Start Recording** before fractal generation
3. **Generate Fractal** 
4. **Stop Recording** after completion
5. **Analyze Timeline** for bottlenecks

#### Memory Analysis
1. **Open Dev Tools** → Memory tab
2. **Take Heap Snapshot** before generation
3. **Generate Fractal**
4. **Take Another Snapshot** after generation
5. **Compare Snapshots** to detect leaks

#### Network Monitoring
1. **Open Dev Tools** → Network tab
2. **Reload Page** to see WebAssembly loading
3. **Check for Failed Requests** (404s, CORS errors)
4. **Verify WASM File Size** (should be reasonable, < 1MB typically)

## Testing All Fractal Types

### Automated Test Suite
Run comprehensive tests for all fractal types:

```javascript
// Run in browser console after page load
window.debugFractal?.testAllFractals();
```

### Manual Testing Checklist

#### Escape-Time Fractals
- [ ] **Mandelbrot Set**: Default view renders correctly
- [ ] **Julia Set**: Parameter changes update fractal
- [ ] **Burning Ship**: Complex patterns visible
- [ ] **Zoom/Pan**: Click interactions work properly

#### Chaos Game Fractals  
- [ ] **Sierpinski Triangle**: Classic triangle pattern
- [ ] **Sierpinski Carpet**: Square-based pattern
- [ ] **Vicsek Square**: Cross-shaped pattern
- [ ] **T-Square**: Recursive T-patterns
- [ ] **Techs Pattern**: Variable offset works
- [ ] **Web Pattern**: Complex rule combinations

#### IFS (Iterated Function Systems)
- [ ] **Barnsley Fern**: Recognizable fern shape
- [ ] **Dragon Curve**: Dragon-like curves
- [ ] **Maple Leaf**: Leaf-like structure
- [ ] **Christmas Tree**: Tree-like pattern
- [ ] **Spiral**: Spiral formations
- [ ] **Custom IFS**: User-defined parameters work

#### Random Chaos Finder
- [ ] **Quadratic Maps**: Finds chaotic attractors
- [ ] **Cubic Maps**: More complex attractors
- [ ] **Parameter Display**: Shows found equation
- [ ] **Search Timeout**: Handles failed searches gracefully

### Parameter Edge Cases
Test boundary conditions:

```javascript
// Extreme values testing
const edgeCases = [
  { iterations: 1, canvasSize: 100 },     // Minimum values
  { iterations: 1000000, canvasSize: 4096 }, // Maximum values
  { iterations: 0, canvasSize: 0 },       // Invalid values
  { iterations: -1, canvasSize: -1 },     // Negative values
];

edgeCases.forEach(params => {
  window.debugFractal?.testParameters(params);
});
```

## Performance Optimization Tips

### Rendering Optimization
1. **Canvas Size**: Use appropriate resolution for device
2. **Iteration Scaling**: Scale points with canvas area
3. **Color Schemes**: Some may be faster than others
4. **Progressive Rendering**: Consider chunked generation for very large sets

### Memory Optimization
1. **Cleanup**: Clear previous results before new generation
2. **Canvas Reuse**: Don't recreate canvas unnecessarily
3. **Parameter Validation**: Catch invalid inputs early
4. **Batch Processing**: Group similar operations

### Browser-Specific Optimizations
- **Chrome**: Hardware acceleration in chrome://settings/
- **Firefox**: webgl.force-enabled in about:config
- **Safari**: WebGL enabled in Develop menu

## Error Recovery Mechanisms

### Automatic Fallbacks
The system includes automatic fallbacks for common issues:

1. **Parameter Validation**: Invalid inputs auto-corrected
2. **Memory Limits**: Large requests automatically scaled down
3. **Timeout Handling**: Long operations cancelled after reasonable time
4. **Graceful Degradation**: Fallback to lower quality if needed

### Manual Recovery Steps
If issues persist:

1. **Refresh Page**: Clears WebAssembly memory state
2. **Reduce Parameters**: Lower iteration count or canvas size
3. **Try Different Fractal**: Some types more robust than others
4. **Check Browser Console**: Look for specific error messages
5. **Restart Browser**: Clear any memory issues

## Development and Contributing

### Adding Debug Information
When reporting issues, include:

```javascript
// Run this and include output in bug reports
window.debugFractal?.generateDebugReport();
```

### Testing New Features
Before adding new functionality:

1. **Run Test Suite**: Ensure existing features still work
2. **Memory Profile**: Check for memory leaks
3. **Performance Test**: Benchmark against baseline
4. **Browser Test**: Verify cross-browser compatibility

### Performance Baselines
Expected performance ranges:

| Fractal Type | Points/Pixels | Time (600x600) | Performance |
|--------------|---------------|----------------|-------------|
| Sierpinski Triangle | 50,000 points | < 1 second | > 50K points/sec |
| Dragon Curve | 50,000 points | < 1 second | > 50K points/sec |
| Mandelbrot Set | 360,000 pixels | < 3 seconds | > 120K pixels/sec |
| Julia Set | 360,000 pixels | < 3 seconds | > 120K pixels/sec |
| Random Chaos | 100,000 points | < 5 seconds | > 20K points/sec |

## Browser Compatibility Matrix

| Browser | Version | WASM Support | Performance | Notes |
|---------|---------|--------------|-------------|-------|
| Chrome | 57+ | ✅ Full | ✅ Excellent | Recommended |
| Firefox | 52+ | ✅ Full | ✅ Good | Works well |
| Safari | 11+ | ✅ Full | ⚠️ Fair | Slower on complex fractals |
| Edge | 16+ | ✅ Full | ✅ Good | Similar to Chrome |

## Support and Troubleshooting

### Getting Help
1. **Check Console**: Look for error messages first
2. **Run Debug Tests**: Use built-in debugging tools
3. **Check Browser Compatibility**: Ensure supported browser/version
4. **Review Documentation**: Check README and code comments

### Known Limitations
- **Mobile Performance**: Limited by device computational power
- **Large Datasets**: Very high iteration counts may cause timeouts
- **Browser Memory**: Large canvas sizes limited by available RAM
- **Network Loading**: Initial WASM download requires internet connection

This debugging guide should help identify and resolve most WebAssembly integration issues. For additional support, refer to the main project documentation or submit an issue with debug output included.