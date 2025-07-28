# Build Process Documentation

This project uses a simplified Node.js-based build system for WebAssembly compilation and static file management.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run serve

# Build and serve in one command
npm run dev

# Deploy to GitHub Pages
npm run deploy
```

## Build System Overview

The build system consists of:

- **`build.js`** - Node.js build automation script
- **`package.json`** - NPM configuration with minimal dependencies
- **`dist/`** - Build output directory

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile WebAssembly and create dist directory |
| `npm run serve` | Start local development server on port 8000 |
| `npm run dev` | Build and serve in one command |
| `npm run deploy` | Build and deploy to GitHub Pages |

## Dependencies

- **`wasm-pack`** - WebAssembly compilation (installed via Cargo)
- **`http-server`** - Local development server
- **`gh-pages`** - GitHub Pages deployment

## Build Process

The `build.js` script performs the following steps:

1. **Prerequisites Check** - Verifies Rust/Cargo and wasm-pack are installed
2. **WebAssembly Compilation** - Runs `wasm-pack build --target web --out-dir pkg`
3. **Directory Setup** - Creates and cleans `dist/` directory
4. **File Copying** - Copies WebAssembly files from `fractal-wasm/pkg/` to `dist/pkg/`
5. **Asset Management** - Copies HTML files, assets, and other static resources
6. **Path Correction** - Fixes WebAssembly import paths in HTML files for distribution
7. **Manifest Creation** - Creates build manifest with timestamps and file listings

## File Structure

```
fractal-generator/
├── build.js              # Build automation script
├── package.json          # NPM configuration
├── index.html            # Main application
├── fractal-wasm/         # Rust WebAssembly source
│   ├── src/              # Rust source code
│   ├── Cargo.toml        # Rust project configuration
│   └── pkg/              # WebAssembly build output
└── dist/                 # Distribution directory
    ├── index.html        # Main page (with corrected paths)
    ├── pkg/              # WebAssembly files
    │   ├── fractal_wasm.js
    │   └── fractal_wasm_bg.wasm
    ├── assets/           # Static assets
    └── build-manifest.json
```

## Error Handling

The build system includes comprehensive error handling:

- **Missing Dependencies** - Clear messages for missing Rust/wasm-pack
- **Build Failures** - Graceful handling of WebAssembly compilation errors
- **File Validation** - Verifies required files exist before proceeding
- **Automatic Installation** - Attempts to install wasm-pack if missing

## Performance

- **Fast Rebuilds** - Incremental WebAssembly compilation
- **Optimized Output** - Release builds with wasm-pack optimizations
- **Minimal Dependencies** - Only essential packages included

## Deployment

### GitHub Pages

```bash
npm run deploy
```

This command:
1. Runs the build process
2. Pushes the `dist/` directory to the `gh-pages` branch
3. Enables automatic deployment via GitHub Pages

### Manual Deployment

The `dist/` directory contains all files needed for deployment to any static hosting service:

- Copy contents of `dist/` to your web server
- Ensure proper MIME types for `.wasm` files
- Enable CORS if serving from different domains

## Environment Compatibility

Tested and supported on:
- **Windows** - PowerShell and Command Prompt
- **macOS** - Terminal
- **Linux** - Bash and other shells

## Troubleshooting

### WebAssembly Import Errors

If you see import path errors, verify that:
- Build completed successfully
- `dist/pkg/` contains WebAssembly files
- Import paths in HTML match actual file locations

### Server Issues

For CORS or loading issues:
- Use the provided `npm run serve` command
- Don't open files directly in browser (use local server)
- Ensure port 8000 is available

### Build Failures

Common solutions:
- Install Rust: https://rustup.rs/
- Update wasm-pack: `cargo install wasm-pack`
- Clear cache: Delete `fractal-wasm/target/` and rebuild

## Development Workflow

1. **Initial Setup**
   ```bash
   npm install
   ```

2. **Development**
   ```bash
   npm run dev  # Build and serve with live reload
   ```

3. **Testing**
   - Open http://localhost:8000
   - Test fractal generation functionality
   - Verify WebAssembly loads correctly

4. **Deployment**
   ```bash
   npm run deploy
   ```

## Customization

### Adding New Files

To include additional files in the build:

1. Edit `build.js`
2. Add files to the `optionalFiles` array
3. Or add directories to copy in the assets section

### Changing Output Directory

To use a different output directory:

1. Modify `distDir` variable in `build.js`
2. Update `.gitignore` if needed
3. Update deployment scripts accordingly

### Build Optimization

The build process can be customized for different environments:
- Development: Faster builds with debug info
- Production: Optimized builds with smaller file sizes
- CI/CD: Automated builds with specific configurations