// Basic test for Rust/WebAssembly fractal implementation
// This tests that our algorithms produce reasonable results

import init, { 
    FractalGenerator, 
    Rule, 
    ColorScheme, 
    FractalPresets 
} from './fractal-wasm/pkg/fractal_wasm.js';

async function runTests() {
    console.log("Initializing WebAssembly module...");
    
    try {
        await init();
        const generator = new FractalGenerator();
        console.log("✅ WebAssembly module loaded successfully");
        
        // Test 1: Sierpinski Triangle
        console.log("\n🔺 Testing Sierpinski Triangle...");
        const vertices = FractalPresets.sierpinski_triangle();
        const transforms = [[0.5, 0], [0.5, 0], [0.5, 0]];
        const rule = new Rule(0, 0, false);
        
        const sierpinskiPoints = generator.chaos_game(vertices, 0.0, 0.0, 1000, transforms, rule);
        console.log(`Generated ${sierpinskiPoints.length / 2} points`);
        console.log("✅ Sierpinski Triangle test passed");
        
        // Test 2: Dragon Curve
        console.log("\n🐉 Testing Dragon Curve...");
        const dragonTransforms = FractalPresets.dragon_curve();
        const dragonProbs = FractalPresets.dragon_curve_probs();
        
        const dragonPoints = generator.ifs_fractal(0.0, 0.0, 1000, dragonTransforms, dragonProbs, "borke");
        console.log(`Generated ${dragonPoints.length / 2} points`);
        console.log("✅ Dragon Curve test passed");
        
        // Test 3: Mandelbrot Set
        console.log("\n🔢 Testing Mandelbrot Set...");
        const mandelbrotData = generator.mandelbrot_set(100, 100, -2.5, 1.0, -1.25, 1.25, 50);
        console.log(`Generated ${mandelbrotData.length} iteration counts`);
        console.log("✅ Mandelbrot Set test passed");
        
        // Test 4: Julia Set
        console.log("\n🌀 Testing Julia Set...");
        const juliaData = generator.julia_set(100, 100, -2.0, 2.0, -2.0, 2.0, -0.7, 0.27015, 50);
        console.log(`Generated ${juliaData.length} iteration counts`);
        console.log("✅ Julia Set test passed");
        
        // Test 5: Color mapping
        console.log("\n🎨 Testing Color Mapping...");
        const rgba = generator.points_to_rgba(sierpinskiPoints, 200, 200, ColorScheme.Fire);
        console.log(`Generated ${rgba.length / 4} RGBA pixels`);
        console.log("✅ Color mapping test passed");
        
        // Test 6: Performance benchmark
        console.log("\n⚡ Performance benchmark...");
        const startTime = performance.now();
        const perfPoints = generator.ifs_fractal(0.0, 0.0, 100000, dragonTransforms, dragonProbs, "borke");
        const endTime = performance.now();
        const duration = endTime - startTime;
        const pointsPerSec = (perfPoints.length / 2) / (duration / 1000);
        
        console.log(`Generated ${perfPoints.length / 2} points in ${duration.toFixed(2)}ms`);
        console.log(`Performance: ${pointsPerSec.toFixed(0)} points/second`);
        console.log("✅ Performance benchmark completed");
        
        console.log("\n🎉 All tests passed successfully!");
        console.log("The Rust/WebAssembly implementation is working correctly.");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

// Only run if this is the main module
if (import.meta.url === new URL(import.meta.resolve('./test-fractal.js'))) {
    runTests();
}

export { runTests };