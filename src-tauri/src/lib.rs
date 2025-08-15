// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod fractals;

use fractals::{
    FractalGenerator, Point2D, Transform, AffineTransform, Rule, 
    ColorScheme, ChaoticMapResult
};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// Application state to maintain fractal generator instance
struct AppState {
    generator: Mutex<FractalGenerator>,
}

// Request/Response structures for Tauri commands
#[derive(Serialize, Deserialize)]
struct ChaosGameParams {
    vertices: Vec<Point2D>,
    x0: f64,
    y0: f64,
    iterations: usize,
    transforms: Vec<Transform>,
    rule: Rule,
}

#[derive(Serialize, Deserialize)]
struct IFSParams {
    start: Point2D,
    iterations: usize,
    transforms: Vec<AffineTransform>,
    probabilities: Vec<f64>,
}

#[derive(Serialize, Deserialize)]
struct MandelbrotParams {
    width: usize,
    height: usize,
    max_iterations: usize,
    x_min: f64,
    x_max: f64,
    y_min: f64,
    y_max: f64,
}

#[derive(Serialize, Deserialize)]
struct JuliaParams {
    width: usize,
    height: usize,
    max_iterations: usize,
    x_min: f64,
    x_max: f64,
    y_min: f64,
    y_max: f64,
    c_real: f64,
    c_imag: f64,
}

#[derive(Serialize, Deserialize)]
struct PointsToRgbaParams {
    points: Vec<Point2D>,
    width: usize,
    height: usize,
    color_scheme: i32,
}

// Tauri command for generating chaos game fractals
#[tauri::command]
async fn generate_chaos_game(
    state: State<'_, AppState>,
    params: ChaosGameParams,
) -> Result<Vec<Point2D>, String> {
    let mut generator = state.generator.lock().map_err(|e| e.to_string())?;
    let mut rule = params.rule;
    
    Ok(generator.chaos_game(
        params.vertices,
        params.x0,
        params.y0,
        params.iterations,
        params.transforms,
        &mut rule,
    ))
}

// Tauri command for generating IFS fractals  
#[tauri::command]
async fn generate_ifs_fractal(
    state: State<'_, AppState>,
    params: IFSParams,
) -> Result<Vec<Point2D>, String> {
    let mut generator = state.generator.lock().map_err(|e| e.to_string())?;
    
    Ok(generator.ifs_fractal(
        params.start,
        params.iterations,
        params.transforms,
        params.probabilities,
    ))
}

// Tauri command for generating Mandelbrot set
#[tauri::command]
async fn generate_mandelbrot(
    state: State<'_, AppState>,
    params: MandelbrotParams,
) -> Result<Vec<u32>, String> {
    let generator = state.generator.lock().map_err(|e| e.to_string())?;
    
    Ok(generator.mandelbrot_set(
        params.width,
        params.height,
        params.max_iterations,
        params.x_min,
        params.x_max,
        params.y_min,
        params.y_max,
    ))
}

// Tauri command for generating Julia set
#[tauri::command]
async fn generate_julia(
    state: State<'_, AppState>,
    params: JuliaParams,
) -> Result<Vec<u32>, String> {
    let generator = state.generator.lock().map_err(|e| e.to_string())?;
    
    Ok(generator.julia_set(
        params.width,
        params.height,
        params.max_iterations,
        params.x_min,
        params.x_max,
        params.y_min,
        params.y_max,
        params.c_real,
        params.c_imag,
    ))
}

// Tauri command for converting points to RGBA
#[tauri::command]
async fn points_to_rgba(
    state: State<'_, AppState>,
    params: PointsToRgbaParams,
) -> Result<Vec<u8>, String> {
    let generator = state.generator.lock().map_err(|e| e.to_string())?;
    let color_scheme = ColorScheme::from(params.color_scheme);
    
    Ok(generator.points_to_rgba(
        &params.points,
        params.width,
        params.height,
        color_scheme,
    ))
}

// Tauri command to get system capabilities for desktop optimization
#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    let info = serde_json::json!({
        "max_canvas_size": 16384, // Much higher than browser limit
        "max_iterations": 100_000_000, // Much higher than browser limit  
        "parallel_processing": true,
        "available_cores": num_cpus::get(),
        "platform": std::env::consts::OS,
        "architecture": std::env::consts::ARCH,
    });
    
    Ok(info)
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            generator: Mutex::new(FractalGenerator::new()),
        })
        .invoke_handler(tauri::generate_handler![
            generate_chaos_game,
            generate_ifs_fractal,
            generate_mandelbrot,
            generate_julia,
            points_to_rgba,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}