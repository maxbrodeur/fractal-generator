# Fractal Generator - Extracted Assets

This directory contains all UI components and assets extracted from the Python Dash application for conversion to a WebAssembly static site.

## Directory Structure

```
extracted-assets/
├── html-templates/          # Static HTML versions of Dash components
├── css/                     # All styling files
├── assets/                  # Images, fonts, and other resources
├── components/              # Documented UI component specifications
├── screenshots/             # Visual reference images
└── documentation/           # Complete UI component inventory
```

## Component Overview

### Main Application Structure
- **Framework**: Dash with Bootstrap components
- **Theme**: Dark theme with custom styling
- **Layout**: Tab-based interface with accordion parameter panels

### Tabs:
1. **Chaos Game** - Interactive fractal generation with chaos game algorithm
2. **Transformations** - Iterated Function System (IFS) fractal generation
3. **Random Chaos Finder** - Automatic discovery of chaotic maps
4. **About** - Links to GitHub and blog post

### Key UI Elements:
- Responsive parameter control panels
- Interactive graphs for fractal visualization
- Preset selection dropdowns
- Number inputs with validation
- Boolean switches for options
- Text areas for complex input
- Progress indicators and loading states

## Conversion Notes

All components have been extracted to maintain exact visual appearance and functionality while preparing for WebAssembly integration. The original Python algorithms will be converted to WASM modules that interface with these preserved UI components.