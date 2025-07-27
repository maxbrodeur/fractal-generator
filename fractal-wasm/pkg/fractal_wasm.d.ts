/* tslint:disable */
/* eslint-disable */
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
}
/**
 * Main fractal generator struct
 */
export class FractalGenerator {
  free(): void;
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
   * Generate RGBA pixel data from points with color mapping
   */
  points_to_rgba(points: Float64Array, width: number, height: number, color_scheme: ColorScheme): Uint8Array;
  /**
   * Find a random chaotic map
   */
  find_random_chaos(n_plot: number, n_test: number, is_cubic: boolean): Float64Array;
}
export class FractalPresets {
  private constructor();
  free(): void;
  /**
   * Get Sierpinski triangle configuration
   */
  static sierpinski_triangle(): Array<any>;
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
  readonly __wbg_rule_free: (a: number, b: number) => void;
  readonly rule_new: (a: number, b: number, c: number) => number;
  readonly rule_add: (a: number, b: number) => void;
  readonly rule_check: (a: number, b: number, c: number) => number;
  readonly __wbg_fractalgenerator_free: (a: number, b: number) => void;
  readonly fractalgenerator_new: () => number;
  readonly fractalgenerator_chaos_game: (a: number, b: any, c: number, d: number, e: number, f: any, g: number) => [number, number];
  readonly fractalgenerator_ifs_fractal: (a: number, b: number, c: number, d: number, e: any, f: any, g: number, h: number) => [number, number];
  readonly fractalgenerator_mandelbrot_set: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
  readonly fractalgenerator_julia_set: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
  readonly fractalgenerator_burning_ship: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
  readonly fractalgenerator_iterations_to_rgba: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly fractalgenerator_points_to_rgba: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly __wbg_fractalpresets_free: (a: number, b: number) => void;
  readonly fractalpresets_sierpinski_triangle: () => any;
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
  readonly fractalgenerator_find_random_chaos: (a: number, b: number, c: number, d: number) => [number, number];
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
