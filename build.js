#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logStep(step) {
    log(`\n🔧 ${step}`, colors.blue);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

// Check if command exists
function commandExists(command) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// Ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`);
    }
}

// Copy file with error handling
function copyFile(src, dest) {
    try {
        // Ensure destination directory exists
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
        log(`Copied: ${src} → ${dest}`);
    } catch (error) {
        logError(`Failed to copy ${src} to ${dest}: ${error.message}`);
        process.exit(1);
    }
}

// Copy directory recursively
function copyDir(src, dest, excludeFiles = []) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        // Skip excluded files
        if (excludeFiles.includes(entry.name)) {
            log(`Skipped: ${entry.name} (excluded)`);
            continue;
        }
        
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, excludeFiles);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

// Main build function
function build() {
    log('🚀 Starting Fractal Generator Build Process', colors.blue);
    log('=====================================\n');

    // Check prerequisites
    logStep('Checking prerequisites');
    
    if (!commandExists('cargo')) {
        logError('Rust/Cargo not found. Please install Rust: https://rustup.rs/');
        process.exit(1);
    }
    logSuccess('Rust/Cargo found');

    if (!commandExists('wasm-pack')) {
        logError('wasm-pack not found. Installing...');
        try {
            execSync('cargo install wasm-pack', { stdio: 'inherit' });
            logSuccess('wasm-pack installed successfully');
        } catch (error) {
            logError('Failed to install wasm-pack. Please install manually: cargo install wasm-pack');
            process.exit(1);
        }
    } else {
        logSuccess('wasm-pack found');
    }

    // Clean and create deploy directory
    logStep('Preparing build directory');
    const distDir = 'deploy';
    const pkgDir = path.join(distDir, 'pkg');
    
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
        log('Cleaned existing deploy directory');
    }
    
    ensureDir(distDir);
    ensureDir(pkgDir);

    // Build WebAssembly module
    logStep('Compiling WebAssembly module');
    try {
        process.chdir('fractal-wasm');
        execSync('wasm-pack build --target web --out-dir pkg', { stdio: 'inherit' });
        process.chdir('..');
        logSuccess('WebAssembly compilation completed');
    } catch (error) {
        logError('WebAssembly compilation failed');
        process.exit(1);
    }

    // Verify WebAssembly files exist
    logStep('Verifying WebAssembly output');
    const wasmPkgDir = 'fractal-wasm/pkg';
    const requiredFiles = ['fractal_wasm.js', 'fractal_wasm_bg.wasm', 'package.json'];
    
    for (const file of requiredFiles) {
        const filePath = path.join(wasmPkgDir, file);
        if (!fs.existsSync(filePath)) {
            logError(`Required WebAssembly file not found: ${filePath}`);
            process.exit(1);
        }
    }
    logSuccess('All WebAssembly files present');

    // Copy WebAssembly files to deploy
    logStep('Copying WebAssembly files');
    copyDir(wasmPkgDir, pkgDir, ['.gitignore']); // Exclude .gitignore to prevent gh-pages from ignoring all files
    logSuccess('WebAssembly files copied to deploy/pkg/');

    // Copy and fix main HTML file
    logStep('Copying static assets');
    if (fs.existsSync('index.html')) {
        // Read the HTML file and fix the WebAssembly import path
        let htmlContent = fs.readFileSync('index.html', 'utf8');
        // Update the import path to use the dist structure
        htmlContent = htmlContent.replace(
            /import\(['"]\.\/fractal-wasm\/pkg\/fractal_wasm\.js['"]\)/g,
            "import('./pkg/fractal_wasm.js')"
        );
        fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
        logSuccess('Main HTML file copied with corrected WebAssembly path');
    } else {
        logWarning('index.html not found, skipping');
    }

    // Copy other important files if they exist
    const optionalFiles = [
        'debug-helpers.js',
        'test-wasm.html',
        'test_new_fractals.html',
        'README.md'
    ];
    
    for (const file of optionalFiles) {
        if (fs.existsSync(file)) {
            copyFile(file, path.join(distDir, file));
        }
    }

    // Copy assets directory if it exists
    if (fs.existsSync('assets')) {
        copyDir('assets', path.join(distDir, 'assets'));
        logSuccess('Assets directory copied');
    }
    
    // Create .nojekyll file for GitHub Pages
    fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
    log('Created .nojekyll file for GitHub Pages');

    // Create a simple manifest file
    logStep('Creating build manifest');
    
    // Read package.json as ES module
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const manifest = {
        buildTime: new Date().toISOString(),
        version: packageJson.version,
        files: fs.readdirSync(distDir, { recursive: true })
    };
    
    fs.writeFileSync(
        path.join(distDir, 'build-manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    // Success message
    log('\n🎉 Build completed successfully!', colors.green);
    log('=====================================');
    log(`\n📁 Build output: ${path.resolve(distDir)}`);
    log(`\n🚀 To serve locally: npm run serve`);
    log(`📦 To deploy: npm run deploy`);
    log(`\n💡 Open http://localhost:8000 to view the application`);
}

// Error handling
process.on('uncaughtException', (error) => {
    logError(`Uncaught exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});

// Run build
if (import.meta.url === `file://${process.argv[1]}`) {
    build();
}

export { build };