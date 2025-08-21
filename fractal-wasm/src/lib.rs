use js_sys::Array;
use js_sys::Uint8ClampedArray;
use once_cell::sync::Lazy;
use rand::prelude::*;
use rand::thread_rng;
use std::collections::HashMap;
use std::f64::consts::PI;
use wasm_bindgen::prelude::*;

// Console logging for debugging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

/// Result structure for chaotic map with parameters
#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct ChaoticMapResult {
    points: Vec<f64>,
    x_params: Vec<f64>,
    y_params: Vec<f64>,
    max_lyapunov: f64,
    min_lyapunov: f64,
    fractal_dimension: f64,
    is_cubic: bool,
}

#[wasm_bindgen]
impl ChaoticMapResult {
    #[wasm_bindgen(getter)]
    pub fn points(&self) -> Vec<f64> {
        self.points.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn x_params(&self) -> Vec<f64> {
        self.x_params.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn y_params(&self) -> Vec<f64> {
        self.y_params.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn max_lyapunov(&self) -> f64 {
        self.max_lyapunov
    }

    #[wasm_bindgen(getter)]
    pub fn min_lyapunov(&self) -> f64 {
        self.min_lyapunov
    }

    #[wasm_bindgen(getter)]
    pub fn fractal_dimension(&self) -> f64 {
        self.fractal_dimension
    }

    #[wasm_bindgen(getter)]
    pub fn is_cubic(&self) -> bool {
        self.is_cubic
    }
}

/// Rule system for vertex selection constraints
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Rule {
    heap: Vec<i32>,
    length: usize,
    offset: i32,
    sign: i32,
    symmetry: bool,
}

#[wasm_bindgen]
impl Rule {
    #[wasm_bindgen(constructor)]
    pub fn new(length: usize, offset: i32, symmetry: bool) -> Rule {
        let mut heap = vec![-1; length];
        if length > 0 {
            heap[length - 1] = -1;
        }

        Rule {
            heap,
            length,
            offset: offset.abs(),
            sign: if offset < 0 { -1 } else { 1 },
            symmetry,
        }
    }

    pub fn add(&mut self, element: i32) {
        if self.length > 0 {
            for i in 0..self.length - 1 {
                self.heap[i] = self.heap[i + 1];
            }
            self.heap[self.length - 1] = element;
        }
    }

    pub fn check(&self, vertex_count: i32, index: i32) -> bool {
        // Returns true if vertex CANNOT be chosen
        if !self.all_equal() {
            return false;
        }

        let reference = self.get();
        if self.symmetry {
            ((index - reference) % vertex_count == self.offset)
                || ((-index + reference) % vertex_count == self.offset)
        } else {
            self.sign * (index - reference) % vertex_count == self.offset
        }
    }

    fn get(&self) -> i32 {
        if self.length > 0 {
            self.heap[0]
        } else {
            -1
        }
    }

    fn all_equal(&self) -> bool {
        if self.length <= 1 {
            return false;
        }

        for i in 0..self.length - 1 {
            if self.heap[i] != self.heap[i + 1] {
                return false;
            }
        }
        true
    }
}

/// Point structure for 2D coordinates
#[derive(Clone, Copy, Debug)]
pub struct Point2D {
    pub x: f64,
    pub y: f64,
}

impl Point2D {
    pub fn new(x: f64, y: f64) -> Self {
        Point2D { x, y }
    }

    pub fn zero() -> Self {
        Point2D { x: 0.0, y: 0.0 }
    }
}

/// 3D Point structure
#[derive(Clone, Copy, Debug)]
pub struct Point3D {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Point3D {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Point3D { x, y, z }
    }

    pub fn zero() -> Self {
        Point3D {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        }
    }
}

/// Transformation parameters for fractal generation
#[derive(Clone, Copy, Debug)]
pub struct Transform {
    pub compression: f64,
    pub rotation: f64,
}

impl Transform {
    pub fn new(compression: f64, rotation: f64) -> Self {
        Transform {
            compression,
            rotation,
        }
    }
}

/// Affine transformation for IFS fractals
#[derive(Clone, Copy, Debug)]
pub struct AffineTransform {
    pub a: f64,
    pub b: f64,
    pub c: f64,
    pub d: f64,
    pub e: f64,
    pub f: f64,
}

impl AffineTransform {
    pub fn new(a: f64, b: f64, c: f64, d: f64, e: f64, f: f64) -> Self {
        AffineTransform { a, b, c, d, e, f }
    }

    /// Apply transformation in "regular" mode: x' = ax + by + c, y' = dx + ey + f
    pub fn apply_regular(&self, point: Point2D) -> Point2D {
        Point2D::new(
            self.a * point.x + self.b * point.y + self.c,
            self.d * point.x + self.e * point.y + self.f,
        )
    }

    /// Apply transformation in "borke" mode: x' = ax + by + e, y' = cx + dy + f
    pub fn apply_borke(&self, point: Point2D) -> Point2D {
        Point2D::new(
            self.a * point.x + self.b * point.y + self.e,
            self.c * point.x + self.d * point.y + self.f,
        )
    }
}

/// Color mapping functions
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub enum ColorScheme {
    Fire,
    Jet,
    Prism,
    Turbo,
    ColorWheel,
    GnuPlot,
    Bmy,
    Plasma,
    Inferno,
    Viridis,
    Neon,
    Pastel,
    Magma,
    Cividis,
    Gray,
    Cubehelix,
    BlueOrange,
    Heat,
    Ice,
    WhiteFire,
    WhiteHeat,
    WhiteBlue,
    WhiteViridis,
    WhiteMagma,
}

/// Main fractal generator struct
#[wasm_bindgen]
pub struct FractalGenerator {
    rng: ThreadRng,
}

impl Default for FractalGenerator {
    fn default() -> Self {
        Self::new()
    }
}

// Constants for batch processing
const DEFAULT_BATCH_SIZE: usize = 1_000_000; // 1M points per batch for optimal memory usage

// -----------------------------------------------------------------------------
// Color LUTs (256 entries per scheme)
// -----------------------------------------------------------------------------
type Lut = Vec<(u8, u8, u8)>;
static LUTS: Lazy<HashMap<ColorScheme, Lut>> = Lazy::new(|| {
    let mut map: HashMap<ColorScheme, Lut> = HashMap::new();
    // Build a temporary generator to reuse existing per-scheme functions
    let gen = FractalGenerator::new();
    for scheme in [
        ColorScheme::Fire,
        ColorScheme::Jet,
        ColorScheme::Prism,
        ColorScheme::Turbo,
        ColorScheme::ColorWheel,
        ColorScheme::GnuPlot,
        ColorScheme::Bmy,
        ColorScheme::Plasma,
        ColorScheme::Inferno,
        ColorScheme::Viridis,
        ColorScheme::Neon,
        ColorScheme::Pastel,
        ColorScheme::Magma,
        ColorScheme::Cividis,
        ColorScheme::Gray,
        ColorScheme::Cubehelix,
        ColorScheme::BlueOrange,
        ColorScheme::Heat,
        ColorScheme::Ice,
        ColorScheme::WhiteFire,
        ColorScheme::WhiteHeat,
        ColorScheme::WhiteBlue,
        ColorScheme::WhiteViridis,
        ColorScheme::WhiteMagma,
    ] {
        let mut lut: Lut = Vec::with_capacity(256);
        for i in 0..256 {
            let t = i as f64 / 255.0; // clamped [0,1]
            let (r, g, b) = match scheme {
                ColorScheme::Fire => gen.fire_colormap(t),
                ColorScheme::Jet => gen.jet_colormap(t),
                ColorScheme::Prism => gen.prism_colormap(t),
                ColorScheme::Turbo => gen.turbo_colormap(t),
                ColorScheme::ColorWheel => gen.colorwheel_colormap(t),
                ColorScheme::GnuPlot => gen.gnuplot_colormap(t),
                ColorScheme::Bmy => gen.bmy_colormap(t),
                ColorScheme::Plasma => gen.plasma_colormap(t),
                ColorScheme::Inferno => gen.inferno_colormap(t),
                ColorScheme::Viridis => gen.viridis_colormap(t),
                ColorScheme::Neon => gen.neon_colormap(t),
                ColorScheme::Pastel => gen.pastel_colormap(t),
                ColorScheme::Magma => gen.magma_colormap(t),
                ColorScheme::Cividis => gen.cividis_colormap(t),
                ColorScheme::Gray => gen.gray_colormap(t),
                ColorScheme::Cubehelix => gen.cubehelix_colormap(t),
                ColorScheme::BlueOrange => gen.blueorange_colormap(t),
                ColorScheme::Heat => gen.heat_colormap(t),
                ColorScheme::Ice => gen.ice_colormap(t),
                ColorScheme::WhiteFire => gen.white_fire_colormap(t),
                ColorScheme::WhiteHeat => gen.white_heat_colormap(t),
                ColorScheme::WhiteBlue => gen.white_blue_colormap(t),
                ColorScheme::WhiteViridis => gen.white_viridis_colormap(t),
                ColorScheme::WhiteMagma => gen.white_magma_colormap(t),
            };
            lut.push((r, g, b));
        }
        map.insert(scheme, lut);
    }
    map
});

#[inline]
fn lut_index(normalized: f64) -> usize {
    let clamped = if normalized.is_finite() {
        normalized.clamp(0.0, 1.0)
    } else {
        0.0
    };
    (clamped * 255.0).round() as usize
}

#[wasm_bindgen]
impl FractalGenerator {
    /// Estimate bounds for a chaotic map entirely inside WASM to avoid
    /// transferring large point arrays back to JS. Returns
    /// [min_x, max_x, min_y, max_y] with a small padding similar to
    /// calculate_point_bounds.
    #[wasm_bindgen]
    pub fn estimate_bounds_for_map(
        &self,
        x_params: &[f64],
        y_params: &[f64],
        n_points: usize,
        is_cubic: bool,
    ) -> Vec<f64> {
        // Validate parameter lengths defensively to avoid panics on indexing
        let required = if is_cubic { 10 } else { 6 };
        if x_params.len() < required || y_params.len() < required {
            console_log!(
                "⚠️ estimate_bounds_for_map: insufficient params (x:{}, y:{}, required:{})",
                x_params.len(), y_params.len(), required
            );
            return vec![0.0, 1.0, 0.0, 1.0];
        }

        console_log!("⏳ bounds: warmup {} points", n_points.clamp(500, 10_000).min(n_points));
        // Start from standard seed used elsewhere
        let mut x = 0.05;
        let mut y = 0.05;

        // Warm-up to reach attractor region without recording
        // Clamp warmup between 500 and 10_000, but not exceeding n_points
        let warmup = n_points.clamp(500, 10_000).min(n_points);
        for _ in 0..warmup {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(x_params, xp, yp);
                y = map_cubic(y_params, xp, yp);
            } else {
                x = map_quadratic(x_params, xp, yp);
                y = map_quadratic(y_params, xp, yp);
            }
        }

        console_log!("⏳ bounds: warmup done; tracking {} steps", n_points.saturating_sub(warmup).max(1));
        // Initialize bounds after warmup
        let mut min_x = x;
        let mut max_x = x;
        let mut min_y = y;
        let mut max_y = y;

        // Iterate remaining steps tracking bounds only
        let track_count = n_points.saturating_sub(warmup).max(1);
        for _ in 0..track_count {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(x_params, xp, yp);
                y = map_cubic(y_params, xp, yp);
            } else {
                x = map_quadratic(x_params, xp, yp);
                y = map_quadratic(y_params, xp, yp);
            }
            if x.is_finite() && y.is_finite() {
                if x < min_x {
                    min_x = x;
                }
                if x > max_x {
                    max_x = x;
                }
                if y < min_y {
                    min_y = y;
                }
                if y > max_y {
                    max_y = y;
                }
            }
        }

    console_log!("✅ bounds: done x[{:.3}, {:.3}] y[{:.3}, {:.3}]", min_x, max_x, min_y, max_y);
        // Add small padding similar to calculate_point_bounds (10%)
        let pad_x = (max_x - min_x) * 0.1;
        let pad_y = (max_y - min_y) * 0.1;

        vec![min_x - pad_x, max_x + pad_x, min_y - pad_y, max_y + pad_y]
    }
    #[wasm_bindgen(constructor)]
    pub fn new() -> FractalGenerator {
        FractalGenerator { rng: thread_rng() }
    }

    /// Generate chaos game fractal points
    pub fn chaos_game(
        &mut self,
        vertices_js: &Array,
        x0: f64,
        y0: f64,
        iterations: usize,
        transforms_js: &Array,
        rule: &Rule,
    ) -> Vec<f64> {
        // Convert JS arrays to Rust vectors
        let vertices: Vec<Point2D> = vertices_js
            .iter()
            .filter_map(|v| {
                let arr = Array::from(&v);
                if arr.length() >= 2 {
                    Some(Point2D::new(
                        arr.get(0).as_f64().unwrap_or(0.0),
                        arr.get(1).as_f64().unwrap_or(0.0),
                    ))
                } else {
                    None
                }
            })
            .collect();

        let transforms: Vec<Transform> = transforms_js
            .iter()
            .filter_map(|t| {
                let arr = Array::from(&t);
                if arr.length() >= 2 {
                    Some(Transform::new(
                        arr.get(0).as_f64().unwrap_or(0.5),
                        arr.get(1).as_f64().unwrap_or(0.0),
                    ))
                } else {
                    None
                }
            })
            .collect();

        let points = self.chaos_game_internal(vertices, x0, y0, iterations, transforms, rule);

        // Convert to flat array: [x1, y1, x2, y2, ...]
        let mut result = Vec::with_capacity(points.len() * 2);
        for point in points {
            result.push(point.x);
            result.push(point.y);
        }
        result
    }

    /// Generate IFS fractal points
    pub fn ifs_fractal(
        &mut self,
        start_x: f64,
        start_y: f64,
        iterations: usize,
        transforms_js: &Array,
        probabilities_js: &Array,
        parse_mode: &str,
    ) -> Vec<f64> {
        // Convert JS arrays to Rust vectors
        let transforms: Vec<AffineTransform> = transforms_js
            .iter()
            .filter_map(|t| {
                let arr = Array::from(&t);
                if arr.length() >= 6 {
                    Some(AffineTransform::new(
                        arr.get(0).as_f64().unwrap_or(0.0),
                        arr.get(1).as_f64().unwrap_or(0.0),
                        arr.get(2).as_f64().unwrap_or(0.0),
                        arr.get(3).as_f64().unwrap_or(0.0),
                        arr.get(4).as_f64().unwrap_or(0.0),
                        arr.get(5).as_f64().unwrap_or(0.0),
                    ))
                } else {
                    None
                }
            })
            .collect();

        let probabilities: Vec<f64> = probabilities_js.iter().filter_map(|p| p.as_f64()).collect();

        let points = self.ifs_fractal_internal(
            Point2D::new(start_x, start_y),
            iterations,
            transforms,
            probabilities,
            parse_mode == "borke",
        );

        // Convert to flat array
        let mut result = Vec::with_capacity(points.len() * 2);
        for point in points {
            result.push(point.x);
            result.push(point.y);
        }
        result
    }

    /// Generate Mandelbrot set
    #[allow(clippy::too_many_arguments)]
    pub fn mandelbrot_set(
        &self,
        width: usize,
        height: usize,
        x_min: f64,
        x_max: f64,
        y_min: f64,
        y_max: f64,
        max_iterations: usize,
    ) -> Vec<u32> {
        let mut result = Vec::with_capacity(width * height);

        for py in 0..height {
            for px in 0..width {
                let x0 = x_min + (px as f64 / width as f64) * (x_max - x_min);
                let y0 = y_min + (py as f64 / height as f64) * (y_max - y_min);

                let mut x = 0.0;
                let mut y = 0.0;
                let mut iteration = 0;

                while x * x + y * y <= 4.0 && iteration < max_iterations {
                    let xtemp = x * x - y * y + x0;
                    y = 2.0 * x * y + y0;
                    x = xtemp;
                    iteration += 1;
                }

                result.push(iteration as u32);
            }
        }

        result
    }

    /// Generate Julia set
    #[allow(clippy::too_many_arguments)]
    pub fn julia_set(
        &self,
        width: usize,
        height: usize,
        x_min: f64,
        x_max: f64,
        y_min: f64,
        y_max: f64,
        c_real: f64,
        c_imag: f64,
        max_iterations: usize,
    ) -> Vec<u32> {
        let mut result = Vec::with_capacity(width * height);

        for py in 0..height {
            for px in 0..width {
                let mut x = x_min + (px as f64 / width as f64) * (x_max - x_min);
                let mut y = y_min + (py as f64 / height as f64) * (y_max - y_min);

                let mut iteration = 0;

                while x * x + y * y <= 4.0 && iteration < max_iterations {
                    let xtemp = x * x - y * y + c_real;
                    y = 2.0 * x * y + c_imag;
                    x = xtemp;
                    iteration += 1;
                }

                result.push(iteration as u32);
            }
        }

        result
    }

    /// Generate Burning Ship fractal
    #[allow(clippy::too_many_arguments)]
    pub fn burning_ship(
        &self,
        width: usize,
        height: usize,
        x_min: f64,
        x_max: f64,
        y_min: f64,
        y_max: f64,
        max_iterations: usize,
    ) -> Vec<u32> {
        let mut result = Vec::with_capacity(width * height);

        for py in 0..height {
            for px in 0..width {
                let x0 = x_min + (px as f64 / width as f64) * (x_max - x_min);
                let y0 = y_min + (py as f64 / height as f64) * (y_max - y_min);

                let mut x = 0.0;
                let mut y = 0.0;
                let mut iteration = 0;

                while x * x + y * y <= 4.0 && iteration < max_iterations {
                    let xtemp = x * x - y * y + x0;
                    y = 2.0 * x.abs() * y.abs() + y0;
                    x = xtemp;
                    iteration += 1;
                }

                result.push(iteration as u32);
            }
        }

        result
    }

    /// Convert iteration counts to RGBA with color mapping
    pub fn iterations_to_rgba(
        &self,
        iterations: &[u32],
        width: usize,
        height: usize,
        max_iterations: usize,
        color_scheme: ColorScheme,
    ) -> Vec<u8> {
        let mut rgba = Vec::with_capacity(width * height * 4);

        for &iter_count in iterations {
            let normalized = if iter_count >= max_iterations as u32 {
                0.0 // Inside the set - black
            } else {
                (iter_count as f64 / max_iterations as f64).sqrt()
            };

            let color = self.apply_color_scheme(normalized, color_scheme);

            rgba.push(color.0); // R
            rgba.push(color.1); // G
            rgba.push(color.2); // B
            rgba.push(255); // A
        }

        rgba
    }

    /// Generate density grid from points with explicit bounds
    #[wasm_bindgen]
    #[allow(clippy::too_many_arguments)]
    pub fn points_to_density_grid_with_bounds(
        &self,
        points: &[f64],
        width: usize,
        height: usize,
        min_x: f64,
        max_x: f64,
        min_y: f64,
        max_y: f64,
    ) -> Vec<u32> {
        if points.len() % 2 != 0 {
            return vec![0; width * height];
        }

        let mut density = vec![0u32; width * height];

        // Process points in chunks of 2 (x, y pairs)
        for chunk in points.chunks(2) {
            let x = chunk[0];
            let y = chunk[1];

            let pixel_x = ((x - min_x) / (max_x - min_x) * width as f64) as usize;
            let pixel_y = ((y - min_y) / (max_y - min_y) * height as f64) as usize;

            if pixel_x < width && pixel_y < height {
                density[pixel_y * width + pixel_x] += 1;
            }
        }

        density
    }

    /// Merges two density grids by element-wise addition.
    ///
    /// Each element in the returned grid is the sum of the corresponding elements in `grid1` and `grid2`.
    /// If the input grids have different sizes, a warning is logged and `grid1` is returned unchanged.
    #[wasm_bindgen]
    pub fn merge_density_grids(&self, grid1: &[u32], grid2: &[u32]) -> Vec<u32> {
        if grid1.len() != grid2.len() {
            console_log!(
                "Warning: density grids have different sizes ({} vs {})",
                grid1.len(),
                grid2.len()
            );
            return grid1.to_vec();
        }

        grid1.iter().zip(grid2.iter()).map(|(a, b)| a + b).collect()
    }

    /// Converts a density grid to RGBA pixel data.
    ///
    /// This function normalizes the density values in the grid by dividing each value by the maximum density,
    /// resulting in a linear normalization in the range [0, 1]. To improve visibility of low-density regions,
    /// a logarithmic mapping is applied using `ln_1p`, which compresses the dynamic range and enhances contrast
    /// for areas with low density. The normalized and mapped value is then used to select a color from the
    /// specified color scheme. The output is a flat RGBA array suitable for rendering.
    ///
    /// # Arguments
    /// * `density` - A slice of density values (u32) for each pixel.
    /// * `width` - The width of the grid.
    /// * `height` - The height of the grid.
    /// * `color_scheme` - The color scheme to use for mapping normalized density to color.
    ///
    /// # Returns
    /// A vector of RGBA bytes representing the image.
    #[wasm_bindgen]
    pub fn density_grid_to_rgba(
        &self,
        density: &[u32],
        width: usize,
        height: usize,
        color_scheme: ColorScheme,
    ) -> wasm_bindgen::Clamped<Vec<u8>> {
        if density.len() != width * height {
            return wasm_bindgen::Clamped(vec![0; width * height * 4]);
        }

        // Find max density for normalization
        let max_density = *density.iter().max().unwrap_or(&1) as f64;

        // Generate RGBA data
        let mut rgba = vec![0u8; width * height * 4];

        for (i, &dval) in density.iter().enumerate() {
            let normalized = if max_density > 0.0 {
                let linear_norm = dval as f64 / max_density;
                // Use a softer logarithmic mapping for better visibility
                if linear_norm > 0.0 {
                    (linear_norm * 10.0).ln_1p() / 10.0_f64.ln_1p()
                } else {
                    0.0
                }
            } else {
                0.0
            };

            let color = self.apply_color_scheme(normalized, color_scheme);

            rgba[i * 4] = color.0; // R
            rgba[i * 4 + 1] = color.1; // G
            rgba[i * 4 + 2] = color.2; // B
            rgba[i * 4 + 3] = 255; // A
        }

        wasm_bindgen::Clamped(rgba)
    }

    /// Variant with selectable scaling mode for density mapping.
    /// scale_mode:
    /// 0 = soft log (current default: ln_1p(linear_norm * 10)/ln_1p(10))
    /// 1 = pure log: ln_1p(density)/ln_1p(max_density)
    /// 2 = linear: density/max_density
    /// 3 = sqrt(linear_norm)
    /// 4 = gamma 0.5 (sqrt) alias
    /// 5 = gamma 0.25 (4th root)
    #[wasm_bindgen]
    pub fn density_grid_to_rgba_scaled(
        &self,
        density: &[u32],
        width: usize,
        height: usize,
        color_scheme: ColorScheme,
        scale_mode: u32,
    ) -> wasm_bindgen::Clamped<Vec<u8>> {
        if density.len() != width * height {
            return wasm_bindgen::Clamped(vec![0; width * height * 4]);
        }

        let max_density_val = *density.iter().max().unwrap_or(&1) as f64;
        let mut rgba = vec![0u8; width * height * 4];
        if max_density_val <= 0.0 {
            return wasm_bindgen::Clamped(rgba); // all zeros
        }

        for (i, &dv) in density.iter().enumerate() {
            let d = dv as f64;
            let linear_norm = d / max_density_val;
            let mapped = match scale_mode {
                1 => {
                    // pure log
                    if d > 0.0 {
                        d.ln_1p() / max_density_val.ln_1p()
                    } else {
                        0.0
                    }
                }
                2 => linear_norm,            // linear
                3 | 4 => linear_norm.sqrt(), // sqrt variants
                5 => linear_norm.powf(0.25), // 4th root
                _ => {
                    // soft log (default)
                    if linear_norm > 0.0 {
                        (linear_norm * 10.0).ln_1p() / 10.0_f64.ln_1p()
                    } else {
                        0.0
                    }
                }
            };
            let color = self.apply_color_scheme(mapped, color_scheme);
            let base = i * 4;
            rgba[base] = color.0;
            rgba[base + 1] = color.1;
            rgba[base + 2] = color.2;
            rgba[base + 3] = 255;
        }
        wasm_bindgen::Clamped(rgba)
    }

    /// Log-soft density mapping with adjustable softness factor s (>0):
    /// mapped = ln(1 + s * d) / ln(1 + s * max_d)
    #[wasm_bindgen]
    pub fn density_grid_to_rgba_log_soft(
        &self,
        density: &[u32],
        width: usize,
        height: usize,
        color_scheme: ColorScheme,
        softness: f64,
    ) -> wasm_bindgen::Clamped<Vec<u8>> {
        if density.len() != width * height {
            return wasm_bindgen::Clamped(vec![0; width * height * 4]);
        }

        let max_density_u32 = *density.iter().max().unwrap_or(&0);
        if max_density_u32 == 0 {
            return wasm_bindgen::Clamped(vec![0u8; width * height * 4]);
        }
        let max_density = max_density_u32 as f64;
        let s = if softness.is_finite() && softness > 0.0 {
            softness
        } else {
            1.0
        };
        let denom = (1.0 + s * max_density).ln();
        if !denom.is_finite() || denom <= 0.0 {
            return wasm_bindgen::Clamped(vec![0u8; width * height * 4]);
        }

        let mut rgba = vec![0u8; width * height * 4];
        for (i, &dv) in density.iter().enumerate() {
            let d = dv as f64;
            let mapped = if d > 0.0 {
                ((1.0 + s * d).ln() / denom).clamp(0.0, 1.0)
            } else {
                0.0
            };
            let color = self.apply_color_scheme(mapped, color_scheme);
            let base = i * 4;
            rgba[base] = color.0;
            rgba[base + 1] = color.1;
            rgba[base + 2] = color.2;
            rgba[base + 3] = 255;
        }
        wasm_bindgen::Clamped(rgba)
    }

    /// Calculate bounds for a set of points
    #[wasm_bindgen]
    pub fn calculate_point_bounds(&self, points: &[f64]) -> Vec<f64> {
        if points.len() < 2 {
            return vec![0.0, 1.0, 0.0, 1.0]; // default bounds
        }

        let mut min_x = f64::INFINITY;
        let mut max_x = f64::NEG_INFINITY;
        let mut min_y = f64::INFINITY;
        let mut max_y = f64::NEG_INFINITY;

        for chunk in points.chunks(2) {
            let x = chunk[0];
            let y = chunk[1];

            min_x = min_x.min(x);
            max_x = max_x.max(x);
            min_y = min_y.min(y);
            max_y = max_y.max(y);
        }

        // Add small padding
        let padding_x = (max_x - min_x) * 0.1;
        let padding_y = (max_y - min_y) * 0.1;

        vec![
            min_x - padding_x,
            max_x + padding_x,
            min_y - padding_y,
            max_y + padding_y,
        ]
    }

    /// Generate RGBA pixel data from points with color mapping
    pub fn points_to_rgba(
        &self,
        points: &[f64],
        width: usize,
        height: usize,
        color_scheme: ColorScheme,
    ) -> Vec<u8> {
        if points.len() % 2 != 0 {
            return vec![0; width * height * 4];
        }

        // Convert flat array back to points
        let point_pairs: Vec<Point2D> = points
            .chunks(2)
            .map(|chunk| Point2D::new(chunk[0], chunk[1]))
            .collect();

        if point_pairs.is_empty() {
            return vec![0; width * height * 4];
        }

        // Find bounds
        let min_x = point_pairs
            .iter()
            .map(|p| p.x)
            .fold(f64::INFINITY, f64::min)
            - 0.2;
        let max_x = point_pairs
            .iter()
            .map(|p| p.x)
            .fold(f64::NEG_INFINITY, f64::max)
            + 0.2;
        let min_y = point_pairs
            .iter()
            .map(|p| p.y)
            .fold(f64::INFINITY, f64::min)
            - 0.2;
        let max_y = point_pairs
            .iter()
            .map(|p| p.y)
            .fold(f64::NEG_INFINITY, f64::max)
            + 0.2;

        // Create density grid
        let mut density = vec![0u32; width * height];

        for point in point_pairs {
            let x = ((point.x - min_x) / (max_x - min_x) * width as f64) as usize;
            let y = ((point.y - min_y) / (max_y - min_y) * height as f64) as usize;

            if x < width && y < height {
                density[y * width + x] += 1;
            }
        }

        // Find max density for normalization
        let max_density = *density.iter().max().unwrap_or(&1) as f64;

        // Generate RGBA data
        let mut rgba = vec![0u8; width * height * 4];

        for (i, &dv) in density.iter().enumerate() {
            let normalized = if max_density > 0.0 {
                let linear_norm = dv as f64 / max_density;
                // Use a softer logarithmic mapping for better visibility
                if linear_norm > 0.0 {
                    (linear_norm * 10.0).ln_1p() / 10.0_f64.ln_1p()
                } else {
                    0.0
                }
            } else {
                0.0
            };

            let color = self.apply_color_scheme(normalized, color_scheme);

            rgba[i * 4] = color.0; // R
            rgba[i * 4 + 1] = color.1; // G
            rgba[i * 4 + 2] = color.2; // B
            rgba[i * 4 + 3] = 255; // A
        }

        rgba
    }
}

// -----------------------------------------------------------------------------
// In-engine iterative accumulation (performance path)
// -----------------------------------------------------------------------------
/// Stateful accumulator that keeps a running density grid and incremental
/// coverage metrics entirely inside WASM to avoid large per-batch memory copies
/// and repeated JS-side scans for non-zero counts.
/// Uses chunked memory allocation for very large resolutions (32K+).
#[wasm_bindgen]
pub struct ChaoticAccumulator {
    x_params: Vec<f64>,
    y_params: Vec<f64>,
    is_cubic: bool,
    width: usize,
    height: usize,
    min_x: f64,
    max_x: f64,
    min_y: f64,
    max_y: f64,
    x: f64,
    y: f64,
    density: Option<Vec<u16>>,           // For small resolutions (16-bit, saturating)
    // For very large resolutions, use sparse per-row storage to avoid huge dense allocations
    // Each row stores a mapping of column -> count (u16, saturating)
    sparse_rows: Option<Vec<std::collections::HashMap<u32, u16>>>,
    use_chunked: bool,                   // Whether to use sparse (large) memory
    non_zero: usize,
    // Small-res reusable RGBA buffer; for chunked/large we stream rows instead of storing full RGBA
    rgba_buf: Option<Vec<u8>>,
    // Mapping cache for row streaming (valid after fill_rgba_log_soft)
    map_ready: bool,
    map_s: f64,
    map_denom: f64,
    map_color_scheme: ColorScheme,
    map_max_density: u16,
}

#[wasm_bindgen]
impl ChaoticAccumulator {
    /// Create a new accumulator with initial orbit state and fixed bounds.
    /// Uses chunked memory allocation for very large resolutions to avoid WASM memory limits.
    #[wasm_bindgen(constructor)]
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        x_params: Vec<f64>,
        y_params: Vec<f64>,
        is_cubic: bool,
        width: usize,
        height: usize,
        min_x: f64,
        max_x: f64,
        min_y: f64,
        max_y: f64,
        start_x: f64,
        start_y: f64,
    ) -> ChaoticAccumulator {
    let total_pixels = width * height;
    // Switch to sparse storage when the dense grid would be too large for browser WASM memory
    const MAX_CONTIGUOUS_PIXELS: usize = 50_000_000; // ~100MB for u16; tweak as needed
    let use_chunked = total_pixels > MAX_CONTIGUOUS_PIXELS;
        
        console_log!("🔧 ChaoticAccumulator: {}x{} = {} pixels, chunked: {}", 
                    width, height, total_pixels, use_chunked);
        
        if use_chunked {
            // Allocate sparse per-row maps (empty). Memory grows only with non-zero pixels.
            let mut rows = Vec::with_capacity(height);
            for _ in 0..height { rows.push(std::collections::HashMap::new()); }

            ChaoticAccumulator {
                x_params,
                y_params,
                is_cubic,
                width,
                height,
                min_x,
                max_x,
                min_y,
                max_y,
                x: start_x,
                y: start_y,
                density: None,
                sparse_rows: Some(rows),
                use_chunked: true,
                non_zero: 0,
                rgba_buf: None,
                map_ready: false,
                map_s: 1.0,
                map_denom: 1.0,
                map_color_scheme: ColorScheme::Cubehelix,
                map_max_density: 0,
            }
        } else {
            ChaoticAccumulator {
                x_params,
                y_params,
                is_cubic,
                width,
                height,
                min_x,
                max_x,
                min_y,
                max_y,
                x: start_x,
                y: start_y,
                density: Some(vec![0u16; total_pixels]),
                sparse_rows: None,
                use_chunked: false,
                non_zero: 0,
                rgba_buf: Some(vec![0u8; total_pixels * 4]),
                map_ready: false,
                map_s: 1.0,
                map_denom: 1.0,
                map_color_scheme: ColorScheme::Cubehelix,
                map_max_density: 0,
            }
        }
    }

    /// Helper: Get density value at linear index, works with both chunked and regular memory
    fn get_density(&self, idx: usize) -> u32 {
        if self.use_chunked {
            if let Some(ref rows) = self.sparse_rows {
                if self.width == 0 { return 0; }
                let row = idx / self.width;
                let col = (idx % self.width) as u32;
                if row < rows.len() {
                    if let Some(v) = rows[row].get(&col) { return *v as u32; }
                }
                0
            } else { 0 }
        } else {
            self.density
                .as_ref()
                .map(|d| d.get(idx).copied().unwrap_or(0) as u32)
                .unwrap_or(0)
        }
    }

    /// Helper: Set density value at linear index, works with both chunked and regular memory
    fn set_density(&mut self, idx: usize, value: u16) {
        if self.use_chunked {
            if let Some(ref mut rows) = self.sparse_rows {
                if self.width == 0 { return; }
                let row = idx / self.width;
                let col = (idx % self.width) as u32;
                if row < rows.len() {
                    let r = &mut rows[row];
                    if value == 0 {
                        r.remove(&col);
                    } else {
                        r.insert(col, value);
                    }
                }
            }
        } else if let Some(ref mut density) = self.density {
            if idx < density.len() {
                density[idx] = value;
            }
        }
    }

    /// Helper: Increment density value at linear index, returns whether it was newly lit
    fn increment_density(&mut self, idx: usize) -> bool {
        if self.use_chunked {
            if let Some(ref mut rows) = self.sparse_rows {
                if self.width == 0 { return false; }
                let row = idx / self.width;
                let col = (idx % self.width) as u32;
                if row >= rows.len() { return false; }
                let r: &mut HashMap<u32, u16> = &mut rows[row];
                match r.get_mut(&col) {
                    Some(v) => { if *v < u16::MAX { *v = v.saturating_add(1); } false }
                    None => { r.insert(col, 1); true }
                }
            } else { false }
        } else {
            let current = self.get_density(idx) as u16;
            let was_zero = current == 0;
            // Saturate at u16::MAX
            let new_val = if current == u16::MAX { u16::MAX } else { current.saturating_add(1) };
            self.set_density(idx, new_val);
            was_zero
        }
    }

    /// Advance the chaotic map by n_points, updating the internal density.
    /// Returns a small stats vector to minimize JS processing:
    /// [ final_x, final_y, new_pixels_added, total_non_zero_pixels ]
    pub fn step_batch(&mut self, n_points: usize) -> Vec<f64> {
        for _ in 0..n_points {
            let (xp, yp) = (self.x, self.y);
            if self.is_cubic {
                self.x = map_cubic(&self.x_params, xp, yp);
                self.y = map_cubic(&self.y_params, xp, yp);
            } else {
                self.x = map_quadratic(&self.x_params, xp, yp);
                self.y = map_quadratic(&self.y_params, xp, yp);
            }

            if self.x >= self.min_x
                && self.x <= self.max_x
                && self.y >= self.min_y
                && self.y <= self.max_y
            {
                let px = ((self.x - self.min_x) / (self.max_x - self.min_x) * self.width as f64)
                    as usize;
                let py = ((self.y - self.min_y) / (self.max_y - self.min_y) * self.height as f64)
                    as usize;
                if px < self.width && py < self.height {
                    let idx = py * self.width + px;
                    if self.increment_density(idx) {
                        self.non_zero += 1;
                    }
                }
            }
        }
        vec![self.x, self.y, 0.0_f64, self.non_zero as f64] // new_pixels placeholder (deprecated by incremental UI logic)
    }

    /// Same as step_batch but also reports how many brand new pixels were lit this batch.
    /// Returns: [final_x, final_y, newly_lit_pixels, total_non_zero]
    pub fn step_batch_with_new(&mut self, n_points: usize) -> Vec<f64> {
        let mut new_pixels = 0usize;
        for _ in 0..n_points {
            let (xp, yp) = (self.x, self.y);
            if self.is_cubic {
                self.x = map_cubic(&self.x_params, xp, yp);
                self.y = map_cubic(&self.y_params, xp, yp);
            } else {
                self.x = map_quadratic(&self.x_params, xp, yp);
                self.y = map_quadratic(&self.y_params, xp, yp);
            }
            if self.x >= self.min_x
                && self.x <= self.max_x
                && self.y >= self.min_y
                && self.y <= self.max_y
            {
                let px = ((self.x - self.min_x) / (self.max_x - self.min_x) * self.width as f64)
                    as usize;
                let py = ((self.y - self.min_y) / (self.max_y - self.min_y) * self.height as f64)
                    as usize;
                if px < self.width && py < self.height {
                    let idx = py * self.width + px;
                    if self.increment_density(idx) {
                        self.non_zero += 1;
                        new_pixels += 1;
                    }
                }
            }
        }
        vec![self.x, self.y, new_pixels as f64, self.non_zero as f64]
    }

    /// Export a clone of the density grid (used only at finalization / external caching).
    pub fn density(&self) -> Vec<u32> {
        if self.use_chunked {
            // Reconstruct full density array from sparse rows
            let total_pixels = self.width * self.height;
            let mut result = vec![0u32; total_pixels];
            if let Some(ref rows) = self.sparse_rows {
                for (row_idx, row) in rows.iter().enumerate() {
                    let base = row_idx * self.width;
                    for (col, &v) in row.iter() {
                        let idx = base + (*col as usize);
                        if idx < result.len() { result[idx] = v as u32; }
                    }
                }
            }
            result
        } else {
            self
                .density
                .as_ref()
                .map(|v| v.iter().map(|&x| x as u32).collect())
                .unwrap_or_default()
        }
    }

    /// Convenience: directly map current density to RGBA with scaling & color scheme.
    pub fn to_rgba_scaled(
        &self,
        color_scheme: ColorScheme,
        scale_mode: u32,
    ) -> wasm_bindgen::Clamped<Vec<u8>> {
        // Re-use existing generator implementation for mapping
        let gen = FractalGenerator::new();
        let density_grid = self.density(); // This handles chunked reconstruction
        gen.density_grid_to_rgba_scaled(
            &density_grid,
            self.width,
            self.height,
            color_scheme,
            scale_mode,
        )
    }

    /// Map current density to RGBA using log-soft mapping with adjustable softness
    #[wasm_bindgen]
    pub fn to_rgba_log_soft(
        &self,
        color_scheme: ColorScheme,
        softness: f64,
    ) -> wasm_bindgen::Clamped<Vec<u8>> {
        let gen = FractalGenerator::new();
        let density_grid = self.density(); // This handles chunked reconstruction
        gen.density_grid_to_rgba_log_soft(
            &density_grid,
            self.width,
            self.height,
            color_scheme,
            softness,
        )
    }

    /// Fill the internal reusable RGBA buffer from current density with log-soft mapping (zero-copy view ready)
    #[wasm_bindgen]
    pub fn fill_rgba_log_soft(&mut self, color_scheme: ColorScheme, softness: f64) {
        // Compute mapping similarly to FractalGenerator::density_grid_to_rgba_log_soft but write into rgba_buf
        if self.width == 0 || self.height == 0 {
            return;
        }
        
        // Find max density across all chunks
        let max_density_u16: u16 = if self.use_chunked {
            if let Some(ref rows) = self.sparse_rows {
                let mut maxv: u16 = 0;
                for r in rows.iter() {
                    for v in r.values() { if *v > maxv { maxv = *v; } }
                }
                maxv
            } else { 0 }
        } else {
            self
                .density
                .as_ref()
                .map(|v| *v.iter().max().unwrap_or(&0))
                .unwrap_or(0)
        };
        
        // Cache mapping parameters for row streaming
        self.map_max_density = max_density_u16;
        if max_density_u16 == 0 {
            // Clear small-res buffer if present and mark mapping ready with zero denom
            if let Some(ref mut rgba_buf) = self.rgba_buf {
                for b in rgba_buf.iter_mut() { *b = 0; }
            }
            self.map_s = if softness.is_finite() && softness > 0.0 { softness } else { 1.0 };
            self.map_denom = 0.0;
            self.map_color_scheme = color_scheme;
            self.map_ready = true;
            return;
        }

        let max_density = max_density_u16 as f64;
        let s = if softness.is_finite() && softness > 0.0 {
            softness
        } else {
            1.0
        };
        let denom = (1.0 + s * max_density).ln();
        if !denom.is_finite() || denom <= 0.0 {
            if let Some(ref mut rgba_buf) = self.rgba_buf {
                for b in rgba_buf.iter_mut() { *b = 0; }
            }
            self.map_s = s;
            self.map_denom = 0.0;
            self.map_color_scheme = color_scheme;
            self.map_ready = true;
            return;
        }

        // Store mapping state for streamed rendering
        self.map_s = s;
        self.map_denom = denom;
        self.map_color_scheme = color_scheme;
        self.map_ready = true;

    if !self.use_chunked {
            if let Some(ref density) = self.density {
                if let Some(ref mut rgba_buf) = self.rgba_buf {
                    // Ensure buffer sized correctly
                    if rgba_buf.len() != self.width * self.height * 4 {
                        rgba_buf.resize(self.width * self.height * 4, 0);
                    }

                    for i in 0..density.len() {
                        let d = density[i] as f64;
                        let mapped = if d > 0.0 {
                            ((1.0 + s * d).ln() / denom).clamp(0.0, 1.0)
                        } else {
                            0.0
                        };
                        let color = FractalGenerator::apply_color_scheme_static(mapped, color_scheme);
                        let base = i * 4;
                        rgba_buf[base] = color.0;
                        rgba_buf[base + 1] = color.1;
                        rgba_buf[base + 2] = color.2;
                        rgba_buf[base + 3] = 255;
                    }
                }
            }
        }
    }

    /// Return a zero-copy JS view over the internal RGBA buffer. Recreate the view after memory growth.
    /// For large/sparse memory, returns an empty view. Use get_rgba_rows() from JS.
    #[wasm_bindgen]
    pub fn rgba_view(&self) -> Uint8ClampedArray {
        if self.use_chunked {
            // For chunked/large images, avoid allocating gigantic RGBA arrays; return empty view.
            // Use get_rgba_rows() from JS to stream rows.
            Uint8ClampedArray::new_with_length(0)
        } else {
            if let Some(ref rgba_buf) = self.rgba_buf {
                unsafe { Uint8ClampedArray::view(rgba_buf) }
            } else {
                Uint8ClampedArray::new_with_length(0)
            }
        }
    }

    /// Whether this accumulator uses chunked (large) memory mode
    #[wasm_bindgen]
    pub fn use_chunked(&self) -> bool { self.use_chunked }

    /// Stream RGBA rows computed with the last fill_rgba_log_soft mapping.
    /// start_row + rows will be clamped to height.
    #[wasm_bindgen]
    pub fn get_rgba_rows(
        &self,
        start_row: usize,
        rows: usize,
    ) -> wasm_bindgen::Clamped<Vec<u8>> {
        let h = self.height;
        let w = self.width;
        if w == 0 || h == 0 || start_row >= h || rows == 0 {
            return wasm_bindgen::Clamped(vec![]);
        }
        let end_row = (start_row + rows).min(h);
        let out_rows = end_row - start_row;
        let mut out = vec![0u8; out_rows * w * 4];

        // Ensure mapping computed
        let s = if self.map_ready { self.map_s } else { 1.0 };
        let denom = if self.map_ready { self.map_denom } else { 0.0 };
        let scheme = if self.map_ready { self.map_color_scheme } else { ColorScheme::Cubehelix };

        // If denom invalid or max density zero, return transparent rows
        if self.map_max_density == 0 || !denom.is_finite() || denom <= 0.0 {
            return wasm_bindgen::Clamped(out);
        }

        for row in start_row..end_row {
            let out_row_off = (row - start_row) * w * 4;
            if self.use_chunked {
                // Use sparse row data to fill this row quickly
                if let Some(ref rows) = self.sparse_rows {
                    if row < rows.len() {
                        // Default already zero; fill only non-zero cols
                        for (col_u32, &v) in rows[row].iter() {
                            let col = *col_u32 as usize;
                            if col < w {
                                let d = v as f64;
                                let mapped = if d > 0.0 { ((1.0 + s * d).ln() / denom).clamp(0.0, 1.0) } else { 0.0 };
                                let (r, g, b) = FractalGenerator::apply_color_scheme_static(mapped, scheme);
                                let off = out_row_off + col * 4;
                                out[off] = r;
                                out[off + 1] = g;
                                out[off + 2] = b;
                                out[off + 3] = 255;
                            }
                        }
                    }
                }
            } else {
                let base_idx = row * w;
                let mut col_off = 0usize;
                for col in 0..w {
                    let idx = base_idx + col;
                    let d = self.get_density(idx) as f64;
                    let mapped = if d > 0.0 { ((1.0 + s * d).ln() / denom).clamp(0.0, 1.0) } else { 0.0 };
                    let (r, g, b) = FractalGenerator::apply_color_scheme_static(mapped, scheme);
                    let off = out_row_off + col_off;
                    out[off] = r;
                    out[off + 1] = g;
                    out[off + 2] = b;
                    out[off + 3] = 255;
                    col_off += 4;
                }
            }
        }
        wasm_bindgen::Clamped(out)
    }
}

// -----------------------------------------------------------------------------
// Shared chaotic map functions (avoid duplication between generator & accumulator)
// -----------------------------------------------------------------------------
#[inline]
fn map_quadratic(args: &[f64], x: f64, y: f64) -> f64 {
    let (a, b, c, d, e, f) = (args[0], args[1], args[2], args[3], args[4], args[5]);
    a + b * x + c * (x * x) + d * (x * y) + e * y + f * (y * y)
}

#[inline]
fn map_cubic(args: &[f64], x: f64, y: f64) -> f64 {
    args[0]
        + args[1] * x
        + args[2] * x * x
        + args[3] * x * x * x
        + args[4] * x * x * y
        + args[5] * x * y
        + args[6] * x * y * y
        + args[7] * y
        + args[8] * y * y
        + args[9] * y * y * y
}

// Internal implementations
impl FractalGenerator {
    fn chaos_game_internal(
        &mut self,
        vertices: Vec<Point2D>,
        x0: f64,
        y0: f64,
        iterations: usize,
        transforms: Vec<Transform>,
        rule: &Rule,
    ) -> Vec<Point2D> {
        let mut points = Vec::with_capacity(iterations);
        let mut current = Point2D::new(x0, y0);
        points.push(current);

        let vertex_count = vertices.len();
        let transform_count = transforms.len();
        let mut rule_copy = rule.clone();

        for _ in 1..iterations {
            let vertex_index = self.select_vertex(vertex_count, &mut rule_copy);
            let vertex = vertices[vertex_index];
            let transform = transforms[vertex_index % transform_count];

            // Calculate difference vector
            let diff_x = vertex.x - current.x;
            let diff_y = vertex.y - current.y;

            // Apply rotation
            let cos_theta = transform.rotation.cos();
            let sin_theta = transform.rotation.sin();
            let rotated_x = diff_x * cos_theta - diff_y * sin_theta;
            let rotated_y = diff_x * sin_theta + diff_y * cos_theta;

            // Apply compression and move
            current.x += rotated_x * transform.compression;
            current.y += rotated_y * transform.compression;

            points.push(current);
        }

        points
    }

    // Helper: static version of color scheme mapping for reuse in accumulator fill methods
    fn apply_color_scheme_static(normalized: f64, scheme: ColorScheme) -> (u8, u8, u8) {
        // Reuse the instance method by creating a temporary generator (stateless for color mapping)
        let gen = FractalGenerator::new();
        gen.apply_color_scheme(normalized, scheme)
    }

    fn ifs_fractal_internal(
        &mut self,
        start: Point2D,
        iterations: usize,
        transforms: Vec<AffineTransform>,
        probabilities: Vec<f64>,
        use_borke_mode: bool,
    ) -> Vec<Point2D> {
        let mut points = Vec::with_capacity(iterations);
        let mut current = start;
        points.push(current);

        // Normalize probabilities
        let prob_sum: f64 = probabilities.iter().sum();
        let normalized_probs: Vec<f64> = if prob_sum > 0.0 {
            probabilities.iter().map(|p| p / prob_sum).collect()
        } else {
            vec![1.0 / transforms.len() as f64; transforms.len()]
        };

        for _ in 1..iterations {
            let transform_index = self.select_transform(&normalized_probs);
            let transform = transforms[transform_index];

            current = if use_borke_mode {
                transform.apply_borke(current)
            } else {
                transform.apply_regular(current)
            };

            points.push(current);
        }

        points
    }

    fn select_vertex(&mut self, vertex_count: usize, rule: &mut Rule) -> usize {
        loop {
            let index = self.rng.gen_range(0..vertex_count) as i32;
            if !rule.check(vertex_count as i32, index) {
                rule.add(index);
                return index as usize;
            }
        }
    }

    fn select_transform(&mut self, probabilities: &[f64]) -> usize {
        let random_value: f64 = self.rng.gen();
        let mut cumulative = 0.0;

        for (i, &prob) in probabilities.iter().enumerate() {
            cumulative += prob;
            if random_value <= cumulative {
                return i;
            }
        }

        probabilities.len() - 1
    }

    fn apply_color_scheme(&self, normalized: f64, scheme: ColorScheme) -> (u8, u8, u8) {
        // Primary path: LUT lookup
        let idx = lut_index(normalized);
        if let Some((r, g, b)) = (*LUTS).get(&scheme).and_then(|lut| lut.get(idx).copied()) {
            return (r, g, b);
        }
        // Fallback: compute directly (should not normally happen)
        let clamped = normalized.clamp(0.0, 1.0);
        match scheme {
            ColorScheme::Fire => self.fire_colormap(clamped),
            ColorScheme::Jet => self.jet_colormap(clamped),
            ColorScheme::Prism => self.prism_colormap(clamped),
            ColorScheme::Turbo => self.turbo_colormap(clamped),
            ColorScheme::ColorWheel => self.colorwheel_colormap(clamped),
            ColorScheme::GnuPlot => self.gnuplot_colormap(clamped),
            ColorScheme::Bmy => self.bmy_colormap(clamped),
            ColorScheme::Plasma => self.plasma_colormap(clamped),
            ColorScheme::Inferno => self.inferno_colormap(clamped),
            ColorScheme::Viridis => self.viridis_colormap(clamped),
            ColorScheme::Neon => self.neon_colormap(clamped),
            ColorScheme::Pastel => self.pastel_colormap(clamped),
            ColorScheme::Magma => self.magma_colormap(clamped),
            ColorScheme::Cividis => self.cividis_colormap(clamped),
            ColorScheme::Gray => self.gray_colormap(clamped),
            ColorScheme::Cubehelix => self.cubehelix_colormap(clamped),
            ColorScheme::BlueOrange => self.blueorange_colormap(clamped),
            ColorScheme::Heat => self.heat_colormap(clamped),
            ColorScheme::Ice => self.ice_colormap(clamped),
            ColorScheme::WhiteFire => self.white_fire_colormap(clamped),
            ColorScheme::WhiteHeat => self.white_heat_colormap(clamped),
            ColorScheme::WhiteBlue => self.white_blue_colormap(clamped),
            ColorScheme::WhiteViridis => self.white_viridis_colormap(clamped),
            ColorScheme::WhiteMagma => self.white_magma_colormap(clamped),
        }
    }

    fn fire_colormap(&self, t: f64) -> (u8, u8, u8) {
        if t < 0.25 {
            let scaled = t * 4.0;
            ((255.0 * scaled) as u8, 0, 0)
        } else if t < 0.5 {
            let scaled = (t - 0.25) * 4.0;
            (255, (255.0 * scaled) as u8, 0)
        } else if t < 0.75 {
            let scaled = (t - 0.5) * 4.0;
            (255, 255, (255.0 * scaled) as u8)
        } else {
            (255, 255, 255)
        }
    }

    fn jet_colormap(&self, t: f64) -> (u8, u8, u8) {
        let r = (1.5 - 4.0 * (t - 0.75).abs()).clamp(0.0, 1.0);
        let g = (1.5 - 4.0 * (t - 0.5).abs()).clamp(0.0, 1.0);
        let b = (1.5 - 4.0 * (t - 0.25).abs()).clamp(0.0, 1.0);

        ((255.0 * r) as u8, (255.0 * g) as u8, (255.0 * b) as u8)
    }

    fn prism_colormap(&self, t: f64) -> (u8, u8, u8) {
        let hue = t * 6.0;
        let sector = hue as u32 % 6;
        let fraction = hue - (sector as f64);

        match sector {
            0 => (255, (255.0 * fraction) as u8, 0),
            1 => ((255.0 * (1.0 - fraction)) as u8, 255, 0),
            2 => (0, 255, (255.0 * fraction) as u8),
            3 => (0, (255.0 * (1.0 - fraction)) as u8, 255),
            4 => ((255.0 * fraction) as u8, 0, 255),
            _ => (255, 0, (255.0 * (1.0 - fraction)) as u8),
        }
    }

    fn turbo_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Simplified turbo colormap approximation
        let r =
            (34.61 + t * (1172.33 - t * (10793.56 - t * (4193.5 - t * 1667.54)))).clamp(0.0, 255.0);
        let g =
            (23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * 1073.77)))).clamp(0.0, 255.0);
        let b =
            (27.2 + t * (3211.1 - t * (15327.97 - t * (27814.0 - t * 22569.18)))).clamp(0.0, 255.0);

        (r as u8, g as u8, b as u8)
    }

    fn colorwheel_colormap(&self, t: f64) -> (u8, u8, u8) {
        let angle = t * 2.0 * PI;
        let r = ((angle.cos() + 1.0) * 127.5) as u8;
        let g = ((angle.sin() + 1.0) * 127.5) as u8;
        let b = (((angle + PI / 2.0).cos() + 1.0) * 127.5) as u8;

        (r, g, b)
    }

    fn gnuplot_colormap(&self, t: f64) -> (u8, u8, u8) {
        let r = if t < 0.25 {
            0.0
        } else if t < 0.5 {
            (t - 0.25) * 4.0
        } else {
            1.0
        };
        let g = if t < 0.25 {
            t * 4.0
        } else if t < 0.75 {
            1.0
        } else {
            1.0 - (t - 0.75) * 4.0
        };
        let b = if t < 0.5 { 1.0 } else { 1.0 - (t - 0.5) * 2.0 };

        ((255.0 * r) as u8, (255.0 * g) as u8, (255.0 * b) as u8)
    }

    fn bmy_colormap(&self, t: f64) -> (u8, u8, u8) {
        if t < 0.33 {
            let scaled = t * 3.0;
            (0, (255.0 * scaled) as u8, 255)
        } else if t < 0.67 {
            let scaled = (t - 0.33) * 3.0;
            ((255.0 * scaled) as u8, 255, (255.0 * (1.0 - scaled)) as u8)
        } else {
            let scaled = (t - 0.67) * 3.0;
            (255, (255.0 * (1.0 - scaled)) as u8, 0)
        }
    }

    // ----- NEW BRIGHT / MODERN COLOR MAPS -----
    // Helper to interpolate along gradient stops
    fn gradient_color(&self, t: f64, stops: &[(u8, u8, u8)]) -> (u8, u8, u8) {
        if stops.is_empty() {
            return (0, 0, 0);
        }
        if stops.len() == 1 {
            return stops[0];
        }
        let n = stops.len();
        let scaled = t.clamp(0.0, 1.0) * (n as f64 - 1.0);
        let idx = scaled.floor() as usize;
        if idx >= n - 1 {
            return stops[n - 1];
        }
        let frac = scaled - idx as f64;
        let (r1, g1, b1) = stops[idx];
        let (r2, g2, b2) = stops[idx + 1];
        let lerp = |a: u8, b: u8| -> u8 { (a as f64 + (b as f64 - a as f64) * frac).round() as u8 };
        (lerp(r1, r2), lerp(g1, g2), lerp(b1, b2))
    }

    fn plasma_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Approximate Matplotlib plasma
        const STOPS: &[(u8, u8, u8)] = &[
            (13, 8, 135),
            (106, 0, 168),
            (177, 42, 144),
            (225, 100, 98),
            (252, 166, 54),
            (240, 249, 33),
        ];
        self.gradient_color(t, STOPS)
    }

    fn inferno_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 0, 4),
            (27, 12, 65),
            (74, 12, 107),
            (120, 28, 109),
            (165, 44, 96),
            (207, 68, 70),
            (237, 105, 37),
            (251, 155, 6),
            (247, 209, 61),
            (252, 255, 164),
        ];
        self.gradient_color(t, STOPS)
    }

    fn viridis_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (68, 1, 84),
            (65, 68, 135),
            (42, 120, 142),
            (34, 168, 132),
            (122, 209, 81),
            (253, 231, 37),
        ];
        self.gradient_color(t, STOPS)
    }

    fn neon_colormap(&self, t: f64) -> (u8, u8, u8) {
        // High-contrast rainbow styled for bright output
        const STOPS: &[(u8, u8, u8)] = &[
            (255, 0, 255),
            (255, 0, 128),
            (255, 0, 0),
            (255, 128, 0),
            (255, 255, 0),
            (128, 255, 0),
            (0, 255, 0),
            (0, 255, 128),
            (0, 255, 255),
            (0, 128, 255),
            (0, 0, 255),
        ];
        self.gradient_color(t, STOPS)
    }

    fn pastel_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Soft muted tones for printable background-friendly images
        const STOPS: &[(u8, u8, u8)] = &[
            (248, 232, 244),
            (229, 213, 245),
            (208, 229, 245),
            (208, 245, 229),
            (245, 243, 208),
            (245, 208, 208),
        ];
        self.gradient_color(t, STOPS)
    }

    fn magma_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 0, 4),
            (28, 16, 68),
            (79, 18, 123),
            (129, 37, 129),
            (181, 54, 122),
            (229, 80, 100),
            (252, 126, 74),
            (252, 179, 50),
            (245, 233, 191),
        ];
        self.gradient_color(t, STOPS)
    }

    fn cividis_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 32, 76),
            (24, 52, 101),
            (42, 73, 123),
            (60, 94, 137),
            (81, 117, 142),
            (104, 140, 141),
            (130, 164, 135),
            (162, 189, 119),
            (198, 216, 87),
            (236, 243, 33),
        ];
        self.gradient_color(t, STOPS)
    }

    fn gray_colormap(&self, t: f64) -> (u8, u8, u8) {
        let v = (t * 255.0).round() as u8;
        (v, v, v)
    }

    fn cubehelix_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Basic cubehelix implementation
        let a = 0.5; // amplitude
        let b = -1.5 + 2.0 * t; // rotation
        let phi = 2.0 * PI * (b / 3.0);
        let t2 = t * (1.0 - t);
        let r = (255.0 * (t + a * t2 * (-0.14861 * phi.cos() + 1.78277 * phi.sin())))
            .clamp(0.0, 255.0) as u8;
        let g = (255.0 * (t + a * t2 * (-0.29227 * phi.cos() - 0.90649 * phi.sin())))
            .clamp(0.0, 255.0) as u8;
        let bch = (255.0 * (t + a * t2 * (1.97294 * phi.cos()))).clamp(0.0, 255.0) as u8;
        (r, g, bch)
    }

    fn blueorange_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Diverging: deep blue -> white -> orange
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 32, 96),
            (32, 96, 160),
            (128, 192, 224),
            (224, 224, 224),
            (255, 192, 128),
            (240, 128, 32),
            (192, 64, 0),
        ];
        self.gradient_color(t, STOPS)
    }

    fn heat_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Black -> red -> yellow -> white
        if t < 0.33 {
            let f = t / 0.33;
            ((255.0 * f) as u8, 0, 0)
        } else if t < 0.66 {
            let f = (t - 0.33) / 0.33;
            (255, (255.0 * f) as u8, 0)
        } else {
            let f = (t - 0.66) / 0.34;
            (255, 255, (255.0 * f) as u8)
        }
    }

    fn ice_colormap(&self, t: f64) -> (u8, u8, u8) {
        // Dark teal -> cyan -> very light blue/white
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 32, 48),
            (0, 64, 96),
            (0, 128, 160),
            (64, 192, 224),
            (160, 224, 240),
            (230, 247, 255),
        ];
        self.gradient_color(t, STOPS)
    }

    // ---- White-zero variants ----
    fn white_fire_colormap(&self, t: f64) -> (u8, u8, u8) {
        // White -> yellow -> orange -> red -> dark maroon
        const STOPS: &[(u8, u8, u8)] = &[
            (255, 255, 255),
            (255, 255, 210),
            (255, 220, 120),
            (255, 140, 0),
            (200, 40, 0),
            (60, 0, 0),
        ];
        self.gradient_color(t, STOPS)
    }

    fn white_heat_colormap(&self, t: f64) -> (u8, u8, u8) {
        // White -> pale yellow -> gold -> dark red -> near black
        const STOPS: &[(u8, u8, u8)] = &[
            (255, 255, 255),
            (255, 248, 200),
            (255, 220, 80),
            (230, 120, 0),
            (120, 20, 0),
            (10, 0, 0),
        ];
        self.gradient_color(t, STOPS)
    }

    fn white_blue_colormap(&self, t: f64) -> (u8, u8, u8) {
        // White -> very light blue -> sky -> royal -> navy -> almost black
        const STOPS: &[(u8, u8, u8)] = &[
            (255, 255, 255),
            (220, 240, 255),
            (170, 210, 255),
            (100, 150, 240),
            (40, 80, 180),
            (10, 25, 60),
        ];
        self.gradient_color(t, STOPS)
    }

    fn white_viridis_colormap(&self, t: f64) -> (u8, u8, u8) {
        // White -> light yellow-green -> viridis mid -> dark purple
        const STOPS: &[(u8, u8, u8)] = &[
            (255, 255, 255),
            (232, 245, 180),
            (188, 223, 130),
            (120, 190, 110),
            (38, 130, 142),
            (68, 1, 84),
        ];
        self.gradient_color(t, STOPS)
    }

    fn white_magma_colormap(&self, t: f64) -> (u8, u8, u8) {
        // White -> light peach -> orange -> magenta -> deep purple -> black
        const STOPS: &[(u8, u8, u8)] = &[
            (255, 255, 255),
            (252, 230, 210),
            (247, 180, 120),
            (220, 100, 80),
            (150, 40, 120),
            (40, 0, 40),
            (0, 0, 0),
        ];
        self.gradient_color(t, STOPS)
    }
}

// Predefined fractal configurations
#[wasm_bindgen]
pub struct FractalPresets;

#[wasm_bindgen]
impl FractalPresets {
    /// Get Sierpinski triangle configuration
    pub fn sierpinski_triangle() -> Array {
        let vertices = Array::new();
        vertices.push(&Array::of2(&0.0.into(), &(3.0_f64.sqrt() / 2.0).into()));
        vertices.push(&Array::of2(&(-0.5).into(), &0.0.into()));
        vertices.push(&Array::of2(&0.5.into(), &0.0.into()));
        vertices
    }

    /// Get Sierpinski triangle transform parameters
    pub fn sierpinski_triangle_transforms() -> Array {
        let transforms = Array::new();
        transforms.push(&Array::of2(&0.5.into(), &0.0.into())); // 50% compression, no rotation
        transforms
    }

    /// Get Sierpinski carpet configuration (4-sided polygon with midpoints)
    pub fn sierpinski_carpet() -> Array {
        let vertices = Array::new();
        // Square vertices
        vertices.push(&Array::of2(&(-1.0).into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &1.0.into()));
        vertices.push(&Array::of2(&(-1.0).into(), &1.0.into()));
        // Midpoints (for stacking)
        vertices.push(&Array::of2(&0.0.into(), &(-1.0).into())); // bottom mid
        vertices.push(&Array::of2(&1.0.into(), &0.0.into())); // right mid
        vertices.push(&Array::of2(&0.0.into(), &1.0.into())); // top mid
        vertices.push(&Array::of2(&(-1.0).into(), &0.0.into())); // left mid
        vertices
    }

    /// Get Sierpinski carpet transform parameters
    pub fn sierpinski_carpet_transforms() -> Array {
        let transforms = Array::new();
        transforms.push(&Array::of2(&(2.0 / 3.0).into(), &0.0.into())); // 2/3 compression, no rotation
        transforms
    }

    /// Get Vicsek square configuration (4-sided polygon with center)
    pub fn vicsek_square() -> Array {
        let vertices = Array::new();
        // Square vertices
        vertices.push(&Array::of2(&(-1.0).into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &1.0.into()));
        vertices.push(&Array::of2(&(-1.0).into(), &1.0.into()));
        // Center point (for stacking)
        vertices.push(&Array::of2(&0.0.into(), &0.0.into()));
        vertices
    }

    /// Get Vicsek square transform parameters
    pub fn vicsek_square_transforms() -> Array {
        let transforms = Array::new();
        transforms.push(&Array::of2(&(2.0 / 3.0).into(), &0.0.into())); // 2/3 compression, no rotation
        transforms
    }

    /// Get T-square configuration
    pub fn t_square() -> Array {
        let vertices = Array::new();
        // Square vertices
        vertices.push(&Array::of2(&(-1.0).into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &1.0.into()));
        vertices.push(&Array::of2(&(-1.0).into(), &1.0.into()));
        vertices
    }

    /// Get T-square transform parameters
    pub fn t_square_transforms() -> Array {
        let transforms = Array::new();
        transforms.push(&Array::of2(&0.5.into(), &0.0.into())); // 50% compression, no rotation
        transforms
    }

    /// Get Techs pattern configuration
    pub fn techs_pattern() -> Array {
        let vertices = Array::new();
        // Square vertices
        vertices.push(&Array::of2(&(-1.0).into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &1.0.into()));
        vertices.push(&Array::of2(&(-1.0).into(), &1.0.into()));
        vertices
    }

    /// Get Techs pattern transform parameters
    pub fn techs_pattern_transforms() -> Array {
        let transforms = Array::new();
        transforms.push(&Array::of2(&0.5.into(), &0.0.into())); // 50% compression, no rotation
        transforms
    }

    /// Get Web pattern configuration
    pub fn web_pattern() -> Array {
        let vertices = Array::new();
        // Square vertices
        vertices.push(&Array::of2(&(-1.0).into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &(-1.0).into()));
        vertices.push(&Array::of2(&1.0.into(), &1.0.into()));
        vertices.push(&Array::of2(&(-1.0).into(), &1.0.into()));
        vertices
    }

    /// Get Web pattern transform parameters
    pub fn web_pattern_transforms() -> Array {
        let transforms = Array::new();
        transforms.push(&Array::of2(&0.5.into(), &0.1.into())); // 50% compression, 0.1 rotation
        transforms
    }

    /// Get Dragon curve IFS parameters
    pub fn dragon_curve() -> Array {
        let transforms = Array::new();

        let t1 = Array::new();
        t1.push(&0.824074.into());
        t1.push(&0.281428.into());
        t1.push(&(-0.212346).into());
        t1.push(&0.864198.into());
        t1.push(&(-1.882290).into());
        t1.push(&(-0.110607).into());
        transforms.push(&t1);

        let t2 = Array::new();
        t2.push(&0.088272.into());
        t2.push(&0.520988.into());
        t2.push(&(-0.463889).into());
        t2.push(&(-0.377778).into());
        t2.push(&0.785360.into());
        t2.push(&8.095795.into());
        transforms.push(&t2);

        transforms
    }

    /// Get Dragon curve probabilities
    pub fn dragon_curve_probs() -> Array {
        Array::of2(&0.8.into(), &0.2.into())
    }

    /// Get Barnsley fern IFS parameters
    pub fn barnsley_fern() -> Array {
        let transforms = Array::new();

        let t1 = Array::new();
        t1.push(&0.0.into());
        t1.push(&0.0.into());
        t1.push(&0.0.into());
        t1.push(&0.16.into());
        t1.push(&0.0.into());
        t1.push(&0.0.into());
        transforms.push(&t1);

        let t2 = Array::new();
        t2.push(&0.2.into());
        t2.push(&(-0.26).into());
        t2.push(&0.23.into());
        t2.push(&0.22.into());
        t2.push(&0.0.into());
        t2.push(&1.6.into());
        transforms.push(&t2);

        let t3 = Array::new();
        t3.push(&(-0.15).into());
        t3.push(&0.28.into());
        t3.push(&0.26.into());
        t3.push(&0.24.into());
        t3.push(&0.0.into());
        t3.push(&0.44.into());
        transforms.push(&t3);

        let t4 = Array::new();
        t4.push(&0.85.into());
        t4.push(&0.04.into());
        t4.push(&(-0.04).into());
        t4.push(&0.85.into());
        t4.push(&0.0.into());
        t4.push(&1.6.into());
        transforms.push(&t4);

        transforms
    }

    /// Get Barnsley fern probabilities  
    pub fn barnsley_fern_probs() -> Array {
        let probs = Array::new();
        probs.push(&0.01.into());
        probs.push(&0.07.into());
        probs.push(&0.07.into());
        probs.push(&0.85.into());
        probs
    }

    /// Get Mandelbrot-like IFS parameters
    pub fn mandelbrot_like() -> Array {
        let transforms = Array::new();

        let t1 = Array::new();
        t1.push(&0.2020.into());
        t1.push(&(-0.8050).into());
        t1.push(&(-0.3730).into());
        t1.push(&(-0.6890).into());
        t1.push(&(-0.3420).into());
        t1.push(&(-0.6530).into());
        transforms.push(&t1);

        let t2 = Array::new();
        t2.push(&0.1380.into());
        t2.push(&0.6650.into());
        t2.push(&0.6600.into());
        t2.push(&(-0.5020).into());
        t2.push(&(-0.2220).into());
        t2.push(&(-0.2770).into());
        transforms.push(&t2);

        transforms
    }

    /// Get Mandelbrot-like probabilities
    pub fn mandelbrot_like_probs() -> Array {
        Array::of2(&0.5.into(), &0.5.into())
    }

    /// Get Spiral IFS parameters  
    pub fn spiral() -> Array {
        let transforms = Array::new();

        let t1 = Array::new();
        t1.push(&0.787879.into());
        t1.push(&(-0.424242).into());
        t1.push(&0.242424.into());
        t1.push(&0.859848.into());
        t1.push(&1.758647.into());
        t1.push(&1.408065.into());
        transforms.push(&t1);

        let t2 = Array::new();
        t2.push(&(-0.121212).into());
        t2.push(&0.257576.into());
        t2.push(&0.151515.into());
        t2.push(&0.053030.into());
        t2.push(&(-6.721654).into());
        t2.push(&1.377236.into());
        transforms.push(&t2);

        let t3 = Array::new();
        t3.push(&0.181818.into());
        t3.push(&(-0.136364).into());
        t3.push(&0.090909.into());
        t3.push(&0.181818.into());
        t3.push(&6.086107.into());
        t3.push(&1.568035.into());
        transforms.push(&t3);

        transforms
    }

    /// Get Spiral probabilities
    pub fn spiral_probs() -> Array {
        let probs = Array::new();
        probs.push(&0.9.into());
        probs.push(&0.05.into());
        probs.push(&0.05.into());
        probs
    }

    /// Get Christmas tree IFS parameters
    pub fn christmas_tree() -> Array {
        let transforms = Array::new();

        let t1 = Array::new();
        t1.push(&0.0.into());
        t1.push(&(-0.5).into());
        t1.push(&0.5.into());
        t1.push(&0.0.into());
        t1.push(&0.5.into());
        t1.push(&0.0.into());
        transforms.push(&t1);

        let t2 = Array::new();
        t2.push(&0.0.into());
        t2.push(&0.5.into());
        t2.push(&(-0.5).into());
        t2.push(&0.0.into());
        t2.push(&0.5.into());
        t2.push(&0.5.into());
        transforms.push(&t2);

        let t3 = Array::new();
        t3.push(&0.5.into());
        t3.push(&0.0.into());
        t3.push(&0.0.into());
        t3.push(&0.5.into());
        t3.push(&0.25.into());
        t3.push(&0.5.into());
        transforms.push(&t3);

        transforms
    }

    /// Get Christmas tree probabilities
    pub fn christmas_tree_probs() -> Array {
        let probs = Array::new();
        probs.push(&(1.0 / 3.0).into());
        probs.push(&(1.0 / 3.0).into());
        probs.push(&(1.0 / 3.0).into());
        probs
    }

    /// Get Maple leaf IFS parameters
    pub fn maple_leaf() -> Array {
        let transforms = Array::new();

        let t1 = Array::new();
        t1.push(&0.14.into());
        t1.push(&0.01.into());
        t1.push(&0.0.into());
        t1.push(&0.51.into());
        t1.push(&(-0.08).into());
        t1.push(&(-1.31).into());
        transforms.push(&t1);

        let t2 = Array::new();
        t2.push(&0.43.into());
        t2.push(&0.52.into());
        t2.push(&(-0.45).into());
        t2.push(&0.5.into());
        t2.push(&1.49.into());
        t2.push(&(-0.75).into());
        transforms.push(&t2);

        let t3 = Array::new();
        t3.push(&0.45.into());
        t3.push(&(-0.49).into());
        t3.push(&0.47.into());
        t3.push(&0.47.into());
        t3.push(&(-1.62).into());
        t3.push(&(-0.74).into());
        transforms.push(&t3);

        let t4 = Array::new();
        t4.push(&0.49.into());
        t4.push(&0.0.into());
        t4.push(&0.0.into());
        t4.push(&0.51.into());
        t4.push(&0.02.into());
        t4.push(&1.62.into());
        transforms.push(&t4);

        transforms
    }

    /// Get Maple leaf probabilities
    pub fn maple_leaf_probs() -> Array {
        let probs = Array::new();
        probs.push(&0.25.into());
        probs.push(&0.25.into());
        probs.push(&0.25.into());
        probs.push(&0.25.into());
        probs
    }
}

// Random Chaos Finder implementation
#[wasm_bindgen]
impl FractalGenerator {
    /// Generate random arguments between -1.2 and 1.2
    fn get_random_args(&self, n: usize) -> Vec<f64> {
        let mut rng = thread_rng();
        (0..n).map(|_| 2.4 * rng.gen::<f64>() - 1.2).collect()
    }

    // (map functions now shared: map_quadratic / map_cubic)

    /// Jacobian matrix for quadratic map
    fn jacobian_quadratic(&self, args1: &[f64], args2: &[f64], x: f64, y: f64) -> [[f64; 2]; 2] {
        let (_a1, b1, c1, d1, e1, f1) =
            (args1[0], args1[1], args1[2], args1[3], args1[4], args1[5]);
        let (_a2, b2, c2, d2, e2, f2) =
            (args2[0], args2[1], args2[2], args2[3], args2[4], args2[5]);

        [
            [2.0 * c1 * x + d1 * y + b1, d1 * x + 2.0 * f1 * y + e1],
            [2.0 * c2 * x + d2 * y + b2, d2 * x + 2.0 * f2 * y + e2],
        ]
    }

    /// Jacobian matrix for cubic map
    fn jacobian_cubic(&self, args1: &[f64], args2: &[f64], x: f64, y: f64) -> [[f64; 2]; 2] {
        let (_a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) = (
            args1[0], args1[1], args1[2], args1[3], args1[4], args1[5], args1[6], args1[7],
            args1[8], args1[9],
        );
        let (_b1, b2, b3, b4, b5, b6, b7, b8, b9, b10) = (
            args2[0], args2[1], args2[2], args2[3], args2[4], args2[5], args2[6], args2[7],
            args2[8], args2[9],
        );

        [
            [
                a2 + 2.0 * a3 * x + 3.0 * a4 * (x * x) + 2.0 * a5 * y * x + a6 * y + a7 * (y * y),
                a5 * (x * x) + a6 * x + a7 * x * 2.0 * y + a8 + 2.0 * a9 * y + 3.0 * a10 * y * y,
            ],
            [
                b2 + 2.0 * b3 * x + 3.0 * b4 * (x * x) + 2.0 * b5 * y * x + b6 * y + b7 * (y * y),
                b5 * (x * x) + b6 * x + b7 * x * 2.0 * y + b8 + 2.0 * b9 * y + 3.0 * b10 * y * y,
            ],
        ]
    }

    /// Calculate fractal dimension using Kaplan-Yorke conjecture
    fn fractal_dimension(&self, max_le: f64, min_le: f64) -> f64 {
        if max_le < 0.0 {
            0.0
        } else {
            let sum = max_le + min_le;
            let (j, pos_sum) = if sum > 0.0 { (2.0, sum) } else { (1.0, max_le) };
            j + (pos_sum / min_le.abs())
        }
    }

    /// Check if point is unbounded
    fn check_unbounded(&self, x: f64, y: f64, thresh: f64) -> bool {
        x.abs() > thresh
            || y.abs() > thresh
            || x.is_nan()
            || y.is_nan()
            || x.is_infinite()
            || y.is_infinite()
    }

    /// Check if point has moved (to rule out fixed points)
    fn check_movement(&self, x: f64, y: f64, xp: f64, yp: f64) -> bool {
        (x - xp).abs() < 1e-16 || (y - yp).abs() < 1e-16
    }

    /// Matrix-vector multiplication for 2x2 matrix and 2D vector
    fn mat_vec_mult(&self, mat: [[f64; 2]; 2], vec: [f64; 2]) -> [f64; 2] {
        [
            mat[0][0] * vec[0] + mat[0][1] * vec[1],
            mat[1][0] * vec[0] + mat[1][1] * vec[1],
        ]
    }

    /// Dot product of two 2D vectors
    fn dot_product(&self, v1: [f64; 2], v2: [f64; 2]) -> f64 {
        v1[0] * v2[0] + v1[1] * v2[1]
    }

    /// Calculate determinant of 2x2 matrix
    fn determinant(&self, mat: [[f64; 2]; 2]) -> f64 {
        mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]
    }

    /// Test for chaos by computing Lyapunov exponents
    fn test_chaos(
        &self,
        args1: &[f64],
        args2: &[f64],
        n_trans: usize,
        n_test: usize,
        thresh: f64,
        is_cubic: bool,
    ) -> (f64, f64, f64) {
        let mut x = 0.05;
        let mut y = 0.05;
        let mut v1 = [1.0, 0.0];
        let mut v2 = [0.0, 1.0];

        // Discard transient points
        for _ in 0..n_trans {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(args1, xp, yp);
                y = map_cubic(args2, xp, yp);
                let m = self.jacobian_cubic(args1, args2, x, y);
                v1 = self.mat_vec_mult(m, v1);
                v2 = self.mat_vec_mult(m, v2);
            } else {
                x = map_quadratic(args1, xp, yp);
                y = map_quadratic(args2, xp, yp);
                let m = self.jacobian_quadratic(args1, args2, x, y);
                v1 = self.mat_vec_mult(m, v1);
                v2 = self.mat_vec_mult(m, v2);
            }

            // Gram-Schmidt orthogonalization
            let dot_11 = self.dot_product(v1, v1);
            let dot_12 = self.dot_product(v1, v2);
            let dot_22 = self.dot_product(v2, v2);

            v2[0] -= (dot_12 / dot_11) * v1[0];
            v2[1] -= (dot_12 / dot_11) * v1[1];

            let sqrt_dot_11 = dot_11.sqrt();
            let sqrt_dot_22 = dot_22.sqrt();
            v1[0] /= sqrt_dot_11;
            v1[1] /= sqrt_dot_11;
            v2[0] /= sqrt_dot_22;
            v2[1] /= sqrt_dot_22;
        }

        let mut max_le = 0.0;
        let mut min_le = 0.0;
        let mut c = 0.0;
        let mut count = 0;

        // Begin Lyapunov exponent estimation
        for _ in 0..n_test {
            let (xp, yp) = (x, y);
            let m = if is_cubic {
                x = map_cubic(args1, xp, yp);
                y = map_cubic(args2, xp, yp);
                self.jacobian_cubic(args1, args2, x, y)
            } else {
                x = map_quadratic(args1, xp, yp);
                y = map_quadratic(args2, xp, yp);
                self.jacobian_quadratic(args1, args2, x, y)
            };

            // Check if bounded
            if self.check_unbounded(x, y, thresh) {
                return (-1.0, -1.0, -1.0);
            }

            // Check for fixed points
            if self.check_movement(x, y, xp, yp) {
                count += 1;
                if count >= 15 {
                    return (-1.0, -1.0, -1.0);
                }
            } else if count > 0 {
                count -= 1;
            }

            v1 = self.mat_vec_mult(m, v1);
            v2 = self.mat_vec_mult(m, v2);

            let dot_11 = self.dot_product(v1, v1);
            let dot_12 = self.dot_product(v1, v2);
            let dot_22 = self.dot_product(v2, v2);

            let sqrt_dot_11 = dot_11.sqrt();
            let sqrt_dot_22 = dot_22.sqrt();

            // Gram-Schmidt orthogonalization
            v2[0] -= (dot_12 / dot_11) * v1[0];
            v2[1] -= (dot_12 / dot_11) * v1[1];

            v1[0] /= sqrt_dot_11;
            v1[1] /= sqrt_dot_11;
            v2[0] /= sqrt_dot_22;
            v2[1] /= sqrt_dot_22;

            max_le += sqrt_dot_11.ln();
            min_le += sqrt_dot_22.ln();
            c += self.determinant(m).abs().ln();
        }

        let n_test_f = n_test as f64;
        let log2 = 2.0_f64.ln();

        max_le = max_le / n_test_f / log2;
        min_le = min_le / n_test_f / log2;
        c = c / n_test_f / log2;

        (max_le, min_le, c)
    }

    /// Generate trajectory points for visualization
    fn iterate_map(
        &self,
        args1: &[f64],
        args2: &[f64],
        n_points: usize,
        is_cubic: bool,
    ) -> Vec<[f64; 2]> {
        let mut x = 0.05;
        let mut y = 0.05;
        let mut points = Vec::with_capacity(n_points);

        for _ in 0..n_points {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(args1, xp, yp);
                y = map_cubic(args2, xp, yp);
            } else {
                x = map_quadratic(args1, xp, yp);
                y = map_quadratic(args2, xp, yp);
            }
            points.push([x, y]);
        }

        points
    }

    /// Check exclusion criteria for quadratic maps
    fn exclude_quadratic(&self, max_le: f64, _min_le: f64, _c: f64, fd: f64, thresh: f64) -> bool {
        max_le <= thresh || (fd - 1.0).abs() < 0.11
    }

    /// Check exclusion criteria for cubic maps
    fn exclude_cubic(&self, max_le: f64, _min_le: f64, _c: f64, fd: f64, thresh: f64) -> bool {
        let mut exclude = max_le <= thresh;
        for i in [1.0, 2.0] {
            exclude = exclude || (fd - i).abs() < 0.11;
        }
        exclude
    }

    /// Find a random chaotic map with extended information
    #[wasm_bindgen]
    pub fn find_random_chaos_extended(
        &self,
        n_plot: usize,
        n_test: usize,
        _discard_points: usize,
        _use_alphabet: bool,
        is_cubic: bool,
    ) -> ChaoticMapResult {
        let n_trans = 1000;
        let thresh = 1e6;
        let le_thresh = 1e-4;

        let param_count = if is_cubic { 10 } else { 6 };

        // Keep searching until we find a chaotic map
        loop {
            let args1 = self.get_random_args(param_count);
            let args2 = self.get_random_args(param_count);

            let (max_le, min_le, c) =
                self.test_chaos(&args1, &args2, n_trans, n_test, thresh, is_cubic);

            if max_le == -1.0 {
                continue; // Try again if test failed
            }

            let fd = self.fractal_dimension(max_le, min_le);

            let exclude = if is_cubic {
                self.exclude_cubic(max_le, min_le, c, fd, le_thresh)
            } else {
                self.exclude_quadratic(max_le, min_le, c, fd, le_thresh)
            };

            if !exclude {
                // Found a good chaotic map!
                // Use smaller sample for discovery and store parameters for iterative generation
                let discovery_points = DEFAULT_BATCH_SIZE.min(n_plot);
                let points = self.iterate_map(&args1, &args2, discovery_points, is_cubic);

                // Convert to flat array format for points_to_rgba compatibility
                let mut result_points = Vec::with_capacity(points.len() * 2);
                for point in points {
                    result_points.extend_from_slice(&point);
                }

                console_log!(
                    "Found chaotic map! Max LE: {:.4}, Min LE: {:.4}, FD: {:.4}",
                    max_le,
                    min_le,
                    fd
                );

                return ChaoticMapResult {
                    points: result_points,
                    x_params: args1,
                    y_params: args2,
                    max_lyapunov: max_le,
                    min_lyapunov: min_le,
                    fractal_dimension: fd,
                    is_cubic,
                };
            }
        }
    }

    /// Find a random chaotic map
    #[wasm_bindgen]
    pub fn find_random_chaos(&self, n_plot: usize, n_test: usize, is_cubic: bool) -> Vec<f64> {
        let n_trans = 1000;
        let thresh = 1e6;
        let le_thresh = 1e-4;

        let param_count = if is_cubic { 10 } else { 6 };

        // Keep searching until we find a chaotic map
        loop {
            let args1 = self.get_random_args(param_count);
            let args2 = self.get_random_args(param_count);

            let (max_le, min_le, c) =
                self.test_chaos(&args1, &args2, n_trans, n_test, thresh, is_cubic);

            if max_le == -1.0 {
                continue; // Try again if test failed
            }

            let fd = self.fractal_dimension(max_le, min_le);

            let exclude = if is_cubic {
                self.exclude_cubic(max_le, min_le, c, fd, le_thresh)
            } else {
                self.exclude_quadratic(max_le, min_le, c, fd, le_thresh)
            };

            if !exclude {
                // Found a good chaotic map!
                // Use smaller sample for discovery and store parameters for iterative generation
                let discovery_points = DEFAULT_BATCH_SIZE.min(n_plot);
                let points = self.iterate_map(&args1, &args2, discovery_points, is_cubic);

                // Convert to flat array format for points_to_rgba compatibility
                let mut result = Vec::with_capacity(points.len() * 2);
                for point in points {
                    result.push(point[0]);
                    result.push(point[1]);
                }

                console_log!(
                    "Found chaotic map! Max LE: {:.4}, Min LE: {:.4}, FD: {:.4}",
                    max_le,
                    min_le,
                    fd
                );
                return result;
            }
        }
    }

    /// Generate points from given chaotic map parameters
    #[wasm_bindgen]
    pub fn generate_chaotic_map_points(
        &self,
        x_params: &[f64],
        y_params: &[f64],
        n_points: usize,
        is_cubic: bool,
    ) -> Vec<f64> {
        let points = self.iterate_map(x_params, y_params, n_points, is_cubic);

        // Flatten the points from Vec<[f64; 2]> to Vec<f64>
        let mut result = Vec::with_capacity(points.len() * 2);
        for point in points {
            result.push(point[0]);
            result.push(point[1]);
        }

        result
    }

    /// Generate points from given chaotic map parameters in batches
    /// Returns density grid that can be merged with other batches
    #[wasm_bindgen]
    #[allow(clippy::too_many_arguments)]
    pub fn generate_chaotic_map_batch_to_density(
        &self,
        x_params: &[f64],
        y_params: &[f64],
        n_points: usize,
        is_cubic: bool,
        width: usize,
        height: usize,
        min_x: f64,
        max_x: f64,
        min_y: f64,
        max_y: f64,
        start_iteration: usize,
    ) -> Vec<u32> {
        // Generate points using the same iteration logic but starting from a specific iteration
        let mut x = 0.05;
        let mut y = 0.05;

        // Advance to the starting iteration (skip iterations to maintain continuity)
        for _ in 0..start_iteration {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(x_params, xp, yp);
                y = map_cubic(y_params, xp, yp);
            } else {
                x = map_quadratic(x_params, xp, yp);
                y = map_quadratic(y_params, xp, yp);
            }
        }

        // Create density grid
        let mut density = vec![0u32; width * height];

        // Generate the batch of points and directly add to density grid
        for _ in 0..n_points {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(x_params, xp, yp);
                y = map_cubic(y_params, xp, yp);
            } else {
                x = map_quadratic(x_params, xp, yp);
                y = map_quadratic(y_params, xp, yp);
            }

            // Add point to density grid
            let pixel_x = ((x - min_x) / (max_x - min_x) * width as f64) as usize;
            let pixel_y = ((y - min_y) / (max_y - min_y) * height as f64) as usize;

            if pixel_x < width && pixel_y < height {
                density[pixel_y * width + pixel_x] += 1;
            }
        }

        density
    }

    /// Generate points from given chaotic map parameters in batches with state continuity
    /// Returns density grid and final state for efficient batch processing
    #[wasm_bindgen]
    #[allow(clippy::too_many_arguments)]
    pub fn generate_chaotic_map_batch_with_state(
        &self,
        x_params: &[f64],
        y_params: &[f64],
        n_points: usize,
        is_cubic: bool,
        width: usize,
        height: usize,
        min_x: f64,
        max_x: f64,
        min_y: f64,
        max_y: f64,
        start_x: f64,
        start_y: f64,
    ) -> Vec<f64> {
        // Start from the provided state
        let mut x = start_x;
        let mut y = start_y;

        // Create density grid
        let mut density = vec![0u32; width * height];

        // Track actual bounds encountered for debugging
        let mut actual_min_x = x;
        let mut actual_max_x = x;
        let mut actual_min_y = y;
        let mut actual_max_y = y;
        let mut points_outside_bounds = 0;

        // Generate the batch of points and directly add to density grid
        for _ in 0..n_points {
            let (xp, yp) = (x, y);
            if is_cubic {
                x = map_cubic(x_params, xp, yp);
                y = map_cubic(y_params, xp, yp);
            } else {
                x = map_quadratic(x_params, xp, yp);
                y = map_quadratic(y_params, xp, yp);
            }

            // Update actual bounds encountered
            actual_min_x = actual_min_x.min(x);
            actual_max_x = actual_max_x.max(x);
            actual_min_y = actual_min_y.min(y);
            actual_max_y = actual_max_y.max(y);

            // Add point to density grid if within bounds
            if x >= min_x && x <= max_x && y >= min_y && y <= max_y {
                let pixel_x = ((x - min_x) / (max_x - min_x) * width as f64) as usize;
                let pixel_y = ((y - min_y) / (max_y - min_y) * height as f64) as usize;

                if pixel_x < width && pixel_y < height {
                    density[pixel_y * width + pixel_x] += 1;
                }
            } else {
                points_outside_bounds += 1;
            }
        }

        // Log bounds information for debugging
        if points_outside_bounds > 0 {
            console_log!(
                "Batch bounds info: {} points outside bounds. Actual range: x[{:.3}, {:.3}], y[{:.3}, {:.3}] vs bounds x[{:.3}, {:.3}], y[{:.3}, {:.3}]",
                points_outside_bounds, actual_min_x, actual_max_x, actual_min_y, actual_max_y, min_x, max_x, min_y, max_y
            );
        }

        // Return both density grid (as f64) and final state
        let mut result = Vec::with_capacity(density.len() + 6);

        // First two elements are the final x, y state
        result.push(x);
        result.push(y);

        // Next four elements are the actual bounds encountered
        result.push(actual_min_x);
        result.push(actual_max_x);
        result.push(actual_min_y);
        result.push(actual_max_y);

        // Rest are the density values converted to f64
        for d in density {
            result.push(d as f64);
        }

        result
    }
}

/// Generate just the trajectory points for streaming processing
/// Returns alternating [x1, y1, x2, y2, ...] coordinates and final state
#[wasm_bindgen]
pub fn generate_trajectory_points(
    x_params: &[f64],
    y_params: &[f64],
    n_points: usize,
    is_cubic: bool,
    start_x: f64,
    start_y: f64,
) -> Vec<f64> {
    let mut x = start_x;
    let mut y = start_y;
    let mut result = Vec::with_capacity(n_points * 2 + 2); // +2 for final state
    
    // Generate n_points and collect coordinates
    for _ in 0..n_points {
        let (xp, yp) = (x, y);
        if is_cubic {
            x = map_cubic(x_params, xp, yp);
            y = map_cubic(y_params, xp, yp);
        } else {
            x = map_quadratic(x_params, xp, yp);
            y = map_quadratic(y_params, xp, yp);
        }
        result.push(x);
        result.push(y);
    }
    
    // Append final state at the end
    result.push(x);
    result.push(y);
    
    result
}

/// Standalone function to generate chaotic map points
/// This is called from JavaScript as generator.generate_chaotic_map_points()
#[wasm_bindgen]
pub fn generate_chaotic_map_points(
    chaos_type: &str,
    params: Vec<f64>,
    n_points: usize,
    discard_points: usize,
) -> Vec<f64> {
    let generator = FractalGenerator::new();

    // Determine if it's cubic based on parameter count
    let is_cubic = params.len() > 6;

    // Split parameters into x and y components
    let param_count = if is_cubic { 10 } else { 6 };
    if params.len() != param_count * 2 {
        console_log!(
            "Error: Invalid parameter count for {}: expected {}, got {}",
            chaos_type,
            param_count * 2,
            params.len()
        );
        return Vec::new();
    }

    let x_params = &params[0..param_count];
    let y_params = &params[param_count..];

    // Generate points
    let points = generator.iterate_map(x_params, y_params, n_points + discard_points, is_cubic);

    // Discard initial points and flatten the result
    let mut result = Vec::with_capacity((n_points) * 2);
    for point in points.iter().skip(discard_points) {
        result.push(point[0]);
        result.push(point[1]);
    }

    result
}
