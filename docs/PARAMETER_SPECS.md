# Algorithm Parameter Specifications

This document provides detailed parameter specifications for all fractal generation algorithms implemented in the Python codebase, including data types, ranges, default values, and constraints.

## Data Type Definitions

### Python Data Types
- `float`: 64-bit floating point number (Python standard)
- `int`: Integer values (Python standard)
- `bool`: Boolean value (True/False)
- `numpy.ndarray`: N-dimensional array for coordinates and transformations
- `list`: Python list for collections

### Data Structures
- **Point coordinates**: Represented as numpy arrays or tuples (x, y) or (x, y, z)
- **Vertices**: numpy.ndarray with shape (n_vertices, 2) for 2D coordinates
- **Transformation parameters**: numpy.ndarray with shape (n_transforms, 2) containing [compression_ratio, rotation_angle]
- **Rule objects**: Custom objects from `chaostech.Rule` module for vertex selection constraints
- **Probability arrays**: numpy.ndarray or list containing relative weights for transformation selection

## Chaos Game Algorithm Parameters

### Core Function: `getPointsV`

**Location**: `Fractal.py:311-341`

```python
def getPointsV(vs, x0, y0, N, ifs, T, rule):
    """
    The classic fractal iterator. 
    
    Parameters:
    - vs (numpy.ndarray): Array of vertices defining the polygon
    - x0, y0 (float): Initial starting coordinates  
    - N (int): Number of iterations/points to generate
    - ifs: Deprecated parameter, should be None
    - T (numpy.ndarray): Transformation parameters with shape (n_transforms, 2)
                        containing [compression_ratio, rotation_angle] 
    - rule (Rule): Rule object from chaostech.Rule defining selection constraints
    
    Returns:
    - numpy.ndarray: Array with shape (N, 3) where each row is [x, y, 0]
    """
```

#### Parameter Details

**vs**: `numpy.ndarray`
- **Description**: Array of vertices defining the polygon shape
- **Shape**: `(n_vertices, 2)` where each row is `[x, y]` coordinates
- **Constraints**: 
  - Minimum 3 vertices for meaningful fractals
  - Maximum 1000 vertices (practical limit)
  - Vertices should form a non-degenerate polygon
- **Example**: `np.array([[0.0, 0.866], [-0.5, 0.0], [0.5, 0.0]])` (equilateral triangle)

**x0, y0**: `float`
- **Description**: Starting point coordinates for iteration
- **Constraints**: 
  - Should be within or near the convex hull of vertices
  - Typical range: [-10.0, 10.0] for both x and y
- **Default**: `(0.0, 0.0)`

**N**: `int`
- **Description**: Number of fractal points to generate
- **Constraints**: 
  - Minimum: 100
  - Maximum: 100,000,000 (limited by memory)
  - Recommended: 10,000 - 1,000,000
- **Default**: `10000`

**T**: `numpy.ndarray`
- **Description**: Transformation parameters array
- **Shape**: `(n_transforms, 2)` where each row is `[compression_ratio, rotation_angle]`
- **Compression ratio constraints**: 
  - Range: (0.0, 1.0) - exclusive bounds
  - Typical values: 0.3 to 0.8
  - Common values: 0.5 (Sierpinski), 2/3 (Vicsek)
- **Rotation angle constraints**:
  - Range: [0.0, 2π] radians
  - Usually small values: 0.0 to 0.5
- **Default**: `np.array([[0.5, 0.0]])` (50% compression, no rotation)

**rule**: `Rule` object
- **Description**: Object from `chaostech.Rule` defining vertex selection constraints
- **Attributes**:
  - Controls which vertices can be selected based on previous choices
  - Implements rules like "cannot select same vertex twice" or "forbidden distances"
- **Default**: Rule object with no restrictions

### Specific Algorithm Parameters

#### Sierpinski Triangle (`sierpt`)
**Location**: `Fractal.py:433-438`

```python
# Configuration used in sierpt() function
vertices = equilateral_triangle_vertices()  # 3 vertices forming triangle
T = np.array([[0.5, 0.0]])  # 50% compression, no rotation
rule = basic_rule()  # No special restrictions
# Default N varies, typically 10,000-100,000
```

#### Vicsek Square (`vicsek`) 
**Location**: `Fractal.py:450-456`

```python
# Configuration used in vicsek() function  
vertices = square_with_center_vertices()  # 5 vertices (4 corners + center)
T = np.array([[2.0/3.0, 0.0]])  # 2/3 compression ratio
rule = basic_rule()  # No special restrictions
# Uses center stacking to create 5 target points
```

#### T-Square (`tsquare`)
**Location**: `Fractal.py:459-465`

```python
# Configuration used in tsquare() function
vertices = unit_square_vertices()  # 4 vertices forming square
T = np.array([[0.5, 0.0]])  # 50% compression ratio  
rule = offset_rule(length=1, offset=2)  # Cannot select vertex 2 positions away
```

## Iterated Function System (IFS) Parameters

### Core Function: `getPointsAdv`

**Location**: `Fractal.py:288-308`

```python
def getPointsAdv(N, p, f, args, chooser, selector, iterator, probs):
    """
    Advanced fractal iterator with user-defined transformation functions.
    
    Parameters:
    - N (int): Number of points to generate
    - p (numpy.ndarray): Initial point [x, y, z]
    - f (function): Transformation function applied to points
    - args: Transformation parameters (usually numpy.ndarray)
    - chooser (function): Function to select transformation index from probabilities
    - selector (function): Function to select transformation parameters by index
    - iterator (function): Function to modify parameters (usually identity)
    - probs (numpy.ndarray or list): Probability weights for transformation selection
    
    Returns:
    - numpy.ndarray: Array with shape (N, 3) containing generated points
    """
```

#### Parameter Details

**N**: `int`
- **Description**: Number of points to generate
- **Constraints**: Same as chaos game
- **Recommended**: 50,000 - 500,000 for detailed IFS

**p**: `numpy.ndarray`
- **Description**: Initial point for iteration
- **Shape**: `(3,)` array containing `[x, y, z]` coordinates
- **Default**: `np.array([0.0, 0.0, 0.0])`

**f**: `function`
- **Description**: Transformation function that applies affine transformations
- **Signature**: `f(params, x, y, z) -> numpy.ndarray`
- **Example**: Function that applies 6-parameter affine transformation

**args**: `numpy.ndarray`
- **Description**: Array containing all transformation parameters
- **Shape**: `(n_transformations, n_parameters)` 
- **For affine transformations**: Each row contains 6 parameters `[a, b, c, d, e, f]`
- **Constraints**: Transformations should be contractive for convergence

**chooser**: `function`
- **Description**: Function to randomly select transformation index
- **Signature**: `chooser(probabilities) -> int`
- **Typical implementation**: Weighted random selection based on probabilities

**selector**: `function`
- **Description**: Function to retrieve transformation parameters by index
- **Signature**: `selector(args, index) -> numpy.ndarray`
- **Typical implementation**: `lambda args, i: args[i]`

**iterator**: `function`
- **Description**: Function to modify transformation parameters (usually identity)
- **Signature**: `iterator(params) -> numpy.ndarray`
- **Default**: `lambda x: x` (no modification)

**probs**: `numpy.ndarray` or `list`
- **Description**: Probability weights for selecting each transformation
- **Constraints**:
  - Length must equal number of transformations
  - All values must be positive
  - Will be normalized automatically if sum ≠ 1.0
- **Example**: `[0.01, 0.07, 0.07, 0.85]` (Barnsley fern)

### Transformation Parsing Modes

**Location**: `transform_components.py:366-387`

The IFS implementation supports two modes for interpreting 6-parameter affine transformations:

#### Regular Mode (`parse='regular'`)
```python
# Parameters: [a, b, c, d, e, f]
# Applied as:
# x_new = a*x + b*y + c  
# y_new = d*x + e*y + f
```

#### Borke Mode (`parse='borke'`)  
```python
# Parameters: [a, b, c, d, e, f]
# Applied as:
# x_new = a*x + b*y + e
# y_new = c*x + d*y + f
```

### Predefined IFS Parameters

#### Barnsley Fern (`FERN`)
**Location**: `transform_components.py:30-34`

```python
transformations = np.array([
    [0.0,  0.0,  0.0,  0.16, 0.0, 0.0],   # Stem
    [0.2, -0.26, 0.23, 0.22, 0.0, 1.6],   # Small leaflets  
    [-0.15, 0.28, 0.26, 0.24, 0.0, 0.44], # Large leaflets
    [0.85, 0.04, -0.04, 0.85, 0.0, 1.6],  # Main structure
])
probabilities = [0.01, 0.07, 0.07, 0.85]
parsing_mode = 'borke'
```

#### Dragon Curve (`DRAGON`)
**Location**: `transform_components.py:22-23`

```python  
transformations = np.array([
    [0.824074, 0.281428, -0.212346, 0.864198, -1.882290, -0.110607],
    [0.088272, 0.520988, -0.463889, -0.377778, 0.785360, 8.095795],
])
probabilities = [0.8, 0.2]
parsing_mode = 'borke'
```

#### Maple Leaf (`LEAF`)
**Location**: `transform_components.py:36-40`

```python
transformations = np.array([
    [0.14, 0.01,  0.0,  0.51, -0.08, -1.31],
    [0.43, 0.52, -0.45, 0.5,   1.49, -0.75],  
    [0.45, -0.49, 0.47, 0.47, -1.62, -0.74],
    [0.49, 0.0,   0.0,  0.51,  0.02,  1.62],
])
probabilities = [0.25, 0.25, 0.25, 0.25]
parsing_mode = 'borke'
```

## Chaotic Map Generation Parameters

### Core Function: `test`

**Location**: `ChaosFinder.py:149-252`

```python
def test(args1, args2, n, N, thresh, kind='quadratic'):
    """
    Calculate Lyapunov exponents to detect chaotic behavior in 2D discrete maps.
    
    Parameters:
    - args1 (numpy.ndarray): Coefficients for x-equation
    - args2 (numpy.ndarray): Coefficients for y-equation  
    - n (int): Number of transient iterations to discard
    - N (int): Number of iterations for Lyapunov calculation
    - thresh (float): Threshold for detecting unbounded trajectories
    - kind (str): Map type - 'quadratic' or 'cubic'
    
    Returns:
    - tuple: (max_lyapunov_exponent, min_lyapunov_exponent, fractal_dimension)
    """
```

#### Parameter Details

**args1, args2**: `numpy.ndarray`
- **Description**: Coefficient arrays for the x and y equations of the discrete map
- **For quadratic maps**: 6 coefficients each
  - `args1 = [a1, b1, c1, d1, e1, f1]` for equation: `x' = a1 + b1*x + c1*x² + d1*x*y + e1*y + f1*y²`
  - `args2 = [a2, b2, c2, d2, e2, f2]` for equation: `y' = a2 + b2*x + c2*x² + d2*x*y + e2*y + f2*y²`
- **For cubic maps**: 10 coefficients each (additional x³, x²y, xy², y³ terms)
- **Range**: Typically [-1.2, 1.2] for each coefficient
- **Constraints**: Parameters should not cause immediate divergence

**n**: `int`
- **Description**: Number of initial iterations to discard (transient period)
- **Purpose**: Allow trajectory to reach the attractor before Lyapunov calculation
- **Constraints**: 
  - Minimum: 100
  - Recommended: 1,000 - 5,000
  - Default in codebase: 1,000

**N**: `int`
- **Description**: Number of iterations for Lyapunov exponent calculation
- **Constraints**: 
  - Minimum: 10,000 for reasonable accuracy
  - Recommended: 50,000 - 100,000
  - Default in codebase: 70,000
- **Trade-off**: Higher values give more accurate results but take longer

**thresh**: `float`
- **Description**: Threshold for detecting divergent (unbounded) trajectories
- **Default**: `1e6`
- **Purpose**: Reject parameter sets that cause trajectory explosion
- **Implementation**: Function returns early if |x| > thresh or |y| > thresh

**kind**: `str`
- **Description**: Type of discrete map to analyze
- **Options**:
  - `'quadratic'`: 2D quadratic polynomial map (6 parameters per equation)
  - `'cubic'`: 2D cubic polynomial map (10 parameters per equation)
- **Default**: `'quadratic'`

### Parameter Generation Functions

#### Random Parameter Generation

**Continuous Mode** - `get_random_args(n)`
**Location**: `ChaosFinder.py:28-29`

```python
def get_random_args(n):
    """Generate n random coefficients from uniform distribution [-1.2, 1.2]"""
    return 2.4 * np.random.rand(n) - 1.2
```

**Discrete Mode** - `get_random_args_(n)`  
**Location**: `ChaosFinder.py:31-35`

```python
def get_random_args_(n):
    """Generate n random coefficients from discrete set with 0.1 step size"""
    args = np.zeros(n)
    for i in range(n):
        args[i] = round(-1.2 + np.random.randint(25) * 0.1, 1)
    return args
```

#### Bounded Trajectory Check

**Function**: `check_unbounded(x, y, thresh)`
**Location**: `ChaosFinder.py:37-45`

```python
@njit
def check_unbounded(x, y, thresh):
    """
    Check if trajectory has become unbounded or invalid.
    Returns True if |x| > thresh, |y| > thresh, or values are NaN/infinite.
    """
    return (abs(x) > thresh or abs(y) > thresh or
            math.isnan(x) or math.isnan(y) or  
            math.isinf(x) or math.isinf(y))
```

### Map Testing Workflow

The typical workflow for finding chaotic maps in the Python codebase:

1. **Generate random parameters** using `get_random_args()` or `get_random_args_()`
2. **Test for chaos** using `test()` function with generated parameters
3. **Check Lyapunov exponents** - positive maximum indicates chaos
4. **Validate trajectory** - ensure it remains bounded during testing
5. **Calculate fractal dimension** using Kaplan-Yorke conjecture if chaotic

#### Example Usage Pattern

```python
# Generate random quadratic map parameters
args1 = get_random_args(6)  # x-equation coefficients
args2 = get_random_args(6)  # y-equation coefficients

# Test for chaos
max_le, min_le, frac_dim = test(args1, args2, n=1000, N=70000, thresh=1e6, kind='quadratic')

# Check if chaotic (positive maximum Lyapunov exponent)
is_chaotic = max_le > 1e-4

# Calculate fractal dimension using Kaplan-Yorke
if is_chaotic:
    dimension = fractal_dimension(max_le, min_le)
```

## Color Mapping and Visualization Parameters

### Datashader Integration

**Location**: `ChaosFinder.py:7-12` (imports) and various plotting functions

The Python codebase uses datashader for efficient visualization of large point clouds:

```python
import datashader as ds
import pandas as pd
import colorcet as cc
import matplotlib.pyplot as plt
from matplotlib import cm
```

### Point Cloud Visualization

#### Data Preparation
```python
# Convert points to pandas DataFrame for datashader
df = pd.DataFrame({'x': points[:, 0], 'y': points[:, 1]})

# Create datashader canvas
canvas = ds.Canvas(plot_width=1500, plot_height=1500)

# Aggregate points into density grid  
aggregated = canvas.points(df, 'x', 'y')
```

#### Color Mapping Options

**Standard matplotlib colormaps**:
- `'viridis'`: Purple-blue-green-yellow (default for many plots)
- `'plasma'`: Purple-pink-yellow  
- `'fire'`: Black-red-orange-yellow
- `'jet'`: Blue-cyan-yellow-red (classic but not perceptually uniform)

**Colorcet color maps** (from `cc` module):
- High-quality perceptually uniform color maps
- Better for scientific visualization
- Examples: `cc.fire`, `cc.bmw`, `cc.kbc`

#### Canvas Parameters

**plot_width, plot_height**: `int`
- **Description**: Output image dimensions in pixels
- **Typical values**: 1000-2000 pixels per dimension
- **Default in codebase**: Usually 1500x1500
- **Constraints**: Limited by available memory

**x_range, y_range**: `tuple` (optional)
- **Description**: Explicit bounds for the visualization
- **Format**: `(min_value, max_value)` for each axis
- **Default**: Auto-calculated from data with padding

#### Aggregation and Shading

```python
# Basic point aggregation (counts per pixel)
agg = canvas.points(df, 'x', 'y')

# Apply logarithmic scaling for better contrast
import datashader.transfer_functions as tf
img = tf.shade(agg, cmap=colormap, how='log')

# Convert to displayable format
img_array = tf.set_background(img, 'black')
```

**Aggregation methods**:
- **Linear**: Direct point counts (can saturate quickly)
- **Logarithmic**: `how='log'` - Better for high-density regions
- **Histogram equalization**: `how='eq_hist'` - Adaptive contrast

**Background options**:
- `'black'`: Standard dark background
- `'white'`: Light background for publication
- Custom RGB tuples: `(r, g, b)` values 0-255

### Bounds Calculation

The Python codebase automatically calculates appropriate bounds for visualization:

```python
# Calculate data bounds with padding
x_min, x_max = np.min(points[:, 0]), np.max(points[:, 0])
y_min, y_max = np.min(points[:, 1]), np.max(points[:, 1])

# Add padding (typically 5-10% of data range)
x_range = x_max - x_min
y_range = y_max - y_min
padding_factor = 0.05

x_bounds = (x_min - padding_factor * x_range, x_max + padding_factor * x_range)
y_bounds = (y_min - padding_factor * y_range, y_max + padding_factor * y_range)
```

**padding_factor**: `float`
- **Description**: Fraction of data range to add as padding around the fractal
- **Range**: [0.0, 1.0] 
- **Typical values**: 0.05 (5%) to 0.1 (10%)
- **Purpose**: Prevent fractal from touching image edges

## Performance and Memory Parameters

### Numba JIT Compilation

Many core functions use `@njit` decorator for performance:

```python
from numba import njit

@njit
def getPointsV(vs, x0, y0, N, ifs, T, rule):
    # Function body compiled to machine code
```

**Benefits**:
- 10-100x speedup for numerical computations
- Particularly effective for iteration-heavy algorithms
- Automatic parallelization opportunities

### Memory Management

**Point generation batching**:
- Large fractals (N > 1M points) may need memory management
- Consider processing in chunks to avoid memory exhaustion
- Datashader handles large datasets efficiently through aggregation

**Typical memory usage**:
- 1M points ≈ 24MB (3 floats × 8 bytes × 1M)
- 10M points ≈ 240MB
- 100M points ≈ 2.4GB

### Random Number Generation

**NumPy random state**:
```python
# For reproducible results
np.random.seed(12345)

# For true randomness
np.random.seed(None)  # or simply omit seed
```

**Performance considerations**:
- NumPy's random number generation is optimized
- Numba-compiled functions support numpy random calls
- For extreme performance, consider custom PRNG implementations

## Validation and Error Handling

### Parameter Validation in Python

The Python codebase includes several validation functions:

#### Bounded Trajectory Validation
```python
@njit
def check_unbounded(x, y, thresh):
    """Check if trajectory has become unbounded or invalid"""
    return (abs(x) > thresh or abs(y) > thresh or
            math.isnan(x) or math.isnan(y) or  
            math.isinf(x) or math.isinf(y))
```

#### Transformation Parameter Validation  
```python
@njit
def test_params(a, b, c, d, e, f):
    """Test if affine transformation parameters are contractive"""
    c1 = (a**2 + d**2) < 1
    c2 = (b**2 + e**2) < 1
    c3 = (a**2 + b**2 + d**2 + e**2) < (1 + (a*e - d*b)**2)
    return (c1 and c2 and c3)
```

### Common Validation Rules

1. **Range Validation**: Ensure numeric parameters are within specified ranges
2. **Array Shape Validation**: Verify arrays have expected dimensions and lengths  
3. **Transformation Contractivity**: Check that IFS transformations are contractive
4. **Memory Safety**: Prevent parameter combinations that could cause excessive memory usage
5. **Mathematical Validity**: Ensure parameters don't cause NaN/infinity in calculations

### Error Handling Patterns

```python
# Typical error handling in Python functions
def generate_fractal(vertices, N, T):
    if len(vertices) < 3:
        raise ValueError("Need at least 3 vertices for meaningful fractal")
    
    if N <= 0:
        raise ValueError("Number of iterations must be positive")
        
    if not isinstance(T, np.ndarray) or T.shape[1] != 2:
        raise ValueError("Transformation array must have shape (n, 2)")
    
    # Proceed with generation
    return getPointsV(vertices, 0, 0, N, None, T, basic_rule())
```

### Performance Considerations for Validation

- **Numba compatibility**: Validation functions using `@njit` for performance
- **Early termination**: Functions return early when invalid conditions detected
- **Minimal overhead**: Validation optimized to not significantly impact generation speed
- **Memory efficiency**: Avoid creating large temporary arrays during validation

This parameter specification serves as a comprehensive reference for the Python fractal generation codebase, providing all necessary details for understanding the current implementation and supporting future migration to other languages while preserving the mathematical rigor and performance optimizations of the original code.