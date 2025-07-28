# UI Component Inventory - About Tab

## Overview
The About tab provides links to external resources related to the fractal generator project. It's a simple informational tab with navigation links.

## Components

### 1. GitHub Link
- **Type**: Navigation link
- **Text**: "GITHUB"
- **URL**: https://github.com/maxbrodeur/fractal-generator
- **CSS Class**: `dbc.NavLink` within `dbc.Nav`

### 2. Blog Post Link
- **Type**: Navigation link  
- **Text**: "BLOG POST"
- **URL**: https://maxbrodeur.github.io/fractals/index.html
- **CSS Class**: `dbc.NavLink` within `dbc.Nav`

## Layout Structure

```html
<div class="ABOUT">
  <nav>
    <a class="nav-link" href="https://github.com/maxbrodeur/fractal-generator">GITHUB</a>
  </nav>
  <nav>
    <a class="nav-link" href="https://maxbrodeur.github.io/fractals/index.html">BLOG POST</a>
  </nav>
</div>
```

## Component Details

### Navigation Links
- Use Bootstrap navigation styling from SUPERHERO theme
- Open in new tabs/windows (typical behavior for external links)
- Consistent with dark theme color scheme

### Content Purpose
- **GitHub Link**: Direct access to source code repository
- **Blog Post Link**: Educational content about fractal mathematics and implementation

## Design Notes
- Minimal design consistent with application theme
- Simple navigation without complex interactions
- Serves as reference point for users wanting more information

## Color Scheme
- Inherits from Bootstrap SUPERHERO theme
- Links styled with theme colors
- Consistent with overall dark theme (#232325 background, #ffdf80 text)