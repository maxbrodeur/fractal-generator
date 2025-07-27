# WASM Frontend - Fractal Generator

This directory contains the HTML/CSS/JavaScript replica of the Python Dash fractal generator application, designed for future WebAssembly integration.

## 📁 Structure

```
wasm-frontend/
├── index.html              # Main HTML page (pixel-perfect replica)
├── styles.css              # Custom CSS styling
├── assets/                 # Static assets (images, PDFs)
│   ├── sierpinski_triangle.png
│   ├── IFS_dragon.png
│   ├── starfish.png
│   └── ... (other assets)
└── vendor/                 # Fallback resources when CDN is blocked
    ├── css/bootstrap-superhero-fallback.css
    └── js/plotly-fallback.js
```

## 🚀 Running the Frontend

1. **Local Development**: Open `index.html` in a web browser
2. **HTTP Server**: For testing with proper CORS handling:
   ```bash
   cd wasm-frontend
   python -m http.server 8080
   # Then visit http://localhost:8080
   ```

## 🎯 Features

- **Complete Visual Fidelity**: Exact replica of the Python Dash application
- **All Interactive Elements**: 31 form controls with proper IDs and functionality
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **WebAssembly Ready**: Element IDs and structure prepared for algorithm integration
- **Fallback Systems**: Works when CDN resources are blocked

## 🔧 Future WebAssembly Integration

The HTML structure includes:
- Graph containers with proper IDs (`chaos_game_graph`, `ifs_graph`, `chaos_finder_graph`)
- Form element IDs matching the Python version for seamless integration
- Event handlers ready for WebAssembly algorithm calls
- Loading states for computation feedback

## 📊 Comparison with Python Version

This frontend achieves pixel-perfect visual parity with the original Python Dash application while maintaining the same user experience and functionality patterns.