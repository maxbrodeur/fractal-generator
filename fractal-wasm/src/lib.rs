use wasm_bindgen::prelude::*;
use js_sys::Array;
use rand::prelude::*;
use std::f64::consts::PI;

// Console logging for debugging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
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
            ((index - reference) % vertex_count == self.offset) ||
            ((-index + reference) % vertex_count == self.offset)
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
        Point3D { x: 0.0, y: 0.0, z: 0.0 }
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
        Transform { compression, rotation }
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
#[derive(Clone, Copy)]
pub enum ColorScheme {
    Fire,
    Jet,
    Prism,
    Turbo,
    ColorWheel,
    GnuPlot,
    Bmy,
}

/// Main fractal generator struct
#[wasm_bindgen]
pub struct FractalGenerator {
    rng: ThreadRng,
}

#[wasm_bindgen]
impl FractalGenerator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> FractalGenerator {
        FractalGenerator {
            rng: thread_rng(),
        }
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
            
        let probabilities: Vec<f64> = probabilities_js
            .iter()
            .filter_map(|p| p.as_f64())
            .collect();
        
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
            rgba.push(255);     // A
        }
        
        rgba
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
        let min_x = point_pairs.iter().map(|p| p.x).fold(f64::INFINITY, f64::min) - 0.2;
        let max_x = point_pairs.iter().map(|p| p.x).fold(f64::NEG_INFINITY, f64::max) + 0.2;
        let min_y = point_pairs.iter().map(|p| p.y).fold(f64::INFINITY, f64::min) - 0.2;
        let max_y = point_pairs.iter().map(|p| p.y).fold(f64::NEG_INFINITY, f64::max) + 0.2;
        
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
        
        for i in 0..density.len() {
            let normalized = if max_density > 0.0 {
                (density[i] as f64 / max_density).ln_1p() / (max_density.ln_1p())
            } else {
                0.0
            };
            
            let color = self.apply_color_scheme(normalized, color_scheme);
            
            rgba[i * 4] = color.0;     // R
            rgba[i * 4 + 1] = color.1; // G
            rgba[i * 4 + 2] = color.2; // B
            rgba[i * 4 + 3] = 255;     // A
        }
        
        rgba
    }
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
        let clamped = normalized.clamp(0.0, 1.0);
        
        match scheme {
            ColorScheme::Fire => self.fire_colormap(clamped),
            ColorScheme::Jet => self.jet_colormap(clamped),
            ColorScheme::Prism => self.prism_colormap(clamped),
            ColorScheme::Turbo => self.turbo_colormap(clamped),
            ColorScheme::ColorWheel => self.colorwheel_colormap(clamped),
            ColorScheme::GnuPlot => self.gnuplot_colormap(clamped),
            ColorScheme::Bmy => self.bmy_colormap(clamped),
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
        let r = (34.61 + t * (1172.33 - t * (10793.56 - t * (4193.5 - t * 1667.54)))).clamp(0.0, 255.0);
        let g = (23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * 1073.77)))).clamp(0.0, 255.0);
        let b = (27.2 + t * (3211.1 - t * (15327.97 - t * (27814.0 - t * 22569.18)))).clamp(0.0, 255.0);
        
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
        let r = if t < 0.25 { 0.0 } else if t < 0.5 { (t - 0.25) * 4.0 } else { 1.0 };
        let g = if t < 0.25 { t * 4.0 } else if t < 0.75 { 1.0 } else { 1.0 - (t - 0.75) * 4.0 };
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
        probs.push(&(1.0/3.0).into());
        probs.push(&(1.0/3.0).into());
        probs.push(&(1.0/3.0).into());
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
