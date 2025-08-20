/* tslint:disable */
/* eslint-disable */
/**
 * Generate just the trajectory points for streaming processing
 * Returns alternating [x1, y1, x2, y2, ...] coordinates and final state
 */
export function generate_trajectory_points(x_params: Float64Array, y_params: Float64Array, n_points: number, is_cubic: boolean, start_x: number, start_y: number): Float64Array;
/**
 * Standalone function to generate chaotic map points
 * This is called from JavaScript as generator.generate_chaotic_map_points()
 */
export function generate_chaotic_map_points(chaos_type: string, params: Float64Array, n_points: number, discard_points: number): Float64Array;
/**
 * Color mapping functions
 */
export enum ColorScheme {
  Fire = 0,
  Jet = 1,
  Prism = 2,
  Turbo = 3,
  ColorWheel = 4,
  GnuPlot = 5,
  Bmy = 6,
  Plasma = 7,
  Inferno = 8,
  Viridis = 9,
  Neon = 10,
  Pastel = 11,
  Magma = 12,
  Cividis = 13,
  Gray = 14,
  Cubehelix = 15,
  BlueOrange = 16,
  Heat = 17,
  Ice = 18,
  WhiteFire = 19,
  WhiteHeat = 20,
  WhiteBlue = 21,
  WhiteViridis = 22,
  WhiteMagma = 23,
}
/**
 * Stateful accumulator that keeps a running density grid and incremental
 * coverage metrics entirely inside WASM to avoid large per-batch memory copies
 * and repeated JS-side scans for non-zero counts.
 * Uses chunked memory allocation for very large resolutions (32K+).
 */
export class ChaoticAccumulator {
  free(): void;
  /**
   * Create a new accumulator with initial orbit state and fixed bounds.
   * Uses chunked memory allocation for very large resolutions to avoid WASM memory limits.
   */
  constructor(x_params: Float64Array, y_params: Float64Array, is_cubic: boolean, width: number, height: number, min_x: number, max_x: number, min_y: number, max_y: number, start_x: number, start_y: number);
  /**
   * Advance the chaotic map by n_points, updating the internal density.
   * Returns a small stats vector to minimize JS processing:
   * [ final_x, final_y, new_pixels_added, total_non_zero_pixels ]
   */
  step_batch(n_points: number): Float64Array;
  /**
   * Same as step_batch but also reports how many brand new pixels were lit this batch.
   * Returns: [final_x, final_y, newly_lit_pixels, total_non_zero]
   */
  step_batch_with_new(n_points: number): Float64Array;
  /**
   * Export a clone of the density grid (used only at finalization / external caching).
   */
  density(): Uint32Array;
  /**
   * Convenience: directly map current density to RGBA with scaling & color scheme.
   */
  to_rgba_scaled(color_scheme: ColorScheme, scale_mode: number): Uint8ClampedArray;
  /**
   * Map current density to RGBA using log-soft mapping with adjustable softness
   */
  to_rgba_log_soft(color_scheme: ColorScheme, softness: number): Uint8ClampedArray;
  /**
   * Fill the internal reusable RGBA buffer from current density with log-soft mapping (zero-copy view ready)
   */
  fill_rgba_log_soft(color_scheme: ColorScheme, softness: number): void;
  /**
   * Return a zero-copy JS view over the internal RGBA buffer. Recreate the view after memory growth.
   * For large/sparse memory, returns an empty view. Use get_rgba_rows() from JS.
   */
  rgba_view(): Uint8ClampedArray;
  /**
   * Whether this accumulator uses chunked (large) memory mode
   */
  use_chunked(): boolean;
  /**
   * Stream RGBA rows computed with the last fill_rgba_log_soft mapping.
   * start_row + rows will be clamped to height.
   */
  get_rgba_rows(start_row: number, rows: number): Uint8ClampedArray;
}
/**
 * Result structure for chaotic map with parameters
 */
export class ChaoticMapResult {
  private constructor();
  free(): void;
  readonly points: Float64Array;
  readonly x_params: Float64Array;
  readonly y_params: Float64Array;
  readonly max_lyapunov: number;
  readonly min_lyapunov: number;
  readonly fractal_dimension: number;
  readonly is_cubic: boolean;
}
/**
 * Main fractal generator struct
 */
export class FractalGenerator {
  free(): void;
  /**
   * Estimate bounds for a chaotic map entirely inside WASM to avoid
   * transferring large point arrays back to JS. Returns
   * [min_x, max_x, min_y, max_y] with a small padding similar to
   * calculate_point_bounds.
   */
  estimate_bounds_for_map(x_params: Float64Array, y_params: Float64Array, n_points: number, is_cubic: boolean): Float64Array;
  constructor();
  /**
   * Generate chaos game fractal points
   */
  chaos_game(vertices_js: Array<any>, x0: number, y0: number, iterations: number, transforms_js: Array<any>, rule: Rule): Float64Array;
  /**
   * Generate IFS fractal points
   */
  ifs_fractal(start_x: number, start_y: number, iterations: number, transforms_js: Array<any>, probabilities_js: Array<any>, parse_mode: string): Float64Array;
  /**
   * Generate Mandelbrot set
   */
  mandelbrot_set(width: number, height: number, x_min: number, x_max: number, y_min: number, y_max: number, max_iterations: number): Uint32Array;
  /**
   * Generate Julia set
   */
  julia_set(width: number, height: number, x_min: number, x_max: number, y_min: number, y_max: number, c_real: number, c_imag: number, max_iterations: number): Uint32Array;
  /**
   * Generate Burning Ship fractal
   */
  burning_ship(width: number, height: number, x_min: number, x_max: number, y_min: number, y_max: number, max_iterations: number): Uint32Array;
  /**
   * Convert iteration counts to RGBA with color mapping
   */
  iterations_to_rgba(iterations: Uint32Array, width: number, height: number, max_iterations: number, color_scheme: ColorScheme): Uint8Array;
  /**
   * Generate density grid from points with explicit bounds
   */
  points_to_density_grid_with_bounds(points: Float64Array, width: number, height: number, min_x: number, max_x: number, min_y: number, max_y: number): Uint32Array;
  /**
   * Merges two density grids by element-wise addition.
   *
   * Each element in the returned grid is the sum of the corresponding elements in `grid1` and `grid2`.
   * If the input grids have different sizes, a warning is logged and `grid1` is returned unchanged.
   */
  merge_density_grids(grid1: Uint32Array, grid2: Uint32Array): Uint32Array;
  /**
   * Converts a density grid to RGBA pixel data.
   *
   * This function normalizes the density values in the grid by dividing each value by the maximum density,
   * resulting in a linear normalization in the range [0, 1]. To improve visibility of low-density regions,
   * a logarithmic mapping is applied using `ln_1p`, which compresses the dynamic range and enhances contrast
   * for areas with low density. The normalized and mapped value is then used to select a color from the
   * specified color scheme. The output is a flat RGBA array suitable for rendering.
   *
   * # Arguments
   * * `density` - A slice of density values (u32) for each pixel.
   * * `width` - The width of the grid.
   * * `height` - The height of the grid.
   * * `color_scheme` - The color scheme to use for mapping normalized density to color.
   *
   * # Returns
   * A vector of RGBA bytes representing the image.
   */
  density_grid_to_rgba(density: Uint32Array, width: number, height: number, color_scheme: ColorScheme): Uint8ClampedArray;
  /**
   * Variant with selectable scaling mode for density mapping.
   * scale_mode:
   * 0 = soft log (current default: ln_1p(linear_norm * 10)/ln_1p(10))
   * 1 = pure log: ln_1p(density)/ln_1p(max_density)
   * 2 = linear: density/max_density
   * 3 = sqrt(linear_norm)
   * 4 = gamma 0.5 (sqrt) alias
   * 5 = gamma 0.25 (4th root)
   */
  density_grid_to_rgba_scaled(density: Uint32Array, width: number, height: number, color_scheme: ColorScheme, scale_mode: number): Uint8ClampedArray;
  /**
   * Log-soft density mapping with adjustable softness factor s (>0):
   * mapped = ln(1 + s * d) / ln(1 + s * max_d)
   */
  density_grid_to_rgba_log_soft(density: Uint32Array, width: number, height: number, color_scheme: ColorScheme, softness: number): Uint8ClampedArray;
  /**
   * Calculate bounds for a set of points
   */
  calculate_point_bounds(points: Float64Array): Float64Array;
  /**
   * Generate RGBA pixel data from points with color mapping
   */
  points_to_rgba(points: Float64Array, width: number, height: number, color_scheme: ColorScheme): Uint8Array;
  /**
   * Find a random chaotic map with extended information
   */
  find_random_chaos_extended(n_plot: number, n_test: number, _discard_points: number, _use_alphabet: boolean, is_cubic: boolean): ChaoticMapResult;
  /**
   * Find a random chaotic map
   */
  find_random_chaos(n_plot: number, n_test: number, is_cubic: boolean): Float64Array;
  /**
   * Generate points from given chaotic map parameters
   */
  generate_chaotic_map_points(x_params: Float64Array, y_params: Float64Array, n_points: number, is_cubic: boolean): Float64Array;
  /**
   * Generate points from given chaotic map parameters in batches
   * Returns density grid that can be merged with other batches
   */
  generate_chaotic_map_batch_to_density(x_params: Float64Array, y_params: Float64Array, n_points: number, is_cubic: boolean, width: number, height: number, min_x: number, max_x: number, min_y: number, max_y: number, start_iteration: number): Uint32Array;
  /**
   * Generate points from given chaotic map parameters in batches with state continuity
   * Returns density grid and final state for efficient batch processing
   */
  generate_chaotic_map_batch_with_state(x_params: Float64Array, y_params: Float64Array, n_points: number, is_cubic: boolean, width: number, height: number, min_x: number, max_x: number, min_y: number, max_y: number, start_x: number, start_y: number): Float64Array;
}
export class FractalPresets {
  private constructor();
  free(): void;
  /**
   * Get Sierpinski triangle configuration
   */
  static sierpinski_triangle(): Array<any>;
  /**
   * Get Sierpinski triangle transform parameters
   */
  static sierpinski_triangle_transforms(): Array<any>;
  /**
   * Get Sierpinski carpet configuration (4-sided polygon with midpoints)
   */
  static sierpinski_carpet(): Array<any>;
  /**
   * Get Sierpinski carpet transform parameters
   */
  static sierpinski_carpet_transforms(): Array<any>;
  /**
   * Get Vicsek square configuration (4-sided polygon with center)
   */
  static vicsek_square(): Array<any>;
  /**
   * Get Vicsek square transform parameters
   */
  static vicsek_square_transforms(): Array<any>;
  /**
   * Get T-square configuration
   */
  static t_square(): Array<any>;
  /**
   * Get T-square transform parameters
   */
  static t_square_transforms(): Array<any>;
  /**
   * Get Techs pattern configuration
   */
  static techs_pattern(): Array<any>;
  /**
   * Get Techs pattern transform parameters
   */
  static techs_pattern_transforms(): Array<any>;
  /**
   * Get Web pattern configuration
   */
  static web_pattern(): Array<any>;
  /**
   * Get Web pattern transform parameters
   */
  static web_pattern_transforms(): Array<any>;
  /**
   * Get Dragon curve IFS parameters
   */
  static dragon_curve(): Array<any>;
  /**
   * Get Dragon curve probabilities
   */
  static dragon_curve_probs(): Array<any>;
  /**
   * Get Barnsley fern IFS parameters
   */
  static barnsley_fern(): Array<any>;
  /**
   * Get Barnsley fern probabilities  
   */
  static barnsley_fern_probs(): Array<any>;
  /**
   * Get Mandelbrot-like IFS parameters
   */
  static mandelbrot_like(): Array<any>;
  /**
   * Get Mandelbrot-like probabilities
   */
  static mandelbrot_like_probs(): Array<any>;
  /**
   * Get Spiral IFS parameters  
   */
  static spiral(): Array<any>;
  /**
   * Get Spiral probabilities
   */
  static spiral_probs(): Array<any>;
  /**
   * Get Christmas tree IFS parameters
   */
  static christmas_tree(): Array<any>;
  /**
   * Get Christmas tree probabilities
   */
  static christmas_tree_probs(): Array<any>;
  /**
   * Get Maple leaf IFS parameters
   */
  static maple_leaf(): Array<any>;
  /**
   * Get Maple leaf probabilities
   */
  static maple_leaf_probs(): Array<any>;
}
/**
 * Rule system for vertex selection constraints
 */
export class Rule {
  free(): void;
  constructor(length: number, offset: number, symmetry: boolean);
  add(element: number): void;
  check(vertex_count: number, index: number): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_chaoticmapresult_free: (a: number, b: number) => void;
  readonly chaoticmapresult_points: (a: number) => [number, number];
  readonly chaoticmapresult_x_params: (a: number) => [number, number];
  readonly chaoticmapresult_y_params: (a: number) => [number, number];
  readonly chaoticmapresult_max_lyapunov: (a: number) => number;
  readonly chaoticmapresult_min_lyapunov: (a: number) => number;
  readonly chaoticmapresult_fractal_dimension: (a: number) => number;
  readonly chaoticmapresult_is_cubic: (a: number) => number;
  readonly __wbg_rule_free: (a: number, b: number) => void;
  readonly rule_new: (a: number, b: number, c: number) => number;
  readonly rule_add: (a: number, b: number) => void;
  readonly rule_check: (a: number, b: number, c: number) => number;
  readonly __wbg_fractalgenerator_free: (a: number, b: number) => void;
  readonly fractalgenerator_estimate_bounds_for_map: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly fractalgenerator_new: () => number;
  readonly fractalgenerator_chaos_game: (a: number, b: any, c: number, d: number, e: number, f: any, g: number) => [number, number];
  readonly fractalgenerator_ifs_fractal: (a: number, b: number, c: number, d: number, e: any, f: any, g: number, h: number) => [number, number];
  readonly fractalgenerator_mandelbrot_set: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
  readonly fractalgenerator_julia_set: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
  readonly fractalgenerator_burning_ship: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
  readonly fractalgenerator_iterations_to_rgba: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly fractalgenerator_points_to_density_grid_with_bounds: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number];
  readonly fractalgenerator_merge_density_grids: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly fractalgenerator_density_grid_to_rgba: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly fractalgenerator_density_grid_to_rgba_scaled: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly fractalgenerator_density_grid_to_rgba_log_soft: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly fractalgenerator_calculate_point_bounds: (a: number, b: number, c: number) => [number, number];
  readonly fractalgenerator_points_to_rgba: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly __wbg_chaoticaccumulator_free: (a: number, b: number) => void;
  readonly chaoticaccumulator_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => number;
  readonly chaoticaccumulator_step_batch: (a: number, b: number) => [number, number];
  readonly chaoticaccumulator_step_batch_with_new: (a: number, b: number) => [number, number];
  readonly chaoticaccumulator_density: (a: number) => [number, number];
  readonly chaoticaccumulator_to_rgba_scaled: (a: number, b: number, c: number) => [number, number];
  readonly chaoticaccumulator_to_rgba_log_soft: (a: number, b: number, c: number) => [number, number];
  readonly chaoticaccumulator_fill_rgba_log_soft: (a: number, b: number, c: number) => void;
  readonly chaoticaccumulator_rgba_view: (a: number) => any;
  readonly chaoticaccumulator_use_chunked: (a: number) => number;
  readonly chaoticaccumulator_get_rgba_rows: (a: number, b: number, c: number) => [number, number];
  readonly __wbg_fractalpresets_free: (a: number, b: number) => void;
  readonly fractalpresets_sierpinski_triangle: () => any;
  readonly fractalpresets_sierpinski_triangle_transforms: () => any;
  readonly fractalpresets_sierpinski_carpet: () => any;
  readonly fractalpresets_sierpinski_carpet_transforms: () => any;
  readonly fractalpresets_vicsek_square: () => any;
  readonly fractalpresets_t_square: () => any;
  readonly fractalpresets_web_pattern_transforms: () => any;
  readonly fractalpresets_dragon_curve: () => any;
  readonly fractalpresets_dragon_curve_probs: () => any;
  readonly fractalpresets_barnsley_fern: () => any;
  readonly fractalpresets_barnsley_fern_probs: () => any;
  readonly fractalpresets_mandelbrot_like: () => any;
  readonly fractalpresets_mandelbrot_like_probs: () => any;
  readonly fractalpresets_spiral: () => any;
  readonly fractalpresets_spiral_probs: () => any;
  readonly fractalpresets_christmas_tree: () => any;
  readonly fractalpresets_christmas_tree_probs: () => any;
  readonly fractalpresets_maple_leaf: () => any;
  readonly fractalpresets_maple_leaf_probs: () => any;
  readonly fractalgenerator_find_random_chaos_extended: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly fractalgenerator_find_random_chaos: (a: number, b: number, c: number, d: number) => [number, number];
  readonly fractalgenerator_generate_chaotic_map_points: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly fractalgenerator_generate_chaotic_map_batch_to_density: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => [number, number];
  readonly fractalgenerator_generate_chaotic_map_batch_with_state: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => [number, number];
  readonly generate_trajectory_points: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
  readonly generate_chaotic_map_points: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly fractalpresets_vicsek_square_transforms: () => any;
  readonly fractalpresets_t_square_transforms: () => any;
  readonly fractalpresets_techs_pattern_transforms: () => any;
  readonly fractalpresets_techs_pattern: () => any;
  readonly fractalpresets_web_pattern: () => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
