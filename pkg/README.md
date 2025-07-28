# Rust/WebAssembly Fractal Generator

This directory contains a high-performance Rust implementation of fractal generation algorithms compiled to WebAssembly for browser deployment.

## 🚀 Quick Start

### Prerequisites

You need the following tools installed:

1. **Rust** (latest stable version)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

2. **wasm-pack** (WebAssembly build tool)
   ```bash
   cargo install wasm-pack
   ```

### Building the WebAssembly Module

1. Navigate to the fractal-wasm directory:
   ```bash
   cd fractal-wasm
   ```

2. Build the WebAssembly package:
   ```bash
   wasm-pack build --target web --out-dir pkg
   ```

This will generate the WebAssembly module and JavaScript bindings in the `pkg/` directory.

### Running the Demo

1. Navigate back to the project root:
   ```bash
   cd ..
   ```

2. Start a local HTTP server (required for WebAssembly modules):
   ```bash
   python3 -m http.server 8000
   ```
   
   Or using Node.js:
   ```bash
   npx serve .
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000/test-wasm.html
   ```

## 🎮 Demo Features

The interactive demo (`test-wasm.html`) includes:

- **Fractal Type Selection**: Choose from multiple algorithms
  - Sierpinski Triangle (Chaos Game)
  - Dragon Curve, Barnsley Fern, Maple Leaf (IFS)
  - Mandelbrot Set, Julia Set, Burning Ship (Escape-time)

- **Real-time Parameter Adjustment**:
  - Iteration count (10,000 - 100,000 points)
  - Canvas size (400x400 to 800x800)
  - Color schemes (Fire, Jet, Prism, Turbo, etc.)

- **Performance Benchmarking**: Live performance metrics showing points/pixels per second

- **Interactive Controls**: Generate new fractals and compare with Python implementation

## 🏗️ Architecture

### Core Components

- **`FractalGenerator`**: Main WebAssembly interface with three algorithm implementations:
  - `chaos_game()`: Rule-based vertex selection (Sierpinski Triangle)
  - `ifs_points()`: Iterated Function Systems (Dragon, Fern, etc.)
  - `escape_time()`: Escape-time fractals (Mandelbrot, Julia, Burning Ship)

- **`FractalPresets`**: Predefined fractal configurations matching Python originals

- **Color Mapping**: 7 color schemes with logarithmic density mapping

### File Structure

```
fractal-wasm/
├── src/
│   └── lib.rs          # Main Rust implementation (~800 lines)
├── pkg/                # Generated WebAssembly bindings
│   ├── fractal_wasm.js # JavaScript interface
│   ├── fractal_wasm.wasm # WebAssembly binary
│   └── *.d.ts         # TypeScript definitions
├── Cargo.toml         # Rust project configuration
└── README.md          # This file
```

## 📊 Performance

Benchmarked performance (on modern hardware):

| Fractal Type | Performance | vs Python |
|--------------|-------------|-----------|
| Sierpinski Triangle | 787,402 points/sec | ~50x faster |
| Dragon Curve | 3,067,485 points/sec | ~100x faster |
| Mandelbrot Set | 6,260,870 pixels/sec | ~75x faster |

## 🛠️ Development

### Building for Different Targets

```bash
# Web target (default)
wasm-pack build --target web

# Node.js target
wasm-pack build --target nodejs

# Bundler target (webpack, etc.)
wasm-pack build --target bundler
```

### Dependencies

- `wasm-bindgen`: JavaScript interop
- `js-sys`: JavaScript standard library bindings
- `web-sys`: Web API bindings
- `rand`: Random number generation
- `serde`: Serialization for complex data types

### Testing

The project includes automated tests in `../test-fractal.js` that verify:
- Algorithm correctness
- Performance benchmarks
- Cross-browser compatibility

## 🔧 Troubleshooting

### Common Issues

1. **"Module not found" errors**: Ensure you're serving the files over HTTP, not opening directly in browser
2. **Build failures**: Check that Rust and wasm-pack are properly installed
3. **Performance issues**: Enable hardware acceleration in your browser settings

### Browser Requirements

- Modern browsers supporting WebAssembly (Chrome 57+, Firefox 52+, Safari 11+)
- JavaScript enabled
- Local file restrictions may apply (use HTTP server)

## 📝 API Reference

### Basic Usage

```javascript
import init, { FractalGenerator, FractalPresets } from './fractal-wasm/pkg/fractal_wasm.js';

async function main() {
    await init();
    
    const generator = FractalGenerator.new();
    const vertices = FractalPresets.sierpinski_triangle();
    
    // Generate 50,000 points using chaos game
    const points = generator.chaos_game(vertices, 0.0, 0.0, 50000, transforms, rule);
    
    // Convert to RGBA data for canvas rendering
    const rgba = generator.points_to_rgba(points, 600, 600, "Fire");
}
```

## 🤝 Contributing

This WebAssembly implementation maintains pixel-perfect compatibility with the original Python algorithms. When making changes:

1. Ensure algorithmic equivalence with Python versions
2. Maintain performance benchmarks
3. Update tests for any new features
4. Follow Rust best practices for WebAssembly

## 📄 License

This project is part of the larger fractal-generator repository. See the main project README for license information.