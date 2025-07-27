# Complete Asset Inventory - Fractal Generator

## Overview
This document provides a complete inventory of all UI components, assets, and styling extracted from the Python Dash fractal generator application for WebAssembly conversion.

## Application Architecture

### Framework Dependencies
- **Dash Framework**: Core web application framework
- **Dash Bootstrap Components**: UI component library with SUPERHERO theme
- **Plotly.js**: Interactive graphing library for fractal visualization
- **Bootstrap 5**: CSS framework for responsive design
- **Custom CSS**: Application-specific styling

### External Resources Required
```html
<!-- Bootstrap CSS (SUPERHERO theme) -->
<link href="https://cdn.jsdelivr.net/npm/bootswatch@5.1.3/dist/superhero/bootstrap.min.css" rel="stylesheet">

<!-- Plotly.js for graphs -->
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<!-- Bootstrap JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
```

## Visual Assets

### Images (PNG format)
- `algorithm_1.png` - Algorithm illustration
- `IFS_dragon.png` - Dragon fractal example
- `parameters.png` - Parameter interface screenshot
- `parameters_3.png` - Additional parameter screenshot
- `sierpinski_triangle.png` - Sierpinski triangle example
- `silk.png` - Silk pattern fractal
- `starfish.png` - Starfish fractal pattern
- `tabs.png` - Tab interface screenshot
- `transformations.png` - Transformation interface screenshot
- `wave_quasi-cycle.png` - Wave pattern fractal

### Documentation
- `CHAOS_GAME_LATEX.pdf` - Mathematical documentation

### Custom CSS Files
- `stylesheet.css` - Original application styling
- `fractal-styles.css` - Enhanced documented version

## UI Component Specifications

### Color Scheme
```css
:root {
  --theme-color: #232325;     /* Dark background */
  --text-color: #ffdf80;      /* Gold/yellow text */
  --iter-pt-size: 0.1;        /* Iteration point size */
  --poly-pt-size: 2.5;        /* Polygon vertex size */
}
```

### Layout Structure
```
App Container
├── Header (title + tabs)
│   ├── Title: "FRACTAL GENERATOR"
│   └── Tab Navigation
│       ├── Chaos Game
│       ├── Transformations  
│       ├── Random Chaos Finder
│       └── About
└── Tab Content Areas
    ├── Parameter Accordions (collapsed by default)
    └── Full-screen Graph Areas
```

## Tab-by-Tab Component Breakdown

### 1. Chaos Game Tab

#### Parameter Controls
| Component | ID | Type | Default | Range/Options |
|-----------|----|----|---------|---------------|
| Presets | `presets_dropdown` | Dropdown | sierpt | sierpt, sierpc, vicsek, tsquare, techs, webs, XTREME |
| Iterations | `iterations_input` | Number | 10000 | 0-20000 (or 200M in fast mode) |
| Jump | `jump_input` | Text | "1/2" | Mathematical expressions |
| Polygon | `polygon_input` | Number | 3 | 1-200 |
| Length | `length_input` | Number | 0 | 0+ |
| Offset | `offset_input` | Number | 0 | Validated range |
| Symmetry | `symmetry_input` | Switch | false | boolean |
| Midpoints | `midpoints_input` | Switch | false | boolean |
| Center | `center_input` | Switch | false | boolean |
| Fast Plot | `fast-plot` | Switch | false | boolean |
| Auto Update | `auto-update` | Switch | true | boolean |

#### Graph Component
- **ID**: `GRAPH`
- **Library**: Plotly.js
- **Features**: Interactive zoom, pan, real-time rendering
- **Data**: Point clouds with polygon vertices

### 2. Transformations Tab

#### Parameter Controls
| Component | ID | Type | Default | Options |
|-----------|----|----|---------|---------|
| Presets | `presets-dropdown` | Dropdown | DRAGON | MB_LIKE, SPIRAL, DRAGON, XMAS, FERN, LEAF, SIERPT |
| Colors | `color-dropdown` | Dropdown | cc.fire | fire, jet, prism, turbo, colorwheel, gnuplot2, bmy |
| Parse Type | `parse-type` | Radio | regular | regular, borke |
| Iterations | `iters` | Number | 1000 | 10-10000 (thousands) |

#### Text Areas
- **Transformations** (`args-txt`): Matrix coefficients (6 per line)
- **Probabilities** (`probs-txt`): Comma-separated weights

#### Preset Data
```javascript
// Example preset definitions
DRAGON = '0.824074,0.281428,-0.212346,0.864198,-1.882290,-0.110607\n' +
         '0.088272,0.520988,-0.463889,-0.377778,0.785360,8.095795'
DRAGON_PROBS = '0.8,0.2'

FERN = '0.0,0.0,0.0,0.16,0.0,0.0\n' +
       '0.2,-0.26,0.23,0.22,0.0,1.6\n' +
       '-0.15,0.28,0.26,0.24,0.0,0.44\n' +
       '0.85,0.04,-0.04,0.85,0.0,1.6'
FERN_PROBS = '0.01,0.07,0.07,0.85'
```

### 3. Random Chaos Finder Tab

#### Parameter Controls
| Component | ID | Type | Default | Range/Options |
|-----------|----|----|---------|---------------|
| Map Order | `kind-radio` | Radio | quadratic | quadratic, cubic |
| Plot Iterations | `find-iterations-input` | Number | 1000 | 10-10000 (thousands) |
| Transient Points | `find-trans-input` | Number | 800 | 100-10000 |
| Map Iterations | `find-test-input` | Number | 70000 | 10000-1000000 |
| Randomization | `find-randtype-dropdown` | Radio | True | False (continuous), True (alphabet) |

#### Special Components
- **Dynamic Display** (`trans`): Updates with transient points value
- **Map Info** (`find-map-info`): Shows analysis results
- **Find Button** (`find-button`): Triggers map discovery

### 4. About Tab
- Simple navigation links to GitHub and blog post
- Minimal styling, consistent with theme

## Interactive Behaviors

### Input Validation
- Jump input: Validates mathematical expressions
- Offset input: Range validation based on symmetry and polygon
- Text areas: Must contain valid numerical data

### Dynamic Updates
- Auto-update mode: Real-time graph updates
- Fast plot mode: Changes iteration limits and step size
- Preset selection: Updates multiple parameters simultaneously
- Transient display: Updates dynamically with input

### Graph Rendering
- **Chaos Game**: Scatter plots with point clouds
- **Transformations**: High-resolution images via datashader
- **Chaos Finder**: Real-time attractor visualization

## CSS Class Reference

### Layout Classes
- `.elements` - Main header layout (flex)
- `.tabs` - Tab navigation positioning
- `.CHAOS-GAME`, `.TRANSFORMATIONS`, `.CHAOS-FINDER`, `.ABOUT` - Tab content areas
- `.numbers`, `.transfos`, `.finder` - Parameter container layouts

### Input Classes
- `.input_number_frame` - Number input containers (11.11% width)
- `.input_boolean_frame` - Switch containers (11.11% width)
- `.dropdown_frame` - Dropdown containers (11.11% width)
- `.input_frame` - General input containers (17% width)
- `.input_frame_find` - Finder tab inputs (16.66% width)

### Component Classes
- `.my_label` - Centered labels
- `.input` - Form input styling
- `.switch` - Scaled switch controls
- `.dropdown` - Dropdown specific styling
- `.txt` - Text area containers (50% width)

## WebAssembly Integration Points

### Algorithm Modules Required
1. **Chaos Game Engine**: Point generation with rules
2. **IFS Transformer**: Matrix-based transformations
3. **Chaos Analyzer**: Lyapunov exponent calculations
4. **Visualization Engine**: Point cloud to image rendering

### Data Interfaces
- Parameter passing to WASM modules
- Point cloud data transfer
- Image buffer management
- Real-time computation callbacks

### Performance Considerations
- Large point sets (up to 200M points)
- Real-time rendering requirements
- Memory management for high-resolution images
- Progressive loading for better UX

## Responsive Design Notes

### Breakpoints
- Parameter panels use percentage-based widths
- Flexible layouts with flexbox
- Accordion collapse for mobile views

### Accessibility
- All inputs have proper labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme

## Testing Requirements

### Visual Testing
- Screenshot comparison across browsers
- Layout consistency at different screen sizes
- Theme color accuracy
- Animation smoothness

### Functional Testing
- All parameter validations
- Preset loading accuracy
- Graph interactions (zoom, pan)
- Tab navigation
- Accordion expand/collapse

### Performance Testing
- Large iteration count handling
- Memory usage with high-resolution rendering
- Computation time benchmarks
- Browser compatibility

## Migration Checklist

- [x] Extract all HTML templates from Dash components
- [x] Copy all CSS files with documentation
- [x] Document all UI components and interactions
- [x] Catalog all assets (images, documentation)
- [x] Create comprehensive component inventory
- [ ] Generate visual reference screenshots
- [ ] Create WebAssembly integration specifications
- [ ] Build static test version
- [ ] Validate exact visual appearance match