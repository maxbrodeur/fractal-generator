# Fractal Generator WebAssembly Project

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository
- **Prerequisites Installation** (first time only):
  ```bash
  # Install Rust (if not present)
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source ~/.cargo/env
  
  # Install wasm-pack - takes 3+ minutes. NEVER CANCEL.
  cargo install wasm-pack
  # Set timeout to 300+ seconds for this command
  
  # Install npm dependencies - takes 30 seconds
  npm install
  ```

- **Build Process**:
  ```bash
  # Full build process - takes 3+ minutes. NEVER CANCEL.
  npm run build
  # Set timeout to 300+ seconds. Includes Rust compilation and WebAssembly generation.
  ```

- **Development Server**:
  ```bash
  # Start local development server
  npm run serve
  # Server runs on http://localhost:8000
  ```

- **Combined Development Workflow**:
  ```bash
  # Build and serve in one command
  npm run dev
  ```

### Testing
- **Integration Tests** - takes 60 seconds. NEVER CANCEL. Set timeout to 120+ seconds:
  ```bash
  npm run test
  ```
- **Manual Validation Scenarios** (ALWAYS perform after changes):
  1. **Random Chaos Generation**: Select "Random Chaos Finder" → Click "Generate Fractal" → Verify fractal appears and completion message shows (should take 1-3 seconds for 10M+ points)
  2. **Chaos Game**: Select "Chaos Game" → Choose "Sierpinski Triangle" → Click "Generate" → Verify classic triangle pattern appears in under 100ms
  3. **Parameter Testing**: Change canvas size to different resolutions → Verify generation still works
  4. **Download Functionality**: Generate any fractal → Click "Download PNG" → Verify file downloads successfully

### Code Quality
- **Rust Formatting** (currently fails - needs fixing):
  ```bash
  cd fractal-wasm
  cargo fmt  # Fix formatting
  cargo fmt --check  # Verify formatting
  ```
- **Rust Linting** (currently has 4 warnings - needs fixing):
  ```bash
  cd fractal-wasm
  cargo clippy -- -D warnings  # Check for issues
  ```

### Deployment
- **GitHub Pages Deployment**:
  ```bash
  npm run deploy
  # Builds and deploys to gh-pages branch
  ```

## Performance Expectations

### Build Times (NEVER CANCEL - Set appropriate timeouts)
- **wasm-pack installation**: 3 minutes (first time only) - timeout: 300+ seconds
- **npm install**: 30 seconds - timeout: 60+ seconds  
- **npm run build**: 3 minutes - timeout: 300+ seconds
- **npm run test**: 60 seconds - timeout: 120+ seconds

### Application Performance
- **Random Chaos generation**: 1-3 seconds for 10M+ points
- **Chaos Game (Sierpinski)**: <100ms for 150K points
- **Mandelbrot/Julia sets**: 2-5 seconds for high resolution
- **Application startup**: Near-instant once built

## Validation Requirements

### CRITICAL: Manual Testing Protocol
After making ANY changes, ALWAYS run through these validation scenarios:

1. **Basic Functionality Test**:
   - Navigate to http://localhost:8000
   - Verify "WebAssembly loaded successfully!" message appears
   - Generate at least one fractal to confirm core functionality

2. **Multi-Fractal Validation**:
   - Test Random Chaos Finder (should complete in 1-3 seconds)
   - Test Chaos Game with Sierpinski Triangle (should complete in <100ms)
   - Test Escape-Time Fractals if modifying that functionality

3. **Performance Regression Test**:
   - Generate Random Chaos with 10M points - should complete under 3 seconds
   - Generate Chaos Game with 50K points - should complete under 100ms

4. **Cross-Resolution Testing**:
   - Test at least 3 different canvas sizes (400x400, 1024x1024, 2048x2048)
   - Verify no crashes or excessive memory usage

## Common Tasks Reference

### Repository Structure
```
fractal-generator/
├── fractal-wasm/           # Rust WebAssembly source code
│   ├── src/               # Rust fractal algorithms
│   ├── Cargo.toml         # Rust project configuration
│   └── pkg/              # WebAssembly build output (generated)
├── deploy/               # Distribution directory (generated)
│   ├── index.html        # Main application (with corrected WASM paths)
│   └── pkg/             # WebAssembly files for deployment
├── python_implementation/ # Legacy Python implementation
├── build.js             # Node.js build automation script
├── package.json         # npm configuration and scripts
├── index.html          # Main application source
├── debug-helpers.js    # WebAssembly debugging utilities
└── test-wasm.html      # Simple test interface
```

### Key Files and Their Purposes
- **`fractal-wasm/src/lib.rs`**: Core Rust fractal algorithms and WebAssembly bindings
- **`build.js`**: Automated build script that compiles WASM and prepares deployment
- **`index.html`**: Main interactive fractal generator interface
- **`debug-helpers.js`**: Comprehensive debugging tools for WebAssembly integration
- **`wasm-integration-test.js`**: Automated test suite for validating WASM functionality

### Troubleshooting Common Issues

#### WebAssembly Loading Errors
- **Always use HTTP server**: WASM modules cannot load via `file://` protocol
- **Port conflicts**: Use `npm run serve` (port 8000) or manually start `python3 -m http.server 8001`
- **CORS issues**: Ensure local server is running, don't open HTML files directly

#### Build Failures
- **Rust not found**: Install Rust from https://rustup.rs/
- **wasm-pack missing**: Run `cargo install wasm-pack` (takes 3+ minutes)
- **WebAssembly target missing**: Run `rustup target add wasm32-unknown-unknown`
- **Memory/compilation errors**: Clear `fractal-wasm/target/` directory and rebuild

#### Code Quality Issues (Current Status)
- **Rust formatting fails**: Run `cargo fmt` in `fractal-wasm/` directory to fix
- **Clippy warnings**: 4 clippy warnings exist that prevent `cargo clippy -- -D warnings` from passing
- **Integration tests partial**: Test server conflicts cause some tests to skip

## Important Notes

### NEVER CANCEL Commands
- **wasm-pack installation**: 3+ minutes is normal
- **npm run build**: 3+ minutes is normal  
- **Rust compilation**: Can take several minutes, especially on first build

### Always Use HTTP Server
- **Never open HTML directly**: Must use `npm run serve` or equivalent HTTP server
- **WASM security**: Browsers block WebAssembly loading from `file://` protocol

### Memory Considerations
- **High-resolution fractals**: 4K+ resolutions use significant memory
- **Long iterations**: 10M+ iterations are normal and supported
- **Browser limits**: Some browsers may limit very large allocations

### Development Workflow
1. **Make changes** to Rust code in `fractal-wasm/src/`
2. **Build**: `npm run build` (3+ minute timeout)
3. **Test**: Open http://localhost:8000 and run manual validation scenarios  
4. **Validate**: Ensure core fractal generation still works as expected
5. **Deploy**: `npm run deploy` when ready for production

Always build and exercise your changes with the manual validation scenarios before considering work complete.