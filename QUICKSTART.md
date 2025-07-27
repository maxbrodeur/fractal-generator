# 🚀 Quick Start Guide - WebAssembly Fractal Demo

Want to test the high-performance WebAssembly fractal generator? Here's the fastest way to get started:

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

- **Interactive Fractal Generator** with real-time controls
- **Performance Benchmarks** showing 10-100x speedup over Python
- **Multiple Algorithms**: Chaos Game, IFS, Escape-time fractals  
- **7 Color Schemes**: Fire, Jet, Prism, Turbo, and more
- **Live Rendering** of Sierpinski Triangle, Dragon Curve, Mandelbrot Set, etc.

## Need Help?

See the full documentation in [`fractal-wasm/README.md`](./fractal-wasm/README.md) for detailed installation instructions and API reference.