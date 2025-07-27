# UI Component Inventory - Random Chaos Finder Tab

## Overview
The Random Chaos Finder tab automatically discovers chaotic maps through algorithmic search. It analyzes dynamical systems for chaotic behavior using Lyapunov exponents and fractal dimension estimation.

## Components

### 1. Chaotic Map Order Radio Buttons
- **ID**: `kind-radio`
- **Type**: Radio button group
- **Options**:
  - Quadratic (quadratic)
  - Cubic (cubic)
- **Default**: quadratic
- **CSS Class**: `input_frame_find`
- **Layout**: Inline radio buttons

### 2. Plot Iterations Input
- **ID**: `find-iterations-input`
- **Type**: Number input (in thousands)
- **Range**: 10 to 10,000
- **Step**: 5
- **Default**: 1,000
- **CSS Class**: `input_frame_find`
- **Purpose**: Controls number of points to render in the final fractal

### 3. Transient Points Input
- **ID**: `find-trans-input`
- **Type**: Number input
- **Range**: 100 to 10,000
- **Step**: 5
- **Default**: 800
- **CSS Class**: `input_frame_find`
- **Purpose**: Number of initial points to discard when testing for chaos

### 4. Dynamic Transient Display
- **ID**: `trans`
- **Type**: Dynamic text label
- **Updates**: Reflects the current transient points value
- **Integration**: Within the transient points label text

### 5. Map Iterations Input
- **ID**: `find-test-input`
- **Type**: Number input
- **Range**: 10,000 to 1,000,000
- **Step**: 1,000
- **Default**: 70,000
- **CSS Class**: `input_frame_find`
- **Purpose**: Controls iteration count for Lyapunov exponent calculation

### 6. Randomization Type Radio Buttons
- **ID**: `find-randtype-dropdown`
- **Type**: Radio button group
- **Options**:
  - Continuous (False)
  - Discrete "Alphabet" mode (True)
- **Default**: True
- **CSS Class**: `input_frame_find`
- **Purpose**: Controls parameter generation method

### 7. Find Button
- **ID**: `find-button`
- **Type**: Button
- **Text**: "Find next chaotic map"
- **CSS Class**: Inherits from `input_frame_find`

### 8. Map Information Display
- **ID**: `find-map-info`
- **Type**: Dynamic text display
- **Default**: "No map information to show"
- **CSS Class**: `#find-map-info`
- **Height**: 90px
- **Width**: 100%

### 9. Chaos Analysis Graph
- **ID**: `find-graph`
- **Type**: Plotly graph component
- **Style**: Full viewport height (100vh)
- **Features**:
  - Real-time chaotic map visualization
  - High-resolution rendering via datashader
  - Fire colormap for attractor visualization

## Map Information Format

The map information display shows comprehensive analysis results:

### Continuous Mode
```
Parameters: [1.2, -0.8, 0.5, -0.3, 1.1, -0.9]
Maximum lyapunov exponent: 0.234
Minimum lyapunov exponent: -1.456
Estimated Kaplan-Yorke dimension: 1.67
```

### Alphabet Mode
```
Parameters: ABCDEF
Maximum lyapunov exponent: 0.234
Minimum lyapunov exponent: -1.456
Estimated Kaplan-Yorke dimension: 1.67
```

### Alphabet Mapping
```javascript
// Maps parameter values to letters for compact display
ints = [-1.2, -1.1, -1.0, ..., 1.0, 1.1, 1.2] // 0.1 increments
chrs = ['A', 'B', 'C', ..., 'X', 'Y'] // A-Y mapping
```

## Layout Structure

```html
<div class="CHAOS-FINDER">
  <accordion>
    <accordion-item title="PARAMETERS" collapsed="true">
      <div class="finder">
        <div class="input_frame_find"><!-- Map order radio --></div>
        <div class="input_frame_find"><!-- Plot iterations --></div>
        <div class="input_frame_find"><!-- Transient points --></div>
        <div class="input_frame_find"><!-- Map iterations --></div>
        <div class="input_frame_find"><!-- Randomization type --></div>
        <div><!-- Find button --></div>
        <div id="find-map-info"><!-- Map information --></div>
      </div>
    </accordion-item>
  </accordion>
  <graph id="find-graph" style="height: 100vh"></graph>
</div>
```

## Algorithm Overview

### Chaotic Map Generation
The system generates random dynamical maps and tests them for chaotic behavior:

1. **Parameter Generation**: Creates random coefficients for polynomial maps
2. **Orbit Computation**: Iterates the map to generate point sequences
3. **Chaos Detection**: Calculates Lyapunov exponents to identify chaos
4. **Fractal Analysis**: Estimates dimension using Kaplan-Yorke formula
5. **Visualization**: Renders discovered attractors using datashader

### Map Types

#### Quadratic Maps
General form: `f(x,y) = (ax² + bxy + cy² + dx + ey + f, ...)`

#### Cubic Maps  
General form: `f(x,y) = (ax³ + bx²y + cxy² + dy³ + ex² + fxy + gy² + hx + iy + j, ...)`

### Chaos Criteria
Maps are accepted as chaotic if:
- Maximum Lyapunov exponent > 0 (positive divergence)
- Minimum Lyapunov exponent < 0 (folding behavior)
- Estimated fractal dimension is non-integer
- Orbit remains bounded (doesn't escape to infinity)

## Interactions and Dependencies

### Parameter Dependencies
- Transient points affect chaos detection accuracy
- Map iterations control Lyapunov calculation precision
- Plot iterations determine final visualization quality

### Search Process
- Sequential search through parameter space
- Automatic rejection of non-chaotic maps
- Real-time display of discovered attractors

### Performance Considerations
- High iteration counts improve accuracy but slow computation
- Alphabet mode provides compact parameter representation
- Datashader enables visualization of large point sets

## Color Scheme
- Consistent with other tabs (dark theme)
- Fire colormap for attractor visualization
- High contrast for map information display