# Fractal Generation Algorithms Documentation

This document provides comprehensive documentation of all fractal generation algorithms implemented in the Python codebase, preparing for Rust/WebAssembly implementation.

## Table of Contents

1. [Chaos Game Algorithms](#chaos-game-algorithms)
2. [Iterated Function Systems (IFS)](#iterated-function-systems-ifs)
3. [Chaotic Map Generation](#chaotic-map-generation)
4. [Color Mapping Functions](#color-mapping-functions)
5. [Test Cases and Validation](#test-cases-and-validation)

## Chaos Game Algorithms

The chaos game is a method of creating fractals using a simple iterative process. Starting with an initial point, the algorithm repeatedly selects a random vertex from a polygon and moves a fraction of the distance toward that vertex.

### Core Algorithm: `getPointsV`

**Location**: `Fractal.py:311-341`

**Purpose**: Generates fractal points using the chaos game method with customizable rules.

**Input Parameters**:
- `vs` (numpy.ndarray): Array of vertices defining the polygon shape
- `x0, y0` (float): Initial starting coordinates
- `N` (int): Number of iterations/points to generate
- `ifs` (deprecated): Legacy parameter, should be None
- `T` (numpy.ndarray): Transformation parameters array with shape (n_vertices, 2) containing [compression_ratio, rotation_angle]
- `rule` (Rule): Rule object defining vertex selection constraints

**Output Format**: 
- Returns numpy array with shape (N, 3) where each row is [x, y, 0]

**Algorithm Steps**:
1. Initialize with starting point (x0, y0)
2. For each iteration:
   - Select a valid vertex using the rule system
   - Calculate difference vector from current point to selected vertex
   - Apply rotation and compression transformation
   - Move to new position: new_pos = current_pos + compressed_rotated_difference
3. Store each point in output array

**Mathematical Formula**:
```
Given current point (x, y) and selected vertex v:
diff = v - (x, y)
rotated_diff = rotate(diff, angle)
new_point = (x, y) + compression_ratio * rotated_diff
```

### Specific Chaos Game Fractals

#### 1. Sierpinski Triangle (`sierpt`)

**Location**: `Fractal.py:433-438`

**Input Parameters**:
- `N` (int): Number of iterations (default: variable)
- `T` (numpy.ndarray): Transformation array (default: [0.5, 0] - 50% compression, no rotation)

**Configuration**:
- Vertices: 3-sided polygon (equilateral triangle)
- Compression ratio: 0.5 (jump halfway)
- No special rules
- No rotation

**Expected Behavior**: Generates the classic Sierpinski triangle fractal pattern

#### 2. Sierpinski Carpet (`sierpc`)

**Location**: `Fractal.py:441-447`

**Input Parameters**:
- `N` (int): Number of iterations
- `T` (numpy.ndarray): Transformation array (default: [2/3, 0])

**Configuration**:
- Vertices: 4-sided polygon (square) with midpoints stacked
- Compression ratio: 2/3
- Midpoints enabled (creates 8 target points total)
- No special rules

**Expected Behavior**: Generates a Sierpinski carpet-like fractal

#### 3. Vicsek Square (`vicsek`)

**Location**: `Fractal.py:450-456`

**Input Parameters**:
- `N` (int): Number of iterations
- `T` (numpy.ndarray): Transformation array (default: [2/3, 0])

**Configuration**:
- Vertices: 4-sided polygon (square) with center point
- Compression ratio: 2/3
- Center stacking enabled (creates 5 target points)
- No special rules

**Expected Behavior**: Generates a Vicsek fractal (plus-sign pattern)

#### 4. T-Square (`tsquare`)

**Location**: `Fractal.py:459-464`

**Input Parameters**:
- `N` (int): Number of iterations
- `T` (numpy.ndarray): Transformation array (default: [1/2, 0])

**Configuration**:
- Vertices: 4-sided polygon (square)
- Compression ratio: 1/2
- Rule: Cannot jump to vertex 2 positions away from last vertex
- Rule parameters: length=1, offset=2, symmetry=False

**Expected Behavior**: Generates T-square fractal pattern

#### 5. Techs Pattern (`techs`)

**Location**: `Fractal.py:467-472`

**Input Parameters**:
- `N` (int): Number of iterations
- `T` (numpy.ndarray): Transformation array (default: [1/2, 0])
- `skew` (int): Offset parameter (default: 0)

**Configuration**:
- Vertices: 4-sided polygon (square)
- Compression ratio: 1/2
- Rule: Variable offset based on skew parameter
- Rule parameters: length=1, offset=skew, symmetry=False

**Expected Behavior**: Generates tech-pattern fractals with variable restrictions

#### 6. Web Patterns (`webs`)

**Location**: `Fractal.py:475-480`

**Input Parameters**:
- `N` (int): Number of iterations
- `T` (numpy.ndarray): Transformation array (default: [1/2, 0.1])
- `symmetry` (bool): Whether to apply symmetric rules (default: True)

**Configuration**:
- Vertices: 4-sided polygon (square)
- Compression ratio: 1/2
- Rotation: 0.1 radians
- Rule: Cannot jump to vertex 1 position before last vertex when last 2 choices are equal
- Rule parameters: length=2, offset=-1, symmetry=True

**Expected Behavior**: Generates web-like fractal patterns

### Rule System

**Location**: `chaostech/Rule.py`

The Rule class implements constraints on vertex selection to create different fractal patterns.

**Key Methods**:
- `check(vln, ind)`: Returns True if vertex `ind` cannot be selected
- `add(e)`: Adds vertex choice to history
- `all()`: Checks if all recent choices are the same

**Rule Parameters**:
- `length` (int): Number of previous choices to track
- `offset` (int): Forbidden offset from last vertex
- `symmetry` (bool): Whether to apply symmetric restrictions

## Iterated Function Systems (IFS)

IFS algorithms apply a set of affine transformations randomly to generate fractal patterns.

### Core Algorithm: `getPointsAdv`

**Location**: `Fractal.py:288-308`

**Purpose**: Advanced fractal generation using user-defined transformation functions and selection logic.

**Input Parameters**:
- `N` (int): Number of iterations
- `p` (numpy.ndarray): Initial point [x, y, z]
- `f` (function): Transformation function that takes (params, x, y, z) and returns new point
- `args` (numpy.ndarray): Array of transformation parameter sets
- `chooser` (function): Function that selects which transformation to use
- `selector` (function): Function that extracts parameters from args array
- `iterator` (function): Function to modify parameters each iteration
- `probs` (numpy.ndarray): Probability weights for transformation selection

**Output Format**: 
- Returns numpy array with shape (N, 3) where each row is [x, y, z]

**Algorithm Steps**:
1. Initialize with starting point p
2. For each iteration:
   - Use chooser function to select transformation index based on probabilities
   - Use selector to get transformation parameters
   - Apply transformation function f with selected parameters
   - Apply iterator function to modify parameters
   - Store resulting point

### IFS Transformation Functions

#### Affine Transformation Parsing

**Location**: `transform_components.py:366-387`

Two parsing modes for 6-parameter affine transformations:

**Regular Mode** (`parse='regular'`):
```
Parameters: a,b,c,d,e,f
x_new = a*x + b*y + c
y_new = d*x + e*y + f
```

**Borke Mode** (`parse='borke'`):
```
Parameters: a,b,c,d,e,f  
x_new = a*x + b*y + e
y_new = c*x + d*y + f
```

### Predefined IFS Fractals

#### 1. Dragon Curve (`DRAGON`)

**Location**: `transform_components.py:22-23`

**Parameters**:
```
Transformation 1: 0.824074,0.281428,-0.212346,0.864198,-1.882290,-0.110607
Transformation 2: 0.088272,0.520988,-0.463889,-0.377778,0.785360,8.095795
```

**Probabilities**: [0.8, 0.2]

**Parsing Mode**: borke

**Expected Behavior**: Generates dragon curve fractal

#### 2. Barnsley Fern (`FERN`)

**Location**: `transform_components.py:30-34`

**Parameters**:
```
Transformation 1: 0.0,0.0,0.0,0.16,0.0,0.0
Transformation 2: 0.2,-0.26,0.23,0.22,0.0,1.6
Transformation 3: -0.15,0.28,0.26,0.24,0.0,0.44
Transformation 4: 0.85,0.04,-0.04,0.85,0.0,1.6
```

**Probabilities**: [0.01, 0.07, 0.07, 0.85]

**Parsing Mode**: borke

**Expected Behavior**: Generates Barnsley fern fractal

#### 3. Maple Leaf (`LEAF`)

**Location**: `transform_components.py:36-40`

**Parameters**:
```
Transformation 1: 0.14,0.01,0.0,0.51,-0.08,-1.31
Transformation 2: 0.43,0.52,-0.45,0.5,1.49,-0.75
Transformation 3: 0.45,-0.49,0.47,0.47,-1.62,-0.74
Transformation 4: 0.49,0.0,0.0,0.51,0.02,1.62
```

**Probabilities**: [0.25, 0.25, 0.25, 0.25]

**Parsing Mode**: borke

**Expected Behavior**: Generates maple leaf-like fractal

#### 4. Christmas Tree (`XMAS`)

**Location**: `transform_components.py:25-28`

**Parameters**:
```
Transformation 1: 0.0,-0.5,0.5,0.0,0.5,0.0
Transformation 2: 0.0,0.5,-0.5,0.0,0.5,0.5
Transformation 3: 0.5,0.0,0.0,0.5,0.25,0.5
```

**Probabilities**: [1/3, 1/3, 1/3]

**Parsing Mode**: borke

**Expected Behavior**: Generates Christmas tree-like pattern

#### 5. Spiral Pattern (`SPIRAL`)

**Location**: `transform_components.py:16-19`

**Parameters**:
```
Transformation 1: 0.787879,-0.424242,0.242424,0.859848,1.758647,1.408065
Transformation 2: -0.121212,0.257576,0.151515,0.053030,-6.721654,1.377236
Transformation 3: 0.181818,-0.136364,0.090909,0.181818,6.086107,1.568035
```

**Probabilities**: [0.9, 0.05, 0.05]

**Parsing Mode**: borke

**Expected Behavior**: Generates spiral fractal patterns

#### 6. Mandelbrot-like (`MB_LIKE`)

**Location**: `transform_components.py:12-14`

**Parameters**:
```
Transformation 1: 0.2020,-0.8050,-0.3730,-0.6890,-0.3420,-0.6530
Transformation 2: 0.1380,0.6650,0.6600,-0.5020,-0.2220,-0.2770
```

**Probabilities**: [0.5, 0.5]

**Parsing Mode**: regular

**Expected Behavior**: Generates Mandelbrot-like fractal patterns

#### 7. Sierpinski Triangle via IFS (`SIERPT`)

**Location**: `transform_components.py:42-45`

**Parameters**:
```
Transformation 1: 0.5,0.0,0.0,0.0,0.5,0.0
Transformation 2: 0.5,0.0,0.5,0.0,0.5,0.0
Transformation 3: 0.5,0.0,0.0,0.0,0.5,0.5
```

**Probabilities**: [1/3, 1/3, 1/3]

**Parsing Mode**: regular

**Expected Behavior**: Generates Sierpinski triangle using IFS method

## Chaotic Map Generation

The application includes algorithms for automatically finding and generating 2D chaotic discrete maps.

### Core Algorithm: Lyapunov Exponent Calculation

**Location**: `ChaosFinder.py:149-252`

**Purpose**: Tests if a 2D discrete map exhibits chaotic behavior by calculating Lyapunov exponents.

**Input Parameters**:
- `args1, args2` (numpy.ndarray): Coefficient arrays for x and y map equations
- `n` (int): Number of transient iterations to discard
- `N` (int): Number of iterations for Lyapunov calculation
- `thresh` (float): Threshold for detecting unbounded behavior
- `kind` (str): Map type - 'quadratic' or 'cubic'

**Output Format**:
- Returns numpy array [max_LE, min_LE, contraction] or [-1, -1, -1] if invalid

**Algorithm Steps**:
1. Initialize point (0.05, 0.05) and orthogonal vectors
2. Discard n transient iterations to reach attractor
3. For N iterations:
   - Apply map transformation
   - Calculate Jacobian matrix
   - Check for boundedness and fixed points
   - Apply Gram-Schmidt orthogonalization
   - Update Lyapunov exponent estimates
4. Return averaged Lyapunov exponents

### Map Types

#### Quadratic Maps

**Location**: `ChaosFinder.py:58-65` (function `f`)

**Mathematical Form**:
```
X_{n+1} = a + b*X_n + c*X_n² + d*X_n*Y_n + e*Y_n + f*Y_n²
Y_{n+1} = a' + b'*X_n + c'*X_n² + d'*X_n*Y_n + e'*Y_n + f'*Y_n²
```

**Parameters**: 6 coefficients per equation (12 total)

**Jacobian** (Location: `ChaosFinder.py:67-81`):
```
J = [[ 2*c*X + d*Y + b,    d*X + 2*f*Y + e   ]
     [ 2*c'*X + d'*Y + b', d'*X + 2*f'*Y + e' ]]
```

#### Cubic Maps

**Location**: `ChaosFinder.py:84-87` (function `f_cubic`)

**Mathematical Form**:
```
X_{n+1} = a₀ + a₁*X + a₂*X² + a₃*X³ + a₄*X²*Y + a₅*X*Y + a₆*X*Y² + a₇*Y + a₈*Y² + a₉*Y³
```

**Parameters**: 10 coefficients per equation (20 total)

**Jacobian** (Location: `ChaosFinder.py:90-101`):
More complex partial derivatives for cubic terms.

### Fractal Dimension Calculation

**Location**: `ChaosFinder.py:15-26`

**Purpose**: Estimates fractal dimension using Kaplan-Yorke conjecture.

**Formula**:
```
If max_LE ≤ 0: dimension = 0
If max_LE + min_LE > 0: dimension = 2 + (max_LE + min_LE) / |min_LE|
Else: dimension = 1 + max_LE / |min_LE|
```

### Chaos Detection Criteria

**Location**: `ChaosFinder.py:123-130`

**Quadratic Maps**:
- max_LE > threshold (typically 1e-4)
- Fractal dimension significantly different from 1.0 (tolerance: 0.11)

**Cubic Maps**:
- max_LE > threshold
- Fractal dimension significantly different from 1.0 or 2.0 (tolerance: 0.11)

### Random Parameter Generation

**Location**: `ChaosFinder.py:28-35`

**Continuous Mode** (`get_random_args`):
- Parameters uniformly distributed in [-1.2, 1.2]

**Discrete Mode** (`get_random_args_`):
- Parameters from discrete set {-1.2, -1.1, ..., 1.1, 1.2}
- Step size: 0.1

## Color Mapping Functions

### Datashader Integration

**Location**: App callback functions (lines 177-183, 400-402, etc.)

**Purpose**: Converts point clouds to colored images using logarithmic density mapping.

**Process**:
1. Create Datashader Canvas with specified resolution (typically 1500x1500)
2. Aggregate points using `cvs.points(df, 'x', 'y')`
3. Apply logarithmic shading: `ds.tf.shade(agg, how="log", cmap=colormap)`
4. Set black background: `ds.tf.set_background(..., "black")`

### Available Color Maps

**Location**: `transform_components.py:76-89`

**Predefined Options**:
- `cc.fire`: Fire color scheme (red-orange-yellow)
- `cc.colorwheel`: Full spectrum wheel
- `cc.bmy`: Blue-magenta-yellow
- `plt.get_cmap('jet')`: Matplotlib jet colormap
- `plt.get_cmap('prism')`: Matplotlib prism colormap  
- `plt.get_cmap('turbo')`: Matplotlib turbo colormap
- `plt.get_cmap('gnuplot2')`: GNUPlot color scheme

**Default**: `cc.fire`

### Plotting Configuration

**Bounds Calculation**:
```python
xbounds = (points[:, 0].min()-0.2, points[:, 0].max()+0.2)
ybounds = (points[:, 1].min()-0.2, points[:, 1].max()+0.2)
```

**Resolution**: 1500x1500 pixels standard

**Density Mapping**: Logarithmic scale to handle varying point densities

## Test Cases and Validation

### Sierpinski Triangle Test Case

**Input Parameters**:
```python
N = 10000
vertices = [(0, sqrt(3)/2), (-0.5, 0), (0.5, 0)]  # Equilateral triangle
compression = 0.5
no_rules = Rule(0, 0, False)
```

**Expected Output Characteristics**:
- Points should converge to triangular fractal pattern
- Self-similar at multiple scales
- Three main triangular regions with gaps
- Fractal dimension ≈ 1.585

### Dragon Curve Test Case

**Input Parameters**:
```python
transformations = [
    [0.824074, 0.281428, -0.212346, 0.864198, -1.882290, -0.110607],
    [0.088272, 0.520988, -0.463889, -0.377778, 0.785360, 8.095795]
]
probabilities = [0.8, 0.2]
N = 100000
```

**Expected Output Characteristics**:
- Connected curve with no self-intersections  
- Dragon-like appearance with recursive structure
- Finite area enclosed
- Specific bounding box dimensions

### Chaotic Map Test Case

**Input Parameters**:
```python
# Example chaotic quadratic map
x_coeffs = [0.2, -0.8, -0.37, -0.69, -0.34, -0.65]
y_coeffs = [0.14, 0.67, 0.66, -0.50, -0.22, -0.28]
N_test = 70000
N_plot = 50000
```

**Expected Output Characteristics**:
- Positive maximum Lyapunov exponent (> 0.0001)
- Bounded attractor (all points within reasonable range)
- Non-integer fractal dimension
- Complex, non-periodic pattern

### Validation Criteria

**Chaos Game Algorithms**:
1. **Convergence**: Points should converge to expected fractal pattern within 1000 iterations
2. **Self-similarity**: Zooming into regions should show similar patterns
3. **Rule compliance**: Vertex selection should respect specified rules
4. **Boundary adherence**: Points should remain within convex hull of vertices

**IFS Algorithms**:
1. **Transformation accuracy**: Each transformation should apply correctly
2. **Probability distribution**: Transformation selection should match specified probabilities
3. **Convergence**: Pattern should stabilize after sufficient iterations
4. **Boundedness**: Points should remain within expected bounds

**Chaotic Maps**:
1. **Lyapunov positivity**: At least one Lyapunov exponent > threshold
2. **Boundedness**: Trajectory should remain bounded
3. **Non-periodicity**: Should not converge to fixed points or simple cycles
4. **Fractal dimension**: Should be non-integer between 1 and 2

## Optimization Techniques

### Numba JIT Compilation

**Purpose**: Accelerate Python numerical computations

**Implementation**: All core mathematical functions use `@njit` decorator

**Performance Impact**: 
- 10-100x speedup for iterative algorithms
- Near C-level performance for numerical operations
- Automatic parallelization where applicable

**Key Optimized Functions**:
- `getPointsV`: Main chaos game iteration
- `getPointsAdv`: IFS iteration  
- `test`: Lyapunov exponent calculation
- `iterate`: Map iteration for plotting

### Memory Management

**Pre-allocation**: All output arrays pre-allocated to avoid dynamic resizing

**Example**:
```python
pts = np.zeros((N, 3))  # Pre-allocate result array
```

**Data Types**: Explicit dtype specification for optimal memory usage

### Datashader Acceleration

**Purpose**: Handle large point clouds (>1M points) efficiently

**Benefits**:
- Fixed-time rendering regardless of point count
- Automatic density aggregation
- GPU acceleration where available
- Memory-efficient point cloud processing

**Trade-offs**: 
- Fixed resolution output
- Less interactive than scatter plots
- Some detail loss in sparse regions

### Rule System Optimization

**Heap Structure**: Circular buffer for tracking vertex history

**Bit Operations**: Efficient modular arithmetic for vertex calculations

**Early Termination**: Rule checking optimized to exit early when possible

## Implementation Notes for Rust/WebAssembly

### Critical Dependencies

**Mathematical Libraries**:
- Random number generation with seedable state
- Linear algebra operations (matrix multiplication, vector operations)
- Trigonometric functions (sin, cos for rotations)

**Memory Management**:
- Efficient array allocation and indexing
- SIMD vectorization opportunities in iteration loops

**Parallelization Opportunities**:
- Independent point generation in chunks
- Parallel map testing for chaos finder
- Concurrent fractal generation for different parameter sets

### Performance Considerations

**Hot Paths**:
1. Main iteration loops in chaos game and IFS algorithms
2. Lyapunov exponent calculation inner loops  
3. Point coordinate transformations
4. Random number generation and vertex selection

**Optimization Priorities**:
1. Minimize heap allocations in inner loops
2. Use efficient random number generators
3. Leverage SIMD for vector operations
4. Consider WebAssembly threading for multi-core systems

### Data Structure Mapping

**Python Arrays → Rust Vectors**:
- `numpy.ndarray` → `Vec<f64>` or fixed-size arrays
- 2D arrays → `Vec<Vec<f64>>` or flattened with index calculation

**Rule System → Rust Structs**:
- Maintain circular buffer semantics
- Implement trait-based rule checking

**Color Mapping → WebGL Integration**:
- Point cloud data passed to JavaScript
- Color mapping handled in WebGL shaders for performance