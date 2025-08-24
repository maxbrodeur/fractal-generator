use serde::{Deserialize, Serialize};
use std::f64::consts::PI;
use rand::prelude::*;
use rayon::prelude::*;

#[path = "fractals.rs"]
mod fractals;

use fractals::{FractalGenerator, Point2D, Transform, AffineTransform, Rule, ColorScheme};

/// Simple CLI demonstration of the desktop fractal capabilities
fn main() {
    println!("🖥️  Fractal Generator Desktop - CLI Demo");
    println!("=========================================");
    println!();

    let mut generator = FractalGenerator::new();

    // Demo 1: High-iteration Chaos Game (Sierpinski Triangle)
    println!("🔺 Generating Sierpinski Triangle (1M iterations)...");
    let vertices = vec![
        Point2D::new(0.0, 0.0),
        Point2D::new(1.0, 0.0),
        Point2D::new(0.5, (3.0_f64).sqrt() / 2.0),
    ];
    
    let transforms = vec![Transform::new(0.5, 0.0)];
    let mut rule = Rule::new(0, 0, false);
    
    let start_time = std::time::Instant::now();
    let points = generator.chaos_game(vertices, 0.5, 0.25, 1_000_000, transforms, &mut rule);
    let duration = start_time.elapsed();
    
    println!("✅ Generated {} points in {:.2}ms", points.len(), duration.as_millis());
    println!("   Performance: {:.0} points/second", points.len() as f64 / duration.as_secs_f64());
    println!();

    // Demo 2: IFS Fractal (Barnsley Fern)
    println!("🌿 Generating Barnsley Fern (500K iterations)...");
    let transforms = vec![
        AffineTransform::new(0.0, 0.0, 0.0, 0.16, 0.0, 0.0),
        AffineTransform::new(0.85, 0.04, -0.04, 0.85, 0.0, 1.6),
        AffineTransform::new(0.2, -0.26, 0.23, 0.22, 0.0, 1.6),
        AffineTransform::new(-0.15, 0.28, 0.26, 0.24, 0.0, 0.44),
    ];
    let probabilities = vec![0.01, 0.85, 0.07, 0.07];
    
    let start_time = std::time::Instant::now();
    let points = generator.ifs_fractal(Point2D::new(0.0, 0.0), 500_000, transforms, probabilities);
    let duration = start_time.elapsed();
    
    println!("✅ Generated {} points in {:.2}ms", points.len(), duration.as_millis());
    println!("   Performance: {:.0} points/second", points.len() as f64 / duration.as_secs_f64());
    println!();

    // Demo 3: High-resolution Mandelbrot Set
    println!("🌀 Generating Mandelbrot Set (2048x2048, 1000 iterations)...");
    let start_time = std::time::Instant::now();
    let result = generator.mandelbrot_set(2048, 2048, 1000, -2.5, 1.0, -1.25, 1.25);
    let duration = start_time.elapsed();
    
    println!("✅ Generated {}x{} Mandelbrot in {:.2}ms", 2048, 2048, duration.as_millis());
    println!("   Performance: {:.0} pixels/second", (2048 * 2048) as f64 / duration.as_secs_f64());
    println!("   Total pixels: {}", result.len());
    println!();

    // Demo 4: Color mapping performance
    println!("🎨 Testing color mapping performance...");
    let test_points: Vec<Point2D> = (0..100_000).map(|i| {
        Point2D::new(
            (i as f64 / 100_000.0) * 2.0 - 1.0,
            ((i * 17) as f64 / 100_000.0) * 2.0 - 1.0,
        )
    }).collect();
    
    let start_time = std::time::Instant::now();
    let rgba_data = generator.points_to_rgba(&test_points, 1024, 1024, ColorScheme::Inferno);
    let duration = start_time.elapsed();
    
    println!("✅ Processed {} points to RGBA in {:.2}ms", test_points.len(), duration.as_millis());
    println!("   Output size: {} bytes", rgba_data.len());
    println!();

    // System capabilities
    println!("💻 Desktop Capabilities:");
    println!("   Available CPU cores: {}", num_cpus::get());
    println!("   Max recommended canvas: 16,384px");
    println!("   Max recommended iterations: 100,000,000");
    println!("   Parallel processing: ✅ Enabled");
    println!();

    println!("🚀 Desktop vs Browser Comparison:");
    println!("   Canvas size limit: 16,384px (vs 8,192px browser)");
    println!("   Iteration limit: 100M+ (vs 10M browser)");
    println!("   Memory limit: System RAM (vs browser heap)");
    println!("   CPU utilization: All cores (vs single-threaded)");
    println!();

    println!("✨ Desktop fractal generation complete!");
    println!("💡 For GUI version, run: cd src-tauri && cargo run");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chaos_game_performance() {
        let mut generator = FractalGenerator::new();
        let vertices = vec![
            Point2D::new(0.0, 0.0),
            Point2D::new(1.0, 0.0),
            Point2D::new(0.5, 0.866),
        ];
        let transforms = vec![Transform::new(0.5, 0.0)];
        let mut rule = Rule::new(0, 0, false);
        
        let start = std::time::Instant::now();
        let points = generator.chaos_game(vertices, 0.5, 0.25, 10_000, transforms, &mut rule);
        let duration = start.elapsed();
        
        assert_eq!(points.len(), 10_000);
        assert!(duration.as_millis() < 100); // Should be fast
    }

    #[test]
    fn test_mandelbrot_performance() {
        let generator = FractalGenerator::new();
        
        let start = std::time::Instant::now();
        let result = generator.mandelbrot_set(256, 256, 100, -2.0, 1.0, -1.0, 1.0);
        let duration = start.elapsed();
        
        assert_eq!(result.len(), 256 * 256);
        assert!(duration.as_millis() < 1000); // Should complete in reasonable time
    }

    #[test]
    fn test_color_mapping() {
        let generator = FractalGenerator::new();
        let points = vec![
            Point2D::new(0.0, 0.0),
            Point2D::new(1.0, 1.0),
            Point2D::new(-1.0, -1.0),
        ];
        
        let rgba = generator.points_to_rgba(&points, 100, 100, ColorScheme::Inferno);
        assert_eq!(rgba.len(), 100 * 100 * 4); // RGBA format
    }
}