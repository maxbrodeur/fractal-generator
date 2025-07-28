# Python Implementation - Original Fractal Generator

This directory contains the original Python implementation of the fractal generator web application that was deployed on Heroku.

## Contents

- **`app.py`** - Main Flask web application
- **`ChaosFinder.py`** - Automatic generation of discrete chaotic attractors
- **`Fractal.py`** - Core fractal generation algorithms
- **`components.py`** - UI components and rendering
- **`finder_components.py`** - Chaos finder UI components
- **`transform_components.py`** - Transformation system components
- **`chaostech/`** - Mathematical utilities and rule systems
- **`docs/`** - Documentation and test cases
- **`requirements.txt`** - Python dependencies
- **`runtime.txt`** - Python runtime version for Heroku
- **`Procfile`** - Heroku deployment configuration

## Features

The Python implementation includes:

1. **Chaos Game** - Generate fractals like the Sierpinski triangle using the chaos game algorithm
2. **Iterated Function Systems (IFS)** - Create complex fractals using transformation systems
3. **Automatic Chaos Finder** - Automatically discover chaotic 2D discrete maps
4. **Multiple Fractal Types** - Mandelbrot, Julia sets, Burning Ship, and more
5. **Interactive Parameters** - Real-time parameter adjustment
6. **Preset Library** - Pre-configured fractal parameters

## Historical Context

This was the original implementation created for the MATH326 - Nonlinear Dynamics & Chaos course at McGill University (Fall 2021). The web application was deployed on Heroku and provided a full-featured fractal generation environment.

## Performance Notes

The Python implementation, while feature-complete, has performance limitations:
- Sierpinski Triangle: ~15,748 points/sec
- Dragon Curve: ~30,675 points/sec  
- Mandelbrot Set: ~83,478 pixels/sec

For significantly improved performance, see the WebAssembly implementation in the root directory, which provides 10-100x faster rendering.

## Running the Python Implementation

To run the original Python version:

```bash
cd python_implementation
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000 in your browser.

## Migration to WebAssembly

This Python implementation serves as the reference for the new WebAssembly version. The algorithms and functionality are being ported to Rust/WebAssembly for dramatically improved performance while maintaining the same features and visual output.
