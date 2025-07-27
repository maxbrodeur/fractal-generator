#!/bin/bash

# WebAssembly Fractal Generator Setup Script
# This script automates the installation and setup process

set -e

echo "🦀 Setting up Rust/WebAssembly Fractal Generator..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Rust
if ! command_exists rustc; then
    echo "❌ Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed successfully"
else
    echo "✅ Rust found: $(rustc --version)"
fi

# Check for wasm-pack
if ! command_exists wasm-pack; then
    echo "📦 Installing wasm-pack..."
    cargo install wasm-pack
    echo "✅ wasm-pack installed successfully"
else
    echo "✅ wasm-pack found: $(wasm-pack --version 2>/dev/null || echo 'installed')"
fi

# Add wasm32 target if not present
echo "🎯 Adding WebAssembly target..."
rustup target add wasm32-unknown-unknown

# Build the WebAssembly module
echo "🔨 Building WebAssembly module..."
cd fractal-wasm
wasm-pack build --target web --out-dir pkg
cd ..

echo ""
echo "🎉 Setup complete! To run the demo:"
echo ""
echo "1. Start a local server:"
echo "   python3 -m http.server 8000"
echo "   # or with Node.js: npx serve ."
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:8000/test-wasm.html"
echo ""
echo "📊 The demo includes interactive controls and performance benchmarks!"