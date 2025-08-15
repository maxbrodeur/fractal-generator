# Fractal Generator Desktop Application

## Overview

The Fractal Generator Desktop Application provides the same functionality as the web application but without browser limitations, enabling the generation of extremely high-resolution fractals by leveraging full system hardware resources.

## Key Advantages over Web Version

### Performance Benefits
- **No memory limitations**: Generate fractals with unlimited iteration counts (web: ~10M, desktop: 100M+)
- **Ultra-high resolution support**: Canvas sizes up to 16,384px (web: limited to 8,192px)
- **Parallel processing**: Utilizes all available CPU cores with Rayon
- **Enhanced performance**: Native Rust execution without WebAssembly overhead

### Desktop-Specific Features
- **Better file I/O**: Direct access to filesystem for enhanced export capabilities
- **Progress indicators**: Real-time feedback during long computations
- **System resource monitoring**: Display of available cores, memory, and capabilities
- **Batch processing**: Potential for generating multiple fractals in sequence
- **Extended export formats**: Support for higher quality image formats

## Technical Architecture

### Backend (Rust)
- **Tauri Framework**: Provides secure bridge between Rust backend and web frontend
- **Fractal Algorithms**: Reused and enhanced from the WebAssembly version
- **Parallel Computing**: Rayon for multi-threaded fractal generation
- **Native Performance**: Direct hardware access without browser constraints

### Frontend (HTML/JS/CSS)
- **Adapted Web Interface**: Enhanced version of the existing web UI
- **Tauri API Integration**: Uses `invoke()` to call Rust backend functions
- **Desktop-Optimized Controls**: Extended parameter ranges and capabilities
- **Real-time System Info**: Display of hardware capabilities and limits

### Fractal Generation Pipeline
1. **Frontend**: User selects parameters (method, iterations, resolution, colors)
2. **Tauri Bridge**: Parameters sent to Rust backend via secure IPC
3. **Rust Backend**: Native fractal generation with full hardware utilization
4. **Result Processing**: Color mapping and image data preparation
5. **Frontend Display**: Rendered to HTML5 canvas with enhanced quality

## Supported Fractal Types

### Chaos Game Fractals
- **Sierpinski Triangle**: Classic fractal with configurable rules
- **Pentagon/Hexagon**: Polygonal variations with custom vertices
- **Custom Rules**: User-defined constraints and transformations
- **Enhanced Iterations**: Up to 100M points (vs 10M in browser)

### Iterated Function Systems (IFS)
- **Barnsley Fern**: Classic plant-like fractal
- **Dragon Curve**: Self-similar dragon-shaped fractal  
- **Custom Transformations**: User-defined affine transformations
- **Probability Weighting**: Custom probability distributions

### Escape-Time Fractals
- **Mandelbrot Set**: Classic fractal with configurable zoom regions
- **Julia Sets**: Parameter-dependent fractals with real-time preview
- **High-Resolution Rendering**: Parallel computation for large images
- **Custom Color Schemes**: Enhanced color mapping options

### Random Chaos Finder
- **Automated Discovery**: Systematic exploration of parameter space
- **Lyapunov Analysis**: Chaos detection using mathematical metrics
- **Pattern Recognition**: Identification of interesting chaotic behaviors
- **Batch Generation**: Multiple chaos maps in sequence

## Installation and Setup

### Prerequisites
- **Rust Toolchain**: Install from [rustup.rs](https://rustup.rs/)
- **System Dependencies**: Platform-specific GUI libraries
  - Linux: `sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev`
  - macOS: Xcode Command Line Tools
  - Windows: Microsoft C++ Build Tools

### Building the Desktop App

```bash
# Clone the repository
git clone https://github.com/maxbrodeur/fractal-generator.git
cd fractal-generator

# Install Tauri CLI (one-time setup)
cargo install tauri-cli

# Build the desktop application
npm run build:desktop

# Run in development mode
npm run run:desktop

# Build release version
npm run package:desktop
```

### System Requirements

#### Minimum Requirements
- **RAM**: 4GB (8GB recommended for high-resolution fractals)
- **CPU**: Multi-core processor (4+ cores recommended)
- **Storage**: 100MB for application, additional space for exports
- **OS**: Windows 10+, macOS 10.15+, or Linux with GTK3

#### Recommended Specifications
- **RAM**: 16GB+ for ultra-high resolution fractals
- **CPU**: 8+ cores for optimal parallel processing
- **GPU**: Dedicated graphics card (future GPU compute support)
- **Storage**: SSD for faster file operations

## Usage Guide

### Basic Operation
1. **Launch Application**: Run the desktop executable
2. **Select Fractal Type**: Choose from chaos game, IFS, escape-time, or random chaos
3. **Configure Parameters**: Set iterations, resolution, and other options
4. **Generate Fractal**: Click "Generate Fractal" to compute
5. **Export Results**: Use "Export High-Res PNG" for saving

### Advanced Features

#### High-Resolution Generation
- **Canvas Sizes**: Support for resolutions up to 16,384×16,384 pixels
- **Iteration Counts**: Generate fractals with 100M+ iterations
- **Memory Management**: Automatic optimization for available system resources
- **Progress Tracking**: Real-time feedback during long computations

#### Export Capabilities
- **Multiple Formats**: PNG with potential for TIFF, EXR in future
- **Batch Export**: Generate multiple resolutions simultaneously
- **Metadata Preservation**: Embed generation parameters in exported files
- **Quality Settings**: Configurable compression and color depth

#### Performance Optimization
- **Parallel Processing**: Automatic detection and utilization of all CPU cores
- **Memory Efficiency**: Optimized algorithms for large datasets
- **Progressive Rendering**: Real-time preview during generation
- **Interrupt Support**: Ability to cancel long-running operations

## Comparison: Desktop vs Web

| Feature | Web Version | Desktop Version |
|---------|-------------|----------------|
| Max Canvas Size | 8,192px | 16,384px |
| Max Iterations | 10M | 100M+ |
| Memory Limit | Browser heap | System RAM |
| CPU Utilization | Single-threaded | Multi-threaded |
| Export Quality | Canvas-limited | Native resolution |
| Installation | None required | Local setup |
| Performance | WebAssembly | Native speed |
| File Access | Downloads only | Full filesystem |

## Development and Extension

### Code Structure
```
src-tauri/
├── src/
│   ├── lib.rs          # Main Tauri application
│   ├── fractals.rs     # Core fractal algorithms
│   └── main.rs         # Application entry point
├── tauri.conf.json     # Tauri configuration
├── Cargo.toml          # Rust dependencies
└── index.html          # Desktop frontend
```

### Adding New Fractal Types
1. **Implement Algorithm**: Add new function to `fractals.rs`
2. **Create Tauri Command**: Expose function via `#[tauri::command]`
3. **Update Frontend**: Add UI controls and invoke logic
4. **Test Integration**: Ensure proper parameter handling

### Performance Optimization
- **SIMD Instructions**: Use CPU vector operations for faster computation
- **GPU Acceleration**: Future support for CUDA/OpenCL computation
- **Memory Pools**: Reduce allocation overhead for large datasets
- **Streaming**: Process fractal data in chunks for memory efficiency

## Future Enhancements

### Planned Features
- **GPU Acceleration**: CUDA/OpenCL support for massively parallel computation
- **3D Fractals**: Extension to three-dimensional fractal generation
- **Animation Support**: Time-based parameter evolution for fractal movies
- **Cluster Computing**: Distributed generation across multiple machines
- **Plugin System**: User-defined fractal algorithms and color schemes

### Performance Targets
- **Ultra-HD (4K)**: Real-time generation at 3840×2160 resolution
- **8K Resolution**: Sub-minute generation times for 7680×4320 images
- **Billion-Point Fractals**: Support for 1B+ iteration chaos games
- **Interactive Zoom**: Real-time exploration of escape-time fractals

## Contributing

### Development Setup
1. Install Rust and Tauri CLI
2. Clone repository and navigate to `src-tauri/`
3. Run `cargo run` for development builds
4. Use `cargo test` for running algorithm tests

### Code Guidelines
- **Performance First**: Optimize for speed and memory efficiency
- **Safety**: Use Rust's safety features to prevent crashes
- **Documentation**: Comprehensive comments for complex algorithms
- **Testing**: Unit tests for all fractal generation functions

## License and Credits

This desktop application builds upon the original fractal generator web application while adding significant performance and capability enhancements. The core algorithms maintain compatibility with the web version while leveraging native desktop capabilities for superior performance.

**Original Web Version**: Max Brodeur & Theo Fabi  
**Desktop Enhancement**: Focused on removing browser limitations and maximizing hardware utilization