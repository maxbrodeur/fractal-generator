#!/bin/bash

# Fractal Generator Desktop Build Script
# This script provides instructions and basic setup for building the desktop application

echo "🖥️  Fractal Generator Desktop Build Setup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Build Requirements Check:"
echo ""

# Check for Rust
if command -v rustc &> /dev/null; then
    echo "✅ Rust found: $(rustc --version)"
else
    echo "❌ Rust not found. Please install from https://rustup.rs/"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check for Cargo
if command -v cargo &> /dev/null; then
    echo "✅ Cargo found: $(cargo --version)"
else
    echo "❌ Cargo not found. Reinstall Rust from https://rustup.rs/"
    exit 1
fi

echo ""
echo "🔧 System Dependencies:"
echo ""

case "$(uname -s)" in
    Linux*)
        echo "📱 Linux detected"
        echo "Required packages: libgtk-3-dev libwebkit2gtk-4.0-dev build-essential"
        echo "Install with: sudo apt update && sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev build-essential"
        
        # Check if dependencies are available
        if dpkg -l | grep -q libgtk-3-dev; then
            echo "✅ libgtk-3-dev found"
        else
            echo "❌ libgtk-3-dev not found"
        fi
        ;;
    Darwin*)
        echo "🍎 macOS detected"
        echo "Required: Xcode Command Line Tools"
        echo "Install with: xcode-select --install"
        
        if xcode-select -p &> /dev/null; then
            echo "✅ Xcode Command Line Tools found"
        else
            echo "❌ Xcode Command Line Tools not found"
        fi
        ;;
    MINGW*|CYGWIN*|MSYS*)
        echo "🪟 Windows detected"
        echo "Required: Microsoft C++ Build Tools"
        echo "Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
        ;;
    *)
        echo "❓ Unknown system: $(uname -s)"
        ;;
esac

echo ""
echo "🚀 Build Instructions:"
echo ""
echo "1. Install system dependencies (see above)"
echo "2. Install Tauri CLI:"
echo "   cargo install tauri-cli"
echo ""
echo "3. Build the desktop application:"
echo "   cd src-tauri"
echo "   cargo build"
echo ""
echo "4. Run the desktop application:"
echo "   cargo run"
echo ""
echo "5. For release build:"
echo "   cargo build --release"
echo ""

echo "📁 Project Structure:"
echo ""
echo "src-tauri/              # Desktop application source"
echo "├── src/"
echo "│   ├── lib.rs          # Main Tauri application"
echo "│   └── fractals.rs     # Enhanced fractal algorithms"
echo "├── Cargo.toml          # Rust dependencies"
echo "├── tauri.conf.json     # Tauri configuration"
echo "└── index.html          # Desktop-optimized frontend"
echo ""

echo "🎯 Key Features:"
echo ""
echo "• No browser memory limitations"
echo "• Canvas sizes up to 16,384px (vs 8,192px web)"
echo "• Iterations up to 100M+ (vs 10M web)"
echo "• Multi-threaded parallel processing"
echo "• Enhanced export capabilities"
echo "• Real-time system resource monitoring"
echo ""

echo "📖 For detailed documentation, see DESKTOP.md"
echo ""

# Check if Tauri CLI is installed
if command -v cargo-tauri &> /dev/null; then
    echo "✅ Tauri CLI found"
    echo "🎉 Ready to build! Run: cd src-tauri && cargo build"
else
    echo "⚠️  Tauri CLI not found. Install with: cargo install tauri-cli"
fi

echo ""
echo "💡 Tip: For development, use 'cargo run' in src-tauri/ directory"
echo "💡 Tip: The desktop app provides same functionality as web with enhanced performance"