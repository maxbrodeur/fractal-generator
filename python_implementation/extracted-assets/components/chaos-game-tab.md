# UI Component Inventory - Chaos Game Tab

## Overview
The Chaos Game tab contains the main fractal generation interface using the chaos game algorithm. It features parameter controls in an accordion panel and a full-screen graph for visualization.

## Components

### 1. Preset Dropdown
- **ID**: `presets_dropdown`
- **Type**: Dropdown selection
- **Options**:
  - sierpt (Sierpinski Triangle)
  - sierpc (Sierpinski Carpet)
  - vicsek (Vicsek Fractal)
  - tsquare (T-Square)
  - techs (Koch Curve variant)
  - webs (Web pattern)
  - XTREME (High-detail pattern)
- **Default**: sierpt
- **CSS Class**: `dropdown_frame`

### 2. Iterations Input
- **ID**: `iterations_input`
- **Type**: Number input
- **Range**: 0 to 200,000 (or 200,000,000 in fast mode)
- **Step**: 1 (or 1000 in fast mode)
- **Default**: 10,000
- **CSS Class**: `input_number_frame`

### 3. Polygon Input
- **ID**: `polygon_input`
- **Type**: Number input
- **Range**: 1 to 200
- **Step**: 1
- **Default**: 3
- **CSS Class**: `input_number_frame`

### 4. Jump Distance Input
- **ID**: `jump_input`
- **Type**: Text input (evaluates mathematical expressions)
- **Default**: "1/2"
- **Validation**: Must evaluate to positive number
- **CSS Class**: `input_number_frame`

### 5. Length Input
- **ID**: `length_input`
- **Type**: Number input
- **Range**: 0+
- **Default**: 0
- **CSS Class**: `input_number_frame`

### 6. Offset Input
- **ID**: `offset_input`
- **Type**: Number input
- **Default**: 0
- **Validation**: Depends on symmetry setting and polygon count
- **CSS Class**: `input_number_frame`

### 7. Symmetry Switch
- **ID**: `symmetry_input`
- **Type**: Boolean switch
- **Default**: False
- **CSS Class**: `input_boolean_frame`

### 8. Stack Midpoints Switch
- **ID**: `midpoints_input`
- **Type**: Boolean switch
- **Default**: False
- **CSS Class**: `input_boolean_frame`

### 9. Stack Center Switch
- **ID**: `center_input`
- **Type**: Boolean switch
- **Default**: False
- **CSS Class**: `input_boolean_frame`

### 10. Fast Plotting Switch
- **ID**: `fast-plot`
- **Type**: Boolean switch
- **Default**: False
- **Effect**: Changes iteration limits and enables high-performance rendering
- **CSS Class**: `input_boolean_frame`

### 11. Auto Update Switch
- **ID**: `auto-update`
- **Type**: Boolean switch
- **Default**: True
- **Effect**: Controls whether graph updates automatically with parameter changes
- **CSS Class**: `input_boolean_frame`

### 12. Fractal Graph
- **ID**: `GRAPH`
- **Type**: Plotly graph component
- **Style**: Full viewport height (100vh)
- **Theme**: Dark theme with custom styling
- **Features**:
  - Interactive zoom and pan
  - Real-time fractal rendering
  - Point cloud visualization
  - Polygon vertex display

## Layout Structure

```html
<div class="CHAOS-GAME">
  <accordion>
    <accordion-item title="PARAMETERS" collapsed="true">
      <div class="numbers">
        <!-- All parameter controls in flex layout -->
        <div class="dropdown_frame"><!-- Preset dropdown --></div>
        <div class="input_number_frame"><!-- Iterations --></div>
        <div class="input_number_frame"><!-- Jump --></div>
        <div class="input_number_frame"><!-- Polygon --></div>
        <div class="input_number_frame"><!-- Length --></div>
        <div class="input_number_frame"><!-- Offset --></div>
        <div class="input_boolean_frame"><!-- Symmetry --></div>
        <div class="input_boolean_frame"><!-- Midpoints --></div>
        <div class="input_boolean_frame"><!-- Center --></div>
        <div class="input_boolean_frame"><!-- Fast plot --></div>
        <div class="input_boolean_frame"><!-- Auto update --></div>
      </div>
    </accordion-item>
  </accordion>
  <graph id="GRAPH" style="height: 100vh"></graph>
</div>
```

## Interactions and Dependencies

### Parameter Validation
- Jump input validates mathematical expressions
- Offset validation depends on symmetry and polygon values
- Fast plotting mode changes iteration input limits

### Graph Updates
- Automatic updates when auto-update is enabled
- Manual updates when auto-update is disabled
- Optimized rendering for different iteration counts
- Special handling for fast plotting mode

### Preset System
- Presets update all parameters simultaneously
- Each preset has predefined values for all controls
- Presets include algorithm-specific parameters

## Color Scheme
- Background: Dark theme (#232325)
- Text: Gold/yellow (#ffdf80)
- Graph: Black background with colored points
- UI Elements: Bootstrap SUPERHERO theme variants