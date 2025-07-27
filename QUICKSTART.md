# 🚀 Quick Start Guide - WebAssembly Fractal Demo

Want to test the high-performance WebAssembly fractal generator? Here's the fastest way to get started:

> **📋 For comprehensive installation instructions and UI testing procedures, see the [Complete Installation & Testing Guide](./INSTALL.md)**

## Option 1: Automated Setup (Recommended)

```bash
# Clone and navigate to the repository
git clone https://github.com/maxbrodeur/fractal-generator.git
cd fractal-generator

# Run the automated setup script
./setup-wasm.sh

# Start local server
python3 -m http.server 8000

# Open browser to http://localhost:8000/test-wasm.html
```

## Option 2: Manual Setup

### Prerequisites
- Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- wasm-pack: `cargo install wasm-pack`

### Build and Run
```bash
cd fractal-wasm
wasm-pack build --target web --out-dir pkg
cd ..
python3 -m http.server 8000
# Open http://localhost:8000/test-wasm.html
```

## What You'll See

- **Interactive Fractal Generator** with organized controls for different algorithms
- **Performance Benchmarks** showing 10-100x speedup over Python
- **Three Fractal Categories**:
  - **Chaos Game**: Sierpinski Triangle with rule-based vertex selection
  - **IFS (Iterated Function Systems)**: Dragon Curve, Barnsley Fern, etc.
  - **Escape-time Fractals**: Mandelbrot Set, Julia Set, Burning Ship
  - **Random Chaos Finder**: Parameter UI ready (full implementation pending)
- **7 Color Schemes**: Fire, Jet, Prism, Turbo, Color Wheel, GNU Plot, BMY
- **Enhanced Visibility**: Improved color density mapping for crisp, vibrant fractals
- **Responsive Canvas**: 400x400, 600x600, or 800x800 pixel rendering

## Need Help?

See the full documentation in [`fractal-wasm/README.md`](./fractal-wasm/README.md) for detailed installation instructions and API reference.