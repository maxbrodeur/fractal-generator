# 🚀 Complete Installation & Testing Guide

This guide provides comprehensive step-by-step instructions to install, build, and test the WebAssembly fractal generator UI functionality.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Git**: For cloning the repository
- **Python 3.6+**: For running the local web server
- **Rust**: For compiling the WebAssembly module
- **wasm-pack**: For building WebAssembly packages

### System Requirements
- **Operating System**: Linux, macOS, or Windows (with WSL recommended)
- **Memory**: At least 2GB RAM for building Rust/WASM
- **Browser**: Modern browser with WebAssembly support (Chrome 57+, Firefox 52+, Safari 11+, Edge 16+)

## 🔧 Installation Methods

Choose one of the following installation methods:

### Method 1: Automated Setup (Recommended)

This is the fastest way to get up and running:

```bash
# 1. Clone the repository
git clone https://github.com/maxbrodeur/fractal-generator.git
cd fractal-generator

# 2. Run the automated setup script
chmod +x setup-wasm.sh
./setup-wasm.sh

# 3. Start the local web server
python3 -m http.server 8000
```

**Expected Output:**
```
🦀 Setting up Rust/WebAssembly Fractal Generator...
✅ Rust found: rustc 1.XX.X
✅ wasm-pack found: installed
🎯 Adding WebAssembly target...
🔨 Building WebAssembly module...
🎉 Setup complete!
```

### Method 2: Manual Setup

If you prefer manual control or the automated script fails:

#### Step 1: Install Rust
```bash
# Install Rust and Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

#### Step 2: Install wasm-pack
```bash
# Install wasm-pack for WebAssembly packaging
cargo install wasm-pack

# Verify installation
wasm-pack --version
```

#### Step 3: Add WebAssembly Target
```bash
# Add WebAssembly compilation target
rustup target add wasm32-unknown-unknown
```

#### Step 4: Clone and Build
```bash
# Clone the repository
git clone https://github.com/maxbrodeur/fractal-generator.git
cd fractal-generator

# Build the WebAssembly module
cd fractal-wasm
wasm-pack build --target web --out-dir pkg
cd ..
```

#### Step 5: Start Web Server
```bash
# Start local server (choose one)
python3 -m http.server 8000
# OR with Node.js: npx serve .
# OR with PHP: php -S localhost:8000
```

## 🧪 Testing UI Functionality

### Quick Automated Testing

For fastest verification, use the automated test suite:

```bash
# After installation, open the automated test page
http://localhost:8000/test-ui-functionality.html
```

Click "🚀 Run All Tests" to automatically verify:
- WebAssembly module loading
- Canvas rendering functionality  
- Fractal generation for all types
- Performance benchmarks
- Overall system integration

### Manual Testing Options

Choose based on your testing needs:

#### Option 1: Command Line Pre-Check
```bash
# Run installation verification script
./test-installation.sh
```

This script checks:
- ✅ All prerequisites (Rust, wasm-pack, Python)
- ✅ Project structure and file permissions
- ✅ WebAssembly build artifacts
- ✅ Server availability

#### Option 2: Basic Functionality Test

1. **Open the Simple Test Interface**
   ```
   http://localhost:8000/test-wasm.html
   ```

2. **Verify WebAssembly Loading**
   - You should see "WebAssembly module loaded successfully!" message
   - If you see an error, check the browser console (F12)

3. **Test Basic Fractal Generation**
   - Keep default settings (Sierpinski Triangle, 50,000 iterations)
   - Click "Generate Fractal" button
   - **Expected Result**: Orange/red triangular fractal pattern appears
   - **Performance**: Should show ~500,000+ points/second

#### Option 3: Advanced UI Testing

1. **Open the Full Application Interface**
   ```
   http://localhost:8000/wasm-frontend/index.html
   ```

2. **Test All Fractal Categories**

   #### Chaos Game Tab
   - **Test**: Select "Sierpinski Triangle" preset
   - **Action**: Click "Generate Fractal"
   - **Expected**: Classic triangular fractal pattern
   - **Performance**: 1M+ points/second typical
   
   #### Transformations Tab  
   - **Test**: Select "Dragon Curve" preset
   - **Action**: Click "Generate Fractal"
   - **Expected**: Dragon-shaped curve fractal
   - **Performance**: 4M+ points/second typical
   
   #### Random Chaos Finder Tab
   - **Test**: Click "Search for Chaos"
   - **Action**: Wait for chaotic map discovery
   - **Expected**: Random chaotic pattern with performance metrics
   - **Time**: Usually 1-10 seconds to find pattern

3. **Test Interactive Features**

   #### Zoom and Pan (Canvas Controls)
   - **Left-click**: Should zoom in 2x at click point
   - **Right-click**: Should zoom out 2x (context menu disabled)
   - **Coordinates**: Should display current mouse coordinates
   - **Zoom Level**: Should show current zoom multiplier

   #### Parameter Controls
   - **Iterations**: Change from 10,000 to 100,000
   - **Color Scheme**: Cycle through Fire, Jet, Turbo, etc.
   - **Canvas Size**: Test 400x400, 600x600, 800x800
   - **Auto-update**: Should re-render on parameter changes

   #### Download Functionality
   - **Click**: Download button (📥)
   - **Expected**: PNG file downloads with format `fractal_{tab}_{timestamp}.png`

## 🔍 Verification Checklist

Use this checklist to verify complete functionality:

### ✅ WebAssembly Integration
- [ ] WASM module loads without errors
- [ ] No console errors in browser dev tools (F12)
- [ ] Status messages show "Ready" state

### ✅ Core Rendering
- [ ] Sierpinski Triangle renders correctly
- [ ] Dragon Curve renders correctly  
- [ ] Mandelbrot Set renders correctly
- [ ] All color schemes work (Fire, Jet, Turbo, etc.)

### ✅ Performance Metrics
- [ ] Points/second counter displays
- [ ] Render time displays in milliseconds
- [ ] Performance > 500,000 points/second for simple fractals
- [ ] Performance > 1,000,000 pixels/second for escape-time fractals

### ✅ Interactive Controls
- [ ] Left-click zoom in works
- [ ] Right-click zoom out works  
- [ ] Coordinate display updates on mouse move
- [ ] Zoom level indicator updates
- [ ] Parameter changes trigger re-render

### ✅ UI Components
- [ ] All tabs switch correctly (Chaos Game, Transformations, Chaos Finder, About)
- [ ] Dropdown menus populate correctly
- [ ] Input fields accept valid ranges
- [ ] Download button generates PNG files

## 🐛 Troubleshooting

### Common Issues and Solutions

#### "WebAssembly module failed to load"
**Symptoms**: Error message on page load, no fractal generation
**Solutions**:
```bash
# Rebuild WebAssembly module
cd fractal-wasm
wasm-pack build --target web --out-dir pkg
cd ..

# Check file permissions
ls -la fractal-wasm/pkg/
```

#### "Connection refused" or "Cannot reach localhost:8000"
**Symptoms**: Browser can't load the page
**Solutions**:
```bash
# Ensure server is running
python3 -m http.server 8000

# Try different port
python3 -m http.server 8080

# Check firewall settings
```

#### Poor Performance (< 100,000 points/second)
**Symptoms**: Slow fractal generation, laggy UI
**Solutions**:
- Close other browser tabs
- Try smaller iteration counts (10,000 instead of 100,000)
- Use smaller canvas size (400x400 instead of 800x800)
- Check if browser hardware acceleration is enabled

#### "Mixed Content" or CORS Errors
**Symptoms**: Console errors about blocked resources
**Solutions**:
```bash
# Must use http server, not file:// protocol
# Ensure you're accessing http://localhost:8000/
# Check if any CDN resources are blocked
```

#### Build Failures
**Symptoms**: Rust compilation errors during setup
**Solutions**:
```bash
# Update Rust toolchain
rustup update

# Clean and rebuild
cd fractal-wasm
cargo clean
wasm-pack build --target web --out-dir pkg
```

### Getting Help

If you encounter issues not covered here:

1. **Check Browser Console**: Open developer tools (F12) and look for error messages
2. **Verify File Structure**: Ensure `fractal-wasm/pkg/` directory exists with `.wasm` and `.js` files
3. **Test Rust Installation**: Run `cargo --version` and `wasm-pack --version`
4. **Try Different Browser**: Test in Chrome, Firefox, or Safari

## 📊 Expected Performance Benchmarks

On a modern system, you should see these performance levels:

| Fractal Type | Typical Performance | Canvas Size |
|--------------|-------------------|-------------|
| Sierpinski Triangle | 1,000,000+ points/sec | 600x600 |
| Dragon Curve | 4,000,000+ points/sec | 600x600 |  
| Barnsley Fern | 2,000,000+ points/sec | 600x600 |
| Mandelbrot Set | 6,000,000+ pixels/sec | 600x600 |
| Julia Set | 5,000,000+ pixels/sec | 600x600 |
| Random Chaos | 1,250,000+ points/sec | 600x600 |

## 🎯 Success Indicators

Your installation is successful when:

1. **Fast Loading**: Pages load in < 2 seconds
2. **High Performance**: Fractal generation completes in < 1 second for typical parameters
3. **Smooth Interaction**: Zoom/pan responds immediately
4. **No Errors**: Browser console shows no red error messages
5. **Complete Features**: All tabs, presets, and downloads work correctly

You now have a fully functional high-performance WebAssembly fractal generator! 🎉

## 📚 Next Steps

- Explore different fractal presets and parameters
- Try the chaos finder to discover new patterns  
- Experiment with different color schemes
- Use the zoom controls to explore fractal details
- Export your favorite fractals as PNG images

## 🛠️ Testing Tools Reference

This repository includes several testing utilities:

1. **`test-installation.sh`** - Command line installation verification
2. **`test-ui-functionality.html`** - Automated browser-based testing 
3. **`test-wasm.html`** - Simple manual testing interface
4. **`wasm-frontend/index.html`** - Full application interface

For more details about the algorithms and mathematical background, see the main [README.md](README.md) file.