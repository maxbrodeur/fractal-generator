/**
 * Fractal Generator - Main JavaScript Integration
 * Connects the HTML UI with the WebAssembly fractal generation module
 */

// Import WebAssembly module
import init, { 
    FractalGenerator, 
    Rule, 
    ColorScheme, 
    FractalPresets 
} from '../fractal-wasm/pkg/fractal_wasm.js';

class FractalApp {
    constructor() {
        this.generator = null;
        this.wasmLoaded = false;
        this.currentTab = 'chaos-game';
        this.loadingOverlay = null;
        this.performanceMetrics = {
            lastRenderTime: 0,
            pointsGenerated: 0,
            renderStartTime: 0
        };
        
        // State management for zoom/pan
        this.viewport = {
            xMin: -2,
            xMax: 2, 
            yMin: -2,
            yMax: 2,
            scale: 1.0
        };
        
        // Canvas rendering context
        this.canvas = null;
        this.ctx = null;
        this.imageData = null;
        
        // Preset configurations based on Python implementation
        this.presetConfigs = {
            sierpt: {
                polygon: 3,
                jump: '1/2',
                skip: 0,
                vertexMode: 'normal',
                startX: 0,
                startY: 0
            },
            sierpc: {
                polygon: 4,
                jump: '2/3',
                skip: 0,
                vertexMode: 'midpoints',
                startX: 0,
                startY: 0
            },
            vicsek: {
                polygon: 4,
                jump: '2/3',
                skip: 0,
                vertexMode: 'center',
                startX: 0,
                startY: 0
            },
            tsquare: {
                polygon: 4,
                jump: '1/2',
                ruleLength: 1,
                ruleOffset: 2,
                ruleSymmetry: false,
                vertexMode: 'normal',
                startX: 0,
                startY: 0
            },
            techs: {
                polygon: 4,
                jump: '1/2',
                ruleLength: 1,
                ruleOffset: 0,
                ruleSymmetry: false,
                vertexMode: 'normal',
                startX: 0,
                startY: 0
            },
            webs: {
                polygon: 4,
                jump: '1/2',
                ruleLength: 2,
                ruleOffset: -1,
                ruleSymmetry: true,
                vertexMode: 'normal',
                startX: 0,
                startY: 0
            },
            XTREME: {
                polygon: 200,
                jump: '7/8',
                ruleLength: 1,
                ruleOffset: 0,
                ruleSymmetry: false,
                vertexMode: 'center',
                startX: 0,
                startY: 0
            }
        };
        
        this.ifsPresetConfigs = {
            sierpinski: {
                transforms: [[0.5, 0, 0, 0.5, 0, 0], [0.5, 0, 0, 0.5, 0.5, 0], [0.5, 0, 0, 0.5, 0.25, 0.433]],
                probabilities: [0.33, 0.33, 0.34]
            },
            fern: {
                transforms: null, // Will use FractalPresets.barnsley_fern()
                probabilities: null
            },
            dragon: {
                transforms: null, // Will use FractalPresets.dragon_curve()
                probabilities: null
            },
            custom: {
                transforms: [[0.5, 0, 0, 0.5, 0, 0]],
                probabilities: [1.0]
            }
        };
    }

    /**
     * Initialize the WebAssembly module and set up the application
     */
    async init() {
        try {
            this.showLoadingOverlay('Initializing WebAssembly module...');
            
            await init();
            this.generator = new FractalGenerator();
            this.wasmLoaded = true;
            
            console.log('✅ WebAssembly module loaded successfully');
            
            // Initialize UI components
            this.initializeUI();
            this.setupEventListeners();
            this.initializeCanvas();
            
            // Load default fractal
            await this.renderFractal();
            
            this.hideLoadingOverlay();
            console.log('🎉 Fractal Generator initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize WebAssembly module:', error);
            this.showError('Failed to load fractal generator. Please refresh the page.');
        }
    }

    /**
     * Initialize UI components and set default values
     */
    initializeUI() {
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Initialize transformation matrices for IFS tab
        this.updateTransformationMatrices();
        
        // Set up canvas replacement for Plotly graphs
        this.setupCanvas();
        
        // Initialize preset dropdown values
        this.applyPreset('sierpt');
    }

    /**
     * Set up canvas rendering instead of Plotly for better performance
     */
    setupCanvas() {
        // Replace chaos game graph with canvas
        const chaosGraphDiv = document.getElementById('chaos_game_graph');
        chaosGraphDiv.innerHTML = `
            <div class="canvas-container" style="position: relative; width: 100%; height: 500px; background: #1a1a1a; border-radius: 8px;">
                <canvas id="chaos-canvas" width="800" height="500" style="max-width: 100%; max-height: 100%; border-radius: 8px;"></canvas>
                <div class="canvas-overlay" style="position: absolute; top: 10px; left: 10px; color: #00ff00; font-family: monospace; font-size: 12px;">
                    <div id="performance-display">Ready</div>
                    <div id="zoom-display">Zoom: 1.0x</div>
                    <div id="coords-display">Click to zoom in, Right-click to zoom out</div>
                </div>
            </div>
        `;
        
        // Replace IFS graph with canvas
        const ifsGraphDiv = document.getElementById('ifs_graph');
        ifsGraphDiv.innerHTML = `
            <div class="canvas-container" style="position: relative; width: 100%; height: 500px; background: #1a1a1a; border-radius: 8px;">
                <canvas id="ifs-canvas" width="800" height="500" style="max-width: 100%; max-height: 100%; border-radius: 8px;"></canvas>
                <div class="canvas-overlay" style="position: absolute; top: 10px; left: 10px; color: #00ff00; font-family: monospace; font-size: 12px;">
                    <div id="ifs-performance-display">Ready</div>
                    <div id="ifs-zoom-display">Zoom: 1.0x</div>
                    <div id="ifs-coords-display">Click to zoom in, Right-click to zoom out</div>
                </div>
            </div>
        `;
        
        // Replace chaos finder graph with canvas
        const finderGraphDiv = document.getElementById('chaos_finder_graph');
        finderGraphDiv.innerHTML = `
            <div class="canvas-container" style="position: relative; width: 100%; height: 500px; background: #1a1a1a; border-radius: 8px;">
                <canvas id="finder-canvas" width="800" height="500" style="max-width: 100%; max-height: 100%; border-radius: 8px;"></canvas>
                <div class="canvas-overlay" style="position: absolute; top: 10px; left: 10px; color: #00ff00; font-family: monospace; font-size: 12px;">
                    <div id="finder-performance-display">Ready</div>
                    <div id="finder-status-display">Ready to search</div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize canvas for current tab
     */
    initializeCanvas() {
        let canvasId = 'chaos-canvas';
        if (this.currentTab === 'transformations') {
            canvasId = 'ifs-canvas';
        } else if (this.currentTab === 'chaos-finder') {
            canvasId = 'finder-canvas';
        }
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        
        // Set up canvas event listeners for zoom/pan
        this.setupCanvasEvents();
    }

    /**
     * Set up canvas event handlers for zoom and pan
     */
    setupCanvasEvents() {
        if (!this.canvas) return;
        
        // Click to zoom in
        this.canvas.addEventListener('click', (event) => {
            this.handleCanvasClick(event);
        });
        
        // Right-click to zoom out
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.handleCanvasRightClick(event);
        });
        
        // Mouse move for coordinate display
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleCanvasMouseMove(event);
        });
    }

    /**
     * Handle canvas click for zoom in functionality
     */
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert pixel coordinates to fractal coordinates
        const fractalX = this.viewport.xMin + (x / this.canvas.width) * (this.viewport.xMax - this.viewport.xMin);
        const fractalY = this.viewport.yMax - (y / this.canvas.height) * (this.viewport.yMax - this.viewport.yMin);
        
        // Zoom in by factor of 2 centered on click point
        const zoomFactor = 0.5;
        const centerX = fractalX;
        const centerY = fractalY;
        
        const newWidth = (this.viewport.xMax - this.viewport.xMin) * zoomFactor;
        const newHeight = (this.viewport.yMax - this.viewport.yMin) * zoomFactor;
        
        this.viewport.xMin = centerX - newWidth / 2;
        this.viewport.xMax = centerX + newWidth / 2;
        this.viewport.yMin = centerY - newHeight / 2;
        this.viewport.yMax = centerY + newHeight / 2;
        this.viewport.scale *= 2;
        
        this.updateZoomDisplay();
        this.renderFractal();
    }

    /**
     * Handle right-click for zoom out functionality
     */
    handleCanvasRightClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert pixel coordinates to fractal coordinates
        const fractalX = this.viewport.xMin + (x / this.canvas.width) * (this.viewport.xMax - this.viewport.xMin);
        const fractalY = this.viewport.yMax - (y / this.canvas.height) * (this.viewport.yMax - this.viewport.yMin);
        
        // Zoom out by factor of 2 centered on click point
        const zoomFactor = 2.0;
        const centerX = fractalX;
        const centerY = fractalY;
        
        const newWidth = (this.viewport.xMax - this.viewport.xMin) * zoomFactor;
        const newHeight = (this.viewport.yMax - this.viewport.yMin) * zoomFactor;
        
        this.viewport.xMin = centerX - newWidth / 2;
        this.viewport.xMax = centerX + newWidth / 2;
        this.viewport.yMin = centerY - newHeight / 2;
        this.viewport.yMax = centerY + newHeight / 2;
        this.viewport.scale /= 2;
        
        this.updateZoomDisplay();
        this.renderFractal();
    }

    /**
     * Handle mouse move for coordinate display
     */
    handleCanvasMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert pixel coordinates to fractal coordinates
        const fractalX = this.viewport.xMin + (x / this.canvas.width) * (this.viewport.xMax - this.viewport.xMin);
        const fractalY = this.viewport.yMax - (y / this.canvas.height) * (this.viewport.yMax - this.viewport.yMin);
        
        const coordsDisplay = document.getElementById('coords-display') || 
                             document.getElementById('ifs-coords-display') || 
                             document.getElementById('finder-status-display');
        
        if (coordsDisplay) {
            coordsDisplay.textContent = `x: ${fractalX.toFixed(4)}, y: ${fractalY.toFixed(4)}`;
        }
    }

    /**
     * Update zoom level display
     */
    updateZoomDisplay() {
        const zoomDisplay = document.getElementById('zoom-display') || 
                           document.getElementById('ifs-zoom-display');
        
        if (zoomDisplay) {
            zoomDisplay.textContent = `Zoom: ${this.viewport.scale.toFixed(1)}x`;
        }
    }

    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                const targetId = event.target.getAttribute('data-bs-target').substring(1);
                console.log('🔄 Tab switched to:', targetId);
                this.currentTab = targetId;
                this.initializeCanvas();
                this.resetViewport();
                
                console.log('📋 Canvas initialized for tab:', this.currentTab, 'Canvas ID:', this.canvas ? this.canvas.id : 'null');
                
                // Render fractal for new tab
                if (this.wasmLoaded) {
                    this.renderFractal();
                }
            });
        });

        // Chaos Game controls
        document.getElementById('generate_chaos_button').addEventListener('click', () => {
            this.renderFractal();
        });

        document.getElementById('presets_dropdown').addEventListener('change', (event) => {
            this.applyPreset(event.target.value);
        });

        // Parameter change listeners for real-time updates
        const chaosInputs = ['iterations_input', 'jump_input', 'polygon_input', 'skip_input', 
                           'start_x_input', 'start_y_input'];
        
        chaosInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    if (document.getElementById('speed_switch').checked) {
                        this.debounce(() => this.renderFractal(), 500)();
                    }
                });
            }
        });

        // IFS controls
        document.getElementById('generate_ifs_button').addEventListener('click', () => {
            this.renderFractal();
        });

        document.getElementById('ifs_presets_dropdown').addEventListener('change', (event) => {
            this.applyIFSPreset(event.target.value);
        });

        // IFS parameter change listeners
        const ifsInputs = ['ifs_iterations_input'];
        ifsInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    if (document.getElementById('ifs_speed_switch').checked) {
                        this.debounce(() => this.renderFractal(), 500)();
                    }
                });
            }
        });

        // Chaos Finder controls
        document.getElementById('search_chaos_button').addEventListener('click', () => {
            this.searchForChaos();
        });

        // Download functionality
        this.setupDownloadHandlers();
    }

    /**
     * Set up download functionality for images
     */
    setupDownloadHandlers() {
        // Add download buttons to each canvas
        const canvasContainers = document.querySelectorAll('.canvas-container');
        canvasContainers.forEach((container, index) => {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-sm btn-outline-success download-btn';
            downloadBtn.innerHTML = '⬇ Download';
            downloadBtn.style.position = 'absolute';
            downloadBtn.style.top = '10px';
            downloadBtn.style.right = '10px';
            downloadBtn.style.fontSize = '11px';
            downloadBtn.style.padding = '4px 8px';
            
            downloadBtn.addEventListener('click', () => {
                this.downloadFractal();
            });
            
            container.appendChild(downloadBtn);
        });
    }

    /**
     * Download current fractal as PNG image
     */
    downloadFractal() {
        if (!this.canvas) return;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `fractal_${this.currentTab}_${timestamp}.png`;
        
        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloaded fractal as ${filename}`);
    }

    /**
     * Apply preset configuration
     */
    applyPreset(preset) {
        const config = this.presetConfigs[preset];
        if (!config) return;

        document.getElementById('polygon_input').value = config.polygon;
        document.getElementById('jump_input').value = config.jump;
        // For skip, use ruleOffset as a placeholder since skip is for backward compatibility
        document.getElementById('skip_input').value = config.ruleOffset || 0;
        document.getElementById('start_x_input').value = config.startX;
        document.getElementById('start_y_input').value = config.startY;

        if (this.wasmLoaded && document.getElementById('speed_switch').checked) {
            this.renderFractal();
        }
    }

    /**
     * Apply IFS preset configuration
     */
    applyIFSPreset(preset) {
        if (preset === 'custom') {
            this.updateTransformationMatrices(1);
        } else {
            this.updateTransformationMatrices();
        }

        if (this.wasmLoaded && document.getElementById('ifs_speed_switch').checked) {
            this.renderFractal();
        }
    }

    /**
     * Update transformation matrices UI for IFS
     */
    updateTransformationMatrices(numMatrices = 3) {
        const container = document.getElementById('transformation_matrices');
        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < numMatrices; i++) {
            const matrixDiv = document.createElement('div');
            matrixDiv.className = 'matrix-input-group mb-2';
            matrixDiv.innerHTML = `
                <h6 class="mb-2" style="font-size: 0.9rem;">T${i + 1}:</h6>
                <div class="row g-1">
                    <div class="col-2">
                        <label class="form-label" style="font-size: 0.8rem;">a</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_a" step="0.01" value="0.5" style="font-size: 0.8rem;">
                    </div>
                    <div class="col-2">
                        <label class="form-label" style="font-size: 0.8rem;">b</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_b" step="0.01" value="0" style="font-size: 0.8rem;">
                    </div>
                    <div class="col-2">
                        <label class="form-label" style="font-size: 0.8rem;">c</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_c" step="0.01" value="0" style="font-size: 0.8rem;">
                    </div>
                    <div class="col-2">
                        <label class="form-label" style="font-size: 0.8rem;">d</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_d" step="0.01" value="0.5" style="font-size: 0.8rem;">
                    </div>
                    <div class="col-2">
                        <label class="form-label" style="font-size: 0.8rem;">e</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_e" step="0.01" value="${i * 0.25}" style="font-size: 0.8rem;">
                    </div>
                    <div class="col-2">
                        <label class="form-label" style="font-size: 0.8rem;">f</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_f" step="0.01" value="${i * 0.25}" style="font-size: 0.8rem;">
                    </div>
                </div>
                <div class="row mt-1">
                    <div class="col-4">
                        <label class="form-label" style="font-size: 0.8rem;">Probability</label>
                        <input type="number" class="form-control form-control-sm" 
                               id="matrix_${i}_prob" step="0.01" min="0" max="1" value="${(1/numMatrices).toFixed(3)}" style="font-size: 0.8rem;">
                    </div>
                </div>
            `;
            container.appendChild(matrixDiv);
        }
    }

    /**
     * Main fractal rendering function
     */
    async renderFractal() {
        if (!this.wasmLoaded) return;

        // Detect current active tab from DOM and update canvas
        const activeTab = document.querySelector('.nav-link.active');
        if (activeTab) {
            const targetId = activeTab.getAttribute('data-bs-target');
            if (targetId) {
                const newTab = targetId.substring(1); // Remove the #
                if (newTab !== this.currentTab) {
                    this.currentTab = newTab;
                    this.initializeCanvas();
                    this.resetViewport();
                }
            }
        }

        if (!this.canvas) return;

        const startTime = performance.now();
        this.performanceMetrics.renderStartTime = startTime;
        
        this.showLoadingOverlay('Generating fractal...');
        this.updatePerformanceDisplay('Generating...');

        try {
            let points = [];
            
            if (this.currentTab === 'chaos-game') {
                points = await this.generateChaosGame();
            } else if (this.currentTab === 'transformations') {
                points = await this.generateIFS();
            } else if (this.currentTab === 'chaos-finder') {
                // Chaos finder uses different rendering
                this.hideLoadingOverlay();
                return;
            }

            if (points && points.length > 0) {
                await this.renderPointsToCanvas(points);
            }

            const endTime = performance.now();
            this.performanceMetrics.lastRenderTime = endTime - startTime;
            this.performanceMetrics.pointsGenerated = points.length / 2;
            
            this.updatePerformanceDisplay();
            
        } catch (error) {
            console.error('Error rendering fractal:', error);
            this.showError('Failed to render fractal');
        }

        this.hideLoadingOverlay();
    }

    /**
     * Generate chaos game fractal points
     */
    async generateChaosGame() {
        const iterations = parseInt(document.getElementById('iterations_input').value) || 10000;
        const jumpText = document.getElementById('jump_input').value || '1/2';
        const polygon = parseInt(document.getElementById('polygon_input').value) || 3;
        const skip = parseInt(document.getElementById('skip_input').value) || 0;
        const startX = parseFloat(document.getElementById('start_x_input').value) || 0;
        const startY = parseFloat(document.getElementById('start_y_input').value) || 0;

        // Parse jump fraction
        const jump = this.parseFraction(jumpText);

        // Generate polygon vertices
        let vertices = this.generatePolygonVertices(polygon);
        
        // Apply vertex modifications based on current preset
        const preset = document.getElementById('presets_dropdown').value;
        if (preset && this.presetConfigs[preset]) {
            const vertexMode = this.presetConfigs[preset].vertexMode;
            if (vertexMode === 'center') {
                vertices = this.stackCenter(vertices);
            } else if (vertexMode === 'midpoints') {
                vertices = this.stackMidpoints(vertices);
            }
        }
        
        // Create transforms array (all same jump ratio)
        const transforms = Array(vertices.length).fill([jump, 0]);
        
        // Create rule for vertex selection based on preset configuration
        let rule;
        if (preset && this.presetConfigs[preset]) {
            const config = this.presetConfigs[preset];
            rule = new Rule(config.ruleLength, config.ruleOffset, config.ruleSymmetry);
        } else {
            // Fallback to traditional skip parameter for manual input
            if (skip === -1) {
                rule = new Rule(2, -1, true);
            } else if (skip === 0) {
                rule = new Rule(1, 0, false);
            } else {
                rule = new Rule(1, skip, false);
            }
        }

        // Generate points using WebAssembly
        return this.generator.chaos_game(vertices, startX, startY, iterations, transforms, rule);
    }

    /**
     * Generate IFS fractal points
     */
    async generateIFS() {
        const preset = document.getElementById('ifs_presets_dropdown').value;
        const iterations = parseInt(document.getElementById('ifs_iterations_input').value) || 100000;
        
        console.log('🔄 Generating IFS fractal:', { preset, iterations });
        
        let transforms, probabilities;
        
        if (preset === 'fern') {
            transforms = FractalPresets.barnsley_fern();
            probabilities = FractalPresets.barnsley_fern_probs();
        } else if (preset === 'dragon') {
            transforms = FractalPresets.dragon_curve();
            probabilities = FractalPresets.dragon_curve_probs();
        } else if (preset === 'sierpinski') {
            transforms = this.createTransformsArray(this.ifsPresetConfigs.sierpinski.transforms);
            probabilities = this.ifsPresetConfigs.sierpinski.probabilities;
        } else if (preset === 'custom') {
            const customData = this.getCustomTransformations();
            transforms = this.createTransformsArray(customData.transforms);
            probabilities = customData.probabilities;
        }

        const result = this.generator.ifs_fractal(0, 0, iterations, transforms, probabilities, 'regular');
        console.log('📊 IFS result points:', result ? result.length : 'null');
        
        return result;
    }

    /**
     * Get custom transformation data from UI
     */
    getCustomTransformations() {
        const transforms = [];
        const probabilities = [];
        
        let i = 0;
        while (document.getElementById(`matrix_${i}_a`)) {
            const a = parseFloat(document.getElementById(`matrix_${i}_a`).value) || 0;
            const b = parseFloat(document.getElementById(`matrix_${i}_b`).value) || 0;
            const c = parseFloat(document.getElementById(`matrix_${i}_c`).value) || 0;
            const d = parseFloat(document.getElementById(`matrix_${i}_d`).value) || 0;
            const e = parseFloat(document.getElementById(`matrix_${i}_e`).value) || 0;
            const f = parseFloat(document.getElementById(`matrix_${i}_f`).value) || 0;
            const prob = parseFloat(document.getElementById(`matrix_${i}_prob`).value) || 1;
            
            transforms.push([a, b, c, d, e, f]);
            probabilities.push(prob);
            i++;
        }
        
        return { transforms, probabilities };
    }

    /**
     * Search for chaotic patterns
     */
    async searchForChaos() {
        if (!this.wasmLoaded) return;

        this.showLoadingOverlay('Searching for chaos...');
        
        const searchIterations = parseInt(document.getElementById('search_iterations_input').value) || 1000;
        const testIterations = parseInt(document.getElementById('test_iterations_input').value) || 10000;
        const method = document.getElementById('method_dropdown').value;
        
        try {
            // Update status
            const statusDisplay = document.getElementById('finder-status-display');
            if (statusDisplay) {
                statusDisplay.textContent = 'Searching for chaotic patterns...';
            }

            // Use cubic maps for more complex patterns
            const isCubic = method === 'genetic';
            const points = this.generator.find_random_chaos(searchIterations, testIterations, isCubic);
            
            if (points && points.length > 0) {
                this.initializeCanvas(); // Make sure canvas is ready
                await this.renderPointsToCanvas(points);
                
                if (statusDisplay) {
                    statusDisplay.textContent = `Found chaotic pattern! ${points.length / 2} points generated.`;
                }
            } else {
                if (statusDisplay) {
                    statusDisplay.textContent = 'No chaotic patterns found. Try again!';
                }
            }
            
        } catch (error) {
            console.error('Error searching for chaos:', error);
            this.showError('Failed to search for chaos patterns');
        }

        this.hideLoadingOverlay();
    }

    /**
     * Render points to canvas using WebAssembly color mapping
     */
    async renderPointsToCanvas(points) {
        if (!this.canvas || !this.ctx || !points || points.length === 0) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Use WebAssembly to convert points to RGBA data
        const colorScheme = ColorScheme.Fire; // Could be made configurable
        const rgbaData = this.generator.points_to_rgba(points, width, height, colorScheme);
        
        // Create ImageData and render to canvas
        const imageData = new ImageData(new Uint8ClampedArray(rgbaData), width, height);
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Utility function to generate polygon vertices
     */
    generatePolygonVertices(n) {
        const vertices = [];
        for (let i = 0; i < n; i++) {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2; // Start from top
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            vertices.push([x, y]);
        }
        return vertices;
    }

    /**
     * Add center point to vertices (stack_center from Python)
     */
    stackCenter(vertices) {
        const result = [...vertices];
        result.push([0.0, 0.0]); // Add center point
        return result;
    }

    /**
     * Add midpoints between vertices (stack_midpoints from Python)
     */
    stackMidpoints(vertices) {
        const result = [];
        const n = vertices.length;
        
        for (let i = 0; i < n * 2; i++) {
            if (i % 2 === 0) {
                // Even index: original vertex
                result.push(vertices[Math.floor(i / 2)]);
            } else {
                // Odd index: midpoint between current and next vertex
                const idx1 = Math.floor((i - 1) / 2);
                const idx2 = Math.floor((i + 1) / 2) % n; // Wrap around
                const p1 = vertices[idx1];
                const p2 = vertices[idx2];
                const midpoint = [
                    (p1[0] + p2[0]) / 2,
                    (p1[1] + p2[1]) / 2
                ];
                result.push(midpoint);
            }
        }
        return result;
    }

    /**
     * Parse fraction string (e.g., "1/2" -> 0.5)
     */
    parseFraction(fractionStr) {
        if (fractionStr.includes('/')) {
            const [num, den] = fractionStr.split('/').map(parseFloat);
            return num / den;
        }
        return parseFloat(fractionStr) || 0.5;
    }

    /**
     * Create transforms array for WebAssembly
     */
    createTransformsArray(transforms) {
        return transforms.map(t => t);
    }

    /**
     * Reset viewport to default values
     */
    resetViewport() {
        this.viewport = {
            xMin: -2,
            xMax: 2,
            yMin: -2,
            yMax: 2,
            scale: 1.0
        };
        this.updateZoomDisplay();
    }

    /**
     * Update performance metrics display
     */
    updatePerformanceDisplay(status = null) {
        const displays = ['performance-display', 'ifs-performance-display', 'finder-performance-display'];
        
        displays.forEach(displayId => {
            const display = document.getElementById(displayId);
            if (display) {
                if (status) {
                    display.textContent = status;
                } else {
                    const pointsPerSec = this.performanceMetrics.pointsGenerated / (this.performanceMetrics.lastRenderTime / 1000);
                    display.textContent = `${this.performanceMetrics.pointsGenerated} points, ${this.performanceMetrics.lastRenderTime.toFixed(1)}ms, ${pointsPerSec.toFixed(0)} pts/s`;
                }
            }
        });
    }

    /**
     * Show loading overlay with message
     */
    showLoadingOverlay(message = 'Loading...') {
        if (this.loadingOverlay) {
            const messageSpan = document.getElementById('loading-message');
            if (messageSpan) {
                messageSpan.textContent = message;
            }
            this.loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        // Could add a toast notification here
        alert(message);
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new FractalApp();
    window.fractalApp = app; // Make available globally for debugging
    await app.init();
});

// Export for testing
export { FractalApp };