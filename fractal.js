/**
 * Fractal Generator - JavaScript Integration with WebAssembly
 * 
 * This module provides the JavaScript integration layer between the UI
 * and the WebAssembly fractal generation module, replicating the exact
 * behavior of the original Python site.
 */

class FractalGenerator {
    constructor() {
        this.wasmModule = null;
        this.currentParams = {
            poly: 3,
            N: 10000,
            ln: 0,
            sym: false,
            offset: 0,
            jump: 0.5,
            midpoints: false,
            center: false,
            fastPlot: false,
            autoUpdate: true
        };
        this.presets = {
            sierpt: {poly: 3, N: 10000, ln: 0, sym: false, offset: 0, jump: "1/2", midpoints: false, center: false},
            sierpc: {poly: 4, N: 10000, ln: 0, sym: false, offset: 0, jump: "2/3", midpoints: true, center: false},
            vicsek: {poly: 4, N: 10000, ln: 0, sym: false, offset: 0, jump: "2/3", midpoints: false, center: true},
            tsquare: {poly: 4, N: 10000, ln: 1, sym: false, offset: 2, jump: "1/2", midpoints: false, center: false},
            techs: {poly: 4, N: 10000, ln: 1, sym: false, offset: 0, jump: "1/2", midpoints: false, center: false},
            webs: {poly: 4, N: 10000, ln: 2, sym: true, offset: -1, jump: "1/2", midpoints: false, center: false},
            XTREME: {poly: 200, N: 200000, ln: 0, sym: false, offset: 0, jump: "7/8", midpoints: false, center: true}
        };
        this.canvas = null;
        this.ctx = null;
        this.isRendering = false;
        this.zoom = {x: 0, y: 0, scale: 1};
        this.lastImageData = null;
    }

    /**
     * Initialize WebAssembly and UI
     */
    async init() {
        try {
            console.log('Initializing Fractal Generator...');
            
            // Initialize canvas
            this.initCanvas();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load WebAssembly module (placeholder for now)
            await this.loadWebAssemblyModule();
            
            // Set initial preset
            this.loadPreset('sierpt');
            
            console.log('Fractal Generator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Fractal Generator:', error);
            this.showError('Failed to initialize fractal generator');
        }
    }

    /**
     * Initialize canvas for fractal rendering
     */
    initCanvas() {
        this.canvas = document.getElementById('fractalCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            throw new Error('Failed to initialize canvas');
        }

        // Set canvas size to match container
        this.resizeCanvas();
        
        // Add resize listener
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Resize canvas to match container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set display size (CSS pixels)
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Set actual size in memory (scaled for device pixel ratio)
        const scale = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * scale;
        this.canvas.height = rect.height * scale;
        
        // Scale the drawing context so everything draws at the correct size
        this.ctx.scale(scale, scale);
    }

    /**
     * Load WebAssembly module asynchronously
     */
    async loadWebAssemblyModule() {
        try {
            // Placeholder for WebAssembly loading
            // When the Rust/WebAssembly module is available, this will load it
            console.log('WebAssembly module loading (placeholder)...');
            
            // Simulate async loading
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // For now, we'll use JavaScript implementations as placeholders
            this.wasmModule = {
                generateChaosGame: this.generateChaosGameJS.bind(this),
                generateIFS: this.generateIFSJS.bind(this),
                generateChaoticMap: this.generateChaoticMapJS.bind(this)
            };
            
            console.log('WebAssembly module loaded (placeholder)');
        } catch (error) {
            console.error('Failed to load WebAssembly module:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Parameter controls
        document.getElementById('presets_dropdown').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });

        // Auto-update controls
        const autoUpdateInputs = [
            'iterations_input', 'jump_input', 'polygon_input', 'length_input',
            'offset_input', 'symmetry_input', 'midpoints_input', 'center_input', 'fast_plot'
        ];

        autoUpdateInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateParametersFromUI();
                    if (this.currentParams.autoUpdate) {
                        this.renderFractal();
                    }
                });
                
                // For number inputs, also listen to input events for real-time updates
                if (element.type === 'number' || element.type === 'text') {
                    element.addEventListener('input', () => {
                        this.updateParametersFromUI();
                        if (this.currentParams.autoUpdate) {
                            // Debounce for text inputs
                            clearTimeout(this.inputTimer);
                            this.inputTimer = setTimeout(() => this.renderFractal(), 500);
                        }
                    });
                }
            }
        });

        // Auto update toggle
        document.getElementById('auto_update').addEventListener('change', (e) => {
            this.currentParams.autoUpdate = e.target.checked;
        });

        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleCanvasRightClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleCanvasWheel(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Load a preset and update UI
     */
    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.error('Unknown preset:', presetName);
            return;
        }

        // Update UI elements
        document.getElementById('polygon_input').value = preset.poly;
        document.getElementById('iterations_input').value = preset.N;
        document.getElementById('length_input').value = preset.ln;
        document.getElementById('symmetry_input').checked = preset.sym;
        document.getElementById('offset_input').value = preset.offset;
        document.getElementById('jump_input').value = preset.jump;
        document.getElementById('midpoints_input').checked = preset.midpoints;
        document.getElementById('center_input').checked = preset.center;

        // Update internal parameters
        this.updateParametersFromUI();

        // Render if auto-update is enabled
        if (this.currentParams.autoUpdate) {
            this.renderFractal();
        }
    }

    /**
     * Update internal parameters from UI elements
     */
    updateParametersFromUI() {
        try {
            this.currentParams.poly = parseInt(document.getElementById('polygon_input').value) || 3;
            this.currentParams.N = parseInt(document.getElementById('iterations_input').value) || 10000;
            this.currentParams.ln = parseInt(document.getElementById('length_input').value) || 0;
            this.currentParams.sym = document.getElementById('symmetry_input').checked;
            this.currentParams.offset = parseInt(document.getElementById('offset_input').value) || 0;
            this.currentParams.midpoints = document.getElementById('midpoints_input').checked;
            this.currentParams.center = document.getElementById('center_input').checked;
            this.currentParams.fastPlot = document.getElementById('fast_plot').checked;
            
            // Parse jump value (can be fraction like "1/2")
            const jumpStr = document.getElementById('jump_input').value;
            try {
                this.currentParams.jump = eval(jumpStr);
            } catch (e) {
                console.warn('Invalid jump value:', jumpStr);
                this.currentParams.jump = 0.5;
            }

            // Validate parameters
            this.validateParameters();
        } catch (error) {
            console.error('Error updating parameters:', error);
        }
    }

    /**
     * Validate parameter ranges and values
     */
    validateParameters() {
        // Validate jump value
        if (this.currentParams.jump <= 0) {
            this.currentParams.jump = 0.5;
            document.getElementById('jump_input').value = "1/2";
        }

        // Validate offset based on symmetry and polygon
        const maxOffset = this.currentParams.sym ? 
            this.currentParams.poly / 2 : 
            this.currentParams.poly;
        
        if (Math.abs(this.currentParams.offset) > maxOffset) {
            this.currentParams.offset = 0;
            document.getElementById('offset_input').value = 0;
        }

        // Update input validity visual feedback
        this.updateInputValidation();
    }

    /**
     * Update visual validation feedback for inputs
     */
    updateInputValidation() {
        const jumpInput = document.getElementById('jump_input');
        try {
            const jumpVal = eval(jumpInput.value);
            jumpInput.classList.toggle('is-invalid', jumpVal <= 0);
        } catch (e) {
            jumpInput.classList.add('is-invalid');
        }

        const offsetInput = document.getElementById('offset_input');
        const maxOffset = this.currentParams.sym ? 
            this.currentParams.poly / 2 : 
            this.currentParams.poly;
        offsetInput.classList.toggle('is-invalid', 
            Math.abs(this.currentParams.offset) > maxOffset);
    }

    /**
     * Render fractals using WebAssembly
     */
    async renderFractal() {
        if (this.isRendering) {
            return; // Prevent concurrent renders
        }

        this.isRendering = true;
        this.showLoadingState(true);

        try {
            const startTime = performance.now();
            
            // Generate fractal data using WebAssembly
            const imageData = await this.wasmModule.generateChaosGame(
                this.currentParams,
                this.canvas.width,
                this.canvas.height,
                this.zoom
            );

            // Render to canvas
            this.renderImageData(imageData);
            
            const renderTime = performance.now() - startTime;
            this.updatePerformanceMetrics(renderTime);
            
            // Store for zoom/pan operations
            this.lastImageData = imageData;
            
        } catch (error) {
            console.error('Fractal rendering failed:', error);
            this.showError('Failed to render fractal');
        } finally {
            this.isRendering = false;
            this.showLoadingState(false);
        }
    }

    /**
     * Render image data to canvas
     */
    renderImageData(imageData) {
        if (!imageData || !imageData.data) {
            console.error('Invalid image data');
            return;
        }

        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Create ImageData object and put it on canvas
        const canvasImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        this.ctx.putImageData(canvasImageData, 0, 0);
    }

    /**
     * Handle canvas click for zoom in functionality
     */
    handleCanvasClick(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        // Zoom in by factor of 2 at clicked point
        this.zoom.scale *= 2;
        this.zoom.x = x;
        this.zoom.y = y;
        
        console.log('Zoom in at:', {x, y}, 'Scale:', this.zoom.scale);
        
        // Re-render with new zoom
        this.renderFractal();
    }

    /**
     * Handle canvas right-click for zoom out functionality
     */
    handleCanvasRightClick(event) {
        event.preventDefault();
        
        // Zoom out by factor of 2
        this.zoom.scale = Math.max(1, this.zoom.scale / 2);
        
        // Reset position if zoomed all the way out
        if (this.zoom.scale === 1) {
            this.zoom.x = 0;
            this.zoom.y = 0;
        }
        
        console.log('Zoom out. Scale:', this.zoom.scale);
        
        // Re-render with new zoom
        this.renderFractal();
    }

    /**
     * Handle mouse wheel for zoom
     */
    handleCanvasWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        this.zoom.scale = Math.max(1, this.zoom.scale * zoomFactor);
        
        if (this.zoom.scale > 1) {
            this.zoom.x = x;
            this.zoom.y = y;
        } else {
            this.zoom.x = 0;
            this.zoom.y = 0;
        }
        
        // Re-render with new zoom
        this.renderFractal();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        switch (event.key) {
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.renderFractal();
                }
                break;
            case 'd':
            case 'D':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.downloadFractal();
                }
                break;
            case 'Escape':
                // Reset zoom
                this.zoom = {x: 0, y: 0, scale: 1};
                this.renderFractal();
                break;
        }
    }

    /**
     * Update parameter controls dynamically
     */
    updateParameterControls() {
        // Update iterations input max based on fast plot mode
        const iterationsInput = document.getElementById('iterations_input');
        const fastPlot = document.getElementById('fast_plot').checked;
        
        if (fastPlot) {
            iterationsInput.max = 200000000;
            iterationsInput.step = 1000;
        } else {
            iterationsInput.max = 20000;
            iterationsInput.step = 1;
        }
    }

    /**
     * Download fractal image
     */
    downloadFractal() {
        try {
            // Create download link
            const link = document.createElement('a');
            link.download = this.generateFilename();
            link.href = this.canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Fractal downloaded:', link.download);
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Failed to download image');
        }
    }

    /**
     * Generate filename for download
     */
    generateFilename() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const preset = document.getElementById('presets_dropdown').value;
        return `fractal-${preset}-${timestamp}.png`;
    }

    /**
     * Show/hide loading state
     */
    showLoadingState(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('d-none', !show);
        }
        
        // Update cursor
        this.canvas.style.cursor = show ? 'wait' : 'crosshair';
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create or update error alert
        let errorAlert = document.getElementById('errorAlert');
        if (!errorAlert) {
            errorAlert = document.createElement('div');
            errorAlert.id = 'errorAlert';
            errorAlert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
            errorAlert.style.top = '20px';
            errorAlert.style.right = '20px';
            errorAlert.style.zIndex = '9999';
            document.body.appendChild(errorAlert);
        }
        
        errorAlert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.parentNode.removeChild(errorAlert);
            }
        }, 5000);
    }

    /**
     * Update performance metrics display
     */
    updatePerformanceMetrics(renderTime) {
        console.log(`Render time: ${renderTime.toFixed(2)}ms`);
        
        // Update status in UI if status element exists
        let statusElement = document.getElementById('performanceStatus');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'performanceStatus';
            statusElement.className = 'position-fixed text-muted small';
            statusElement.style.bottom = '10px';
            statusElement.style.right = '10px';
            document.body.appendChild(statusElement);
        }
        
        statusElement.textContent = `Render: ${renderTime.toFixed(0)}ms | Points: ${this.currentParams.N.toLocaleString()}`;
    }

    // Placeholder JavaScript implementations (to be replaced by WebAssembly)
    
    /**
     * JavaScript placeholder for chaos game generation
     */
    async generateChaosGameJS(params, width, height, zoom) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate simple placeholder pattern
                const imageData = new Uint8Array(width * height * 4);
                
                // Generate some points for visualization
                const points = this.generateChaosGamePoints(params);
                
                // Render points to image data
                for (let i = 0; i < points.length; i += 2) {
                    const x = Math.floor((points[i] + 1) * width / 2);
                    const y = Math.floor((points[i + 1] + 1) * height / 2);
                    
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const idx = (y * width + x) * 4;
                        imageData[idx] = 255;     // R
                        imageData[idx + 1] = 255; // G
                        imageData[idx + 2] = 0;   // B
                        imageData[idx + 3] = 255; // A
                    }
                }
                
                resolve({
                    data: imageData,
                    width: width,
                    height: height
                });
            }, 100);
        });
    }

    /**
     * Generate chaos game points (simplified JavaScript version)
     */
    generateChaosGamePoints(params) {
        const points = [];
        const vertices = this.getPolygonVertices(params.poly);
        
        let x = 0, y = 0;
        
        for (let i = 0; i < Math.min(params.N, 10000); i++) {
            const vertex = vertices[Math.floor(Math.random() * vertices.length)];
            x = x + (vertex[0] - x) * params.jump;
            y = y + (vertex[1] - y) * params.jump;
            points.push(x, y);
        }
        
        return points;
    }

    /**
     * Get polygon vertices
     */
    getPolygonVertices(n) {
        const vertices = [];
        for (let i = 0; i < n; i++) {
            const angle = (2 * Math.PI * i) / n;
            vertices.push([Math.cos(angle), Math.sin(angle)]);
        }
        return vertices;
    }

    /**
     * JavaScript placeholder for IFS generation
     */
    async generateIFSJS(params, width, height) {
        // Placeholder implementation
        return this.generateChaosGameJS(params, width, height, {x: 0, y: 0, scale: 1});
    }

    /**
     * JavaScript placeholder for chaotic map generation
     */
    async generateChaoticMapJS(params, width, height) {
        // Placeholder implementation
        return this.generateChaosGameJS(params, width, height, {x: 0, y: 0, scale: 1});
    }
}

// Global instance
let fractalGenerator;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    fractalGenerator = new FractalGenerator();
    await fractalGenerator.init();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FractalGenerator;
}