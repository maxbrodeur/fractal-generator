# UI Component Inventory - Transformations Tab

## Overview
The Transformations tab implements Iterated Function Systems (IFS) for generating complex fractals through matrix transformations. It features preset systems, color controls, and mathematical input areas.

## Components

### 1. Transformation Presets Dropdown
- **ID**: `presets-dropdown`
- **Type**: Dropdown selection
- **Options**:
  - Mandelbrot-like (MB_LIKE)
  - Spiral (SPIRAL)
  - Dragon (DRAGON)
  - Christmas tree (XMAS)
  - Fern (FERN)
  - Maple leaf (LEAF)
  - Sierpinski triangle (SIERPT)
- **Default**: DRAGON
- **CSS Class**: `input_frame`

### 2. Color Presets Dropdown
- **ID**: `color-dropdown`
- **Type**: Dropdown selection
- **Options**:
  - Fire (cc.fire)
  - Jet (matplotlib jet)
  - Prism (matplotlib prism)
  - Turbo (matplotlib turbo)
  - Color wheel (cc.colorwheel)
  - GNUPlot (matplotlib gnuplot2)
  - BMY (cc.bmy)
- **Default**: cc.fire
- **CSS Class**: `input_frame`

### 3. Parsing Type Radio Buttons
- **ID**: `parse-type`
- **Type**: Radio button group
- **Options**:
  - `regular`: a,b,c,d,e,f => xnew = ax + by + c, ynew = dx + ey + f
  - `borke`: a,b,c,d,e,f => xnew = ax + by + e, ynew = cx + dy + f
- **Default**: regular
- **CSS Class**: `input_frame` with ID `PARSE-SELECT`

### 4. Iterations Input
- **ID**: `iters`
- **Type**: Number input (in thousands)
- **Range**: 10 to 10,000
- **Step**: 5
- **Default**: 1,000
- **CSS Class**: `input_frame`

### 5. Plot Button
- **ID**: `plot-button`
- **Type**: Button
- **Text**: "Plot"
- **CSS Class**: Custom styling with `#plot-button`

### 6. Transformations Text Area
- **ID**: `args-txt`
- **Type**: Large text area
- **Placeholder**: "a,b,c,d,e,f\na,b,c,d,e,f\na,b,c,d,e,f\n..."
- **Default**: DRAGON preset values
- **CSS Class**: `txt_area` within `txt` container
- **Format**: Each line represents one transformation matrix (6 parameters)

### 7. Probabilities Text Area
- **ID**: `probs-txt`
- **Type**: Text area
- **Placeholder**: "1,1,1\nNOTE: number of entries needs to equal number of supplied parameters"
- **Default**: DRAGON_PROBS values
- **CSS Class**: `txt_area` within `txt` container
- **Format**: Comma-separated probability weights for each transformation

### 8. Fractal Graph
- **ID**: `GRAPH2`
- **Type**: Plotly graph component
- **Style**: Full viewport height (100vh)
- **Features**:
  - High-resolution fractal rendering using datashader
  - Logarithmic color mapping
  - Custom colormap support
  - Black background with fire-like coloring

## Preset Definitions

### Transformations
```javascript
MB_LIKE = '0.2020,-0.8050,-0.3730,-0.6890,-0.3420,-0.6530\n' +
          '0.1380, 0.6650, 0.6600, -0.5020, -0.2220, -0.2770'
SPIRAL = '0.787879,-0.424242,0.242424,0.859848,1.758647,1.408065\n' +
         '-0.121212,0.257576,0.151515,0.053030,-6.721654,1.377236\n' +
         '0.181818,-0.136364,0.090909,0.181818,6.086107,1.568035'
DRAGON = '0.824074,0.281428,-0.212346,0.864198,-1.882290,-0.110607\n' +
         '0.088272,0.520988,-0.463889,-0.377778,0.785360,8.095795'
XMAS = '0.0, -0.5, 0.5, 0.0, 0.5, 0.0\n' +
       '0.0, 0.5, -0.5, 0.0, 0.5, 0.5\n' +
       '0.5, 0.0, 0.0, 0.5, 0.25, 0.5'
FERN = '0.0,0.0,0.0,0.16,0.0,0.0\n' +
       '0.2,-0.26,0.23,0.22,0.0,1.6\n' +
       '-0.15,0.28,0.26,0.24,0.0,0.44\n' +
       '0.85,0.04,-0.04,0.85,0.0,1.6'
LEAF = '0.14,0.01,0.0,0.51,-0.08,-1.31\n' +
       '0.43,0.52,-0.45,0.5,1.49,-0.75\n' +
       '0.45,-0.49,0.47,0.47,-1.62,-0.74\n' +
       '0.49,0.0,0.0,0.51,0.02,1.62'
SIERPT = '0.5,0.0,0.0,0.0,0.5,0.0\n' +
         '0.5,0.0,0.5,0.0,0.5,0.0\n' +
         '0.5,0.0,0.0,0.0,0.5,0.5'
```

### Probabilities
```javascript
MB_LIKE_PROBS = '0.5,0.5'
SPIRAL_PROBS = '0.9,0.05,0.05'
DRAGON_PROBS = '0.8,0.2'
XMAS_PROBS = '1/3,1/3,1/3'
FERN_PROBS = '0.01,0.07,0.07,0.85'
LEAF_PROBS = '0.25,0.25,0.25,0.25'
SIERPT_PROBS = '1/3,1/3,1/3'
```

## Layout Structure

```html
<div class="TRANSFORMATIONS">
  <accordion>
    <accordion-item title="PARAMETERS" collapsed="true">
      <div class="transfos">
        <div class="input_frame"><!-- Preset dropdown --></div>
        <div class="input_frame"><!-- Color dropdown --></div>
        <div class="input_frame" id="PARSE-SELECT"><!-- Parse type radio --></div>
        <div class="input_frame"><!-- Iterations input --></div>
        <div id="plot-button"><!-- Plot button --></div>
        <div class="txt"><!-- Transformations text area --></div>
        <div class="txt"><!-- Probabilities text area --></div>
      </div>
    </accordion-item>
  </accordion>
  <graph id="GRAPH2" style="height: 100vh"></graph>
</div>
```

## Interactions and Dependencies

### Preset Loading
- Selecting a preset updates both transformation matrix and probability values
- Updates parse type if needed for the specific preset

### Mathematical Processing
- Transformation matrices are parsed as numpy arrays
- Probabilities are evaluated to handle fractions (e.g., "1/3")
- Matrix parsing depends on the selected parsing type

### Graph Rendering
- Uses datashader for high-performance rendering of large point sets
- Applies logarithmic scaling for better visualization
- Custom colormap application based on selected color preset

### Input Validation
- Text areas must contain valid numerical data
- Number of probability entries must match number of transformations
- Malformed input prevents plotting

## Algorithm Details

### Regular Parsing (a,b,c,d,e,f format)
```
x_new = a*x + b*y + c
y_new = d*x + e*y + f
```

### Borke Parsing (a,b,c,d,e,f format)
```
x_new = a*x + b*y + e
y_new = c*x + d*y + f
```

## Color Scheme
- Same dark theme as Chaos Game tab
- High-contrast fractal rendering with customizable colormaps
- Text areas use white text on dark background