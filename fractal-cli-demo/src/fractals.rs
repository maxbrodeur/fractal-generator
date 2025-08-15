use serde::{Deserialize, Serialize};
use std::f64::consts::PI;
use rand::prelude::*;
use rayon::prelude::*;

/// Result structure for chaotic map with parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChaoticMapResult {
    pub points: Vec<f64>,
    pub x_params: Vec<f64>,
    pub y_params: Vec<f64>,
    pub max_lyapunov: f64,
    pub min_lyapunov: f64,
    pub fractal_dimension: f64,
    pub is_cubic: bool,
}

/// Color scheme enumeration
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ColorScheme {
    Magma = 0,
    Plasma = 1,
    Inferno = 2,
    Viridis = 3,
    Cividis = 4,
    GnuPlot = 5,
    BMY = 6,
}

impl From<i32> for ColorScheme {
    fn from(value: i32) -> Self {
        match value {
            0 => ColorScheme::Magma,
            1 => ColorScheme::Plasma,
            2 => ColorScheme::Inferno,
            3 => ColorScheme::Viridis,
            4 => ColorScheme::Cividis,
            5 => ColorScheme::GnuPlot,
            6 => ColorScheme::BMY,
            _ => ColorScheme::Inferno,
        }
    }
}

/// Fractal presets enumeration
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum FractalPresets {
    Sierpinski = 0,
    Pentagon = 1,
    Hexagon = 2,
    Square = 3,
    Techs = 4,
    Dragon = 5,
    Barnsley = 6,
    Tree = 7,
    Spiral = 8,
}

/// Rule structure for chaos game constraints
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Rule {
    pub length: usize,
    pub offset: i32,
    pub symmetry: bool,
    pub sign: i32,
    heap: Vec<i32>,
}

impl Rule {
    pub fn new(length: usize, offset: i32, symmetry: bool) -> Self {
        Rule {
            length,
            offset,
            symmetry,
            sign: 1,
            heap: vec![-1; length],
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
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
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

/// Transformation parameters for fractal generation
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
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

/// Affine transformation structure for IFS fractals
#[derive(Clone, Debug, Serialize, Deserialize)]
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

    pub fn apply_regular(&self, point: Point2D) -> Point2D {
        Point2D::new(
            self.a * point.x + self.b * point.y + self.e,
            self.c * point.x + self.d * point.y + self.f,
        )
    }
}

/// Main fractal generator structure
#[derive(Debug)]
pub struct FractalGenerator;

impl Default for FractalGenerator {
    fn default() -> Self {
        Self::new()
    }
}

impl FractalGenerator {
    pub fn new() -> Self {
        FractalGenerator
    }

    /// Generate chaos game fractal with enhanced desktop performance
    pub fn chaos_game(
        &self,
        vertices: Vec<Point2D>,
        x0: f64,
        y0: f64,
        iterations: usize,
        transforms: Vec<Transform>,
        rule: &mut Rule,
    ) -> Vec<Point2D> {
        self.chaos_game_internal(vertices, x0, y0, iterations, transforms, rule)
    }

    /// Generate IFS fractal with enhanced desktop performance
    pub fn ifs_fractal(
        &self,
        start: Point2D,
        iterations: usize,
        transforms: Vec<AffineTransform>,
        probabilities: Vec<f64>,
    ) -> Vec<Point2D> {
        self.ifs_fractal_internal(start, iterations, transforms, probabilities, false)
    }

    /// Generate Mandelbrot set with desktop optimization
    pub fn mandelbrot_set(
        &self,
        width: usize,
        height: usize,
        max_iterations: usize,
        x_min: f64,
        x_max: f64,
        y_min: f64,
        y_max: f64,
    ) -> Vec<u32> {
        let dx = (x_max - x_min) / width as f64;
        let dy = (y_max - y_min) / height as f64;

        // Use Rayon for parallel computation on desktop
        (0..height * width)
            .into_par_iter()
            .map(|i| {
                let row = i / width;
                let col = i % width;
                let x = x_min + col as f64 * dx;
                let y = y_min + row as f64 * dy;
                self.mandelbrot_point(x, y, max_iterations)
            })
            .collect()
    }

    /// Generate Julia set with desktop optimization
    pub fn julia_set(
        &self,
        width: usize,
        height: usize,
        max_iterations: usize,
        x_min: f64,
        x_max: f64,
        y_min: f64,
        y_max: f64,
        c_real: f64,
        c_imag: f64,
    ) -> Vec<u32> {
        let dx = (x_max - x_min) / width as f64;
        let dy = (y_max - y_min) / height as f64;

        // Use Rayon for parallel computation on desktop
        (0..height * width)
            .into_par_iter()
            .map(|i| {
                let row = i / width;
                let col = i % width;
                let x = x_min + col as f64 * dx;
                let y = y_min + row as f64 * dy;
                self.julia_point(x, y, c_real, c_imag, max_iterations)
            })
            .collect()
    }

    /// Convert points to RGBA with enhanced color mapping
    pub fn points_to_rgba(
        &self,
        points: &[Point2D],
        width: usize,
        height: usize,
        color_scheme: ColorScheme,
    ) -> Vec<u8> {
        if points.is_empty() {
            return vec![0; width * height * 4];
        }

        // Find bounds
        let mut x_min = points[0].x;
        let mut x_max = points[0].x;
        let mut y_min = points[0].y;
        let mut y_max = points[0].y;

        for point in points {
            x_min = x_min.min(point.x);
            x_max = x_max.max(point.x);
            y_min = y_min.min(point.y);
            y_max = y_max.max(point.y);
        }

        let x_range = x_max - x_min;
        let y_range = y_max - y_min;

        if x_range == 0.0 || y_range == 0.0 {
            return vec![0; width * height * 4];
        }

        let mut image = vec![0u8; width * height * 4];
        let mut density = vec![0u32; width * height];

        // Count point density
        for point in points {
            let px = ((point.x - x_min) / x_range * (width - 1) as f64) as usize;
            let py = ((point.y - y_min) / y_range * (height - 1) as f64) as usize;

            if px < width && py < height {
                density[py * width + px] += 1;
            }
        }

        // Find max density for normalization
        let max_density = *density.iter().max().unwrap_or(&1) as f64;

        // Apply color mapping with parallel processing
        image
            .par_chunks_mut(4)
            .enumerate()
            .for_each(|(i, pixel)| {
                let count = density[i] as f64;
                if count > 0.0 {
                    let normalized = (count / max_density).ln() / max_density.ln();
                    let (r, g, b) = self.apply_color_scheme(normalized, color_scheme);
                    pixel[0] = r;
                    pixel[1] = g;
                    pixel[2] = b;
                    pixel[3] = 255;
                } else {
                    pixel[0] = 0;
                    pixel[1] = 0;
                    pixel[2] = 0;
                    pixel[3] = 255;
                }
            });

        image
    }

    // Private helper methods
    fn chaos_game_internal(
        &self,
        vertices: Vec<Point2D>,
        x0: f64,
        y0: f64,
        iterations: usize,
        transforms: Vec<Transform>,
        rule: &mut Rule,
    ) -> Vec<Point2D> {
        let mut points = Vec::with_capacity(iterations);
        let mut current = Point2D::new(x0, y0);
        let vertex_count = vertices.len();

        for _ in 0..iterations {
            let vertex_index = self.select_vertex(vertex_count, rule);
            let vertex = vertices[vertex_index];
            let transform = if transforms.is_empty() {
                Transform::new(0.5, 0.0)
            } else {
                transforms[0]
            };

            // Apply transformation
            current = self.apply_chaos_transform(current, vertex, transform);
            points.push(current);
        }

        points
    }

    fn ifs_fractal_internal(
        &self,
        start: Point2D,
        iterations: usize,
        transforms: Vec<AffineTransform>,
        probabilities: Vec<f64>,
        _use_borke_mode: bool,
    ) -> Vec<Point2D> {
        let mut points = Vec::with_capacity(iterations);
        let mut current = start;
        let mut rng = thread_rng();

        // Normalize probabilities
        let total: f64 = probabilities.iter().sum();
        let normalized_probs: Vec<f64> = if total > 0.0 {
            probabilities.iter().map(|p| p / total).collect()
        } else {
            vec![1.0 / transforms.len() as f64; transforms.len()]
        };

        for _ in 0..iterations {
            let mut cumulative = 0.0;
            let random_val = rng.gen::<f64>();

            let mut selected_transform = &transforms[0];
            for (i, &prob) in normalized_probs.iter().enumerate() {
                cumulative += prob;
                if random_val <= cumulative {
                    selected_transform = &transforms[i];
                    break;
                }
            }

            current = selected_transform.apply_regular(current);
            points.push(current);
        }

        points
    }

    fn select_vertex(&self, vertex_count: usize, rule: &mut Rule) -> usize {
        let mut rng = thread_rng();
        loop {
            let index = rng.gen_range(0..vertex_count) as i32;
            if !rule.check(vertex_count as i32, index) {
                rule.add(index);
                return index as usize;
            }
        }
    }

    fn apply_chaos_transform(
        &self,
        current: Point2D,
        vertex: Point2D,
        transform: Transform,
    ) -> Point2D {
        let cos_angle = transform.rotation.cos();
        let sin_angle = transform.rotation.sin();

        let dx = vertex.x - current.x;
        let dy = vertex.y - current.y;

        let rotated_dx = dx * cos_angle - dy * sin_angle;
        let rotated_dy = dx * sin_angle + dy * cos_angle;

        Point2D::new(
            current.x + rotated_dx * transform.compression,
            current.y + rotated_dy * transform.compression,
        )
    }

    fn mandelbrot_point(&self, x: f64, y: f64, max_iterations: usize) -> u32 {
        let mut zx = 0.0;
        let mut zy = 0.0;
        let mut iteration = 0;

        while zx * zx + zy * zy <= 4.0 && iteration < max_iterations {
            let new_zx = zx * zx - zy * zy + x;
            zy = 2.0 * zx * zy + y;
            zx = new_zx;
            iteration += 1;
        }

        iteration as u32
    }

    fn julia_point(&self, x: f64, y: f64, c_real: f64, c_imag: f64, max_iterations: usize) -> u32 {
        let mut zx = x;
        let mut zy = y;
        let mut iteration = 0;

        while zx * zx + zy * zy <= 4.0 && iteration < max_iterations {
            let new_zx = zx * zx - zy * zy + c_real;
            zy = 2.0 * zx * zy + c_imag;
            zx = new_zx;
            iteration += 1;
        }

        iteration as u32
    }

    fn apply_color_scheme(&self, normalized: f64, scheme: ColorScheme) -> (u8, u8, u8) {
        let t = normalized.clamp(0.0, 1.0);
        
        match scheme {
            ColorScheme::Magma => self.magma_colormap(t),
            ColorScheme::Plasma => self.plasma_colormap(t),
            ColorScheme::Inferno => self.inferno_colormap(t),
            ColorScheme::Viridis => self.viridis_colormap(t),
            ColorScheme::Cividis => self.cividis_colormap(t),
            ColorScheme::GnuPlot => self.gnuplot_colormap(t),
            ColorScheme::BMY => self.bmy_colormap(t),
        }
    }

    fn magma_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 0, 4),
            (28, 16, 68),
            (79, 18, 123),
            (129, 37, 129),
            (181, 54, 122),
            (229, 80, 100),
            (251, 135, 97),
            (254, 194, 135),
            (252, 253, 191),
        ];
        self.gradient_color(t, STOPS)
    }

    fn plasma_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (13, 8, 135),
            (75, 3, 161),
            (125, 3, 168),
            (166, 13, 165),
            (203, 35, 149),
            (230, 62, 126),
            (248, 95, 105),
            (252, 136, 97),
            (248, 179, 102),
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
            (72, 35, 116),
            (64, 67, 135),
            (52, 94, 141),
            (41, 120, 142),
            (32, 144, 140),
            (34, 167, 132),
            (68, 190, 112),
            (121, 209, 81),
            (189, 222, 38),
            (253, 231, 37),
        ];
        self.gradient_color(t, STOPS)
    }

    fn cividis_colormap(&self, t: f64) -> (u8, u8, u8) {
        const STOPS: &[(u8, u8, u8)] = &[
            (0, 32, 76),
            (0, 42, 102),
            (0, 52, 110),
            (39, 63, 108),
            (60, 74, 107),
            (81, 84, 104),
            (104, 95, 101),
            (127, 105, 97),
            (152, 115, 94),
            (177, 125, 93),
            (204, 136, 96),
            (231, 148, 101),
            (254, 162, 109),
        ];
        self.gradient_color(t, STOPS)
    }

    fn gnuplot_colormap(&self, t: f64) -> (u8, u8, u8) {
        let r = (255.0 * (0.5 + 0.5 * (2.0 * PI * t).sin())).clamp(0.0, 255.0) as u8;
        let g = (255.0 * (0.5 + 0.5 * (2.0 * PI * t + 2.0 * PI / 3.0).sin())).clamp(0.0, 255.0) as u8;
        let b = (255.0 * (0.5 + 0.5 * (2.0 * PI * t + 4.0 * PI / 3.0).sin())).clamp(0.0, 255.0) as u8;
        (r, g, b)
    }

    fn bmy_colormap(&self, t: f64) -> (u8, u8, u8) {
        let blue_region = 0.25;
        let magenta_region = 0.75;

        if t <= blue_region {
            let local_t = t / blue_region;
            let blue = (255.0 * local_t).clamp(0.0, 255.0) as u8;
            (0, 0, blue)
        } else if t <= magenta_region {
            let local_t = (t - blue_region) / (magenta_region - blue_region);
            let red = (255.0 * local_t).clamp(0.0, 255.0) as u8;
            (red, 0, 255)
        } else {
            let local_t = (t - magenta_region) / (1.0 - magenta_region);
            let yellow_component = (255.0 * local_t).clamp(0.0, 255.0) as u8;
            (255, yellow_component, 255 - yellow_component)
        }
    }

    fn gradient_color(&self, t: f64, stops: &[(u8, u8, u8)]) -> (u8, u8, u8) {
        if stops.is_empty() {
            return (0, 0, 0);
        }
        if stops.len() == 1 {
            return stops[0];
        }

        let segment_size = 1.0 / (stops.len() - 1) as f64;
        let segment = (t / segment_size).floor() as usize;

        if segment >= stops.len() - 1 {
            return stops[stops.len() - 1];
        }

        let local_t = (t - segment as f64 * segment_size) / segment_size;
        let color1 = stops[segment];
        let color2 = stops[segment + 1];

        let r = (color1.0 as f64 + (color2.0 as f64 - color1.0 as f64) * local_t).round() as u8;
        let g = (color1.1 as f64 + (color2.1 as f64 - color1.1 as f64) * local_t).round() as u8;
        let b = (color1.2 as f64 + (color2.2 as f64 - color1.2 as f64) * local_t).round() as u8;

        (r, g, b)
    }
}