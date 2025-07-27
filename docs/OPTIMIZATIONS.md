# Optimization Techniques and Special Features Documentation

This document details the optimization techniques, special algorithms, and advanced features found in the Python fractal generator codebase that should be preserved or improved upon in the Rust/WebAssembly implementation.

## Performance Optimizations

### 1. Numba JIT Compilation

**Implementation**: All performance-critical functions use the `@njit` decorator from Numba.

**Files Affected**:
- `Fractal.py`: Core iteration functions
- `ChaosFinder.py`: Lyapunov exponent calculations
- `chaostech/MathTech.py`: Mathematical utilities
- `chaostech/Rule.py`: Rule system implementation

**Performance Impact**:
- 10-100x speedup over pure Python
- Near C-level performance for numerical operations
- Automatic type inference and optimization
- SIMD vectorization where applicable

**Critical Functions**:
```python
@njit  # Numba JIT compilation
def getPointsV(vs, x0, y0, N, ifs, T, rule):
    # Main chaos game iteration loop
    # Processes millions of points efficiently
```

**Rust Implementation Notes**:
- Rust's native performance should match or exceed Numba-optimized Python
- Focus on compiler optimizations and SIMD intrinsics
- Consider manual loop unrolling for critical paths

### 2. Memory Pre-allocation

**Strategy**: Pre-allocate all output arrays to exact sizes to avoid dynamic resizing.

**Examples**:
```python
pts = np.zeros((N, 3))  # Pre-allocate exact size needed
```

**Benefits**:
- Eliminates memory allocation overhead during iteration
- Improves cache locality
- Reduces garbage collection pressure

**Rust Implementation**:
```rust
let mut points: Vec<Point2D> = Vec::with_capacity(iterations as usize);
```

### 3. Optimized Data Structures

#### Circular Buffer for Rule History
**Location**: `chaostech/Rule.py`

**Implementation**:
```python
@jitclass(spec)
class Rule(object):
    def __init__(self, num=0, offset=0, symmetry=False):
        self.heap = get_heap(num)  # Circular buffer
        
    def add(self, e):
        # Efficient circular buffer update
        for i in range(self.ln-1):
            self.heap[i] = self.heap[i+1]
        self.heap[self.ln-1] = e
```

**Optimization Benefits**:
- O(1) amortized insertion
- Fixed memory usage regardless of iteration count
- Cache-friendly access patterns

#### Efficient Random Number Generation
**Location**: `chaostech/MathTech.py`

**Optimized Choice Function**:
```python
@njit
def random_choice_fix(i, p, hard=True, soft=False):
    # Optimized probability-weighted selection
    arr = np.arange(i)
    sum_ = np.sum(p)
    if hard and sum_ != 1.:
        p = p/sum_  # Normalize probabilities
    return arr[np.searchsorted(np.cumsum(p), np.random.random(), side="right")]
```

### 4. Trigonometric Optimization

**Pre-computed Trigonometry**:
```python
@njit
def to_trig(T):
    # Pre-compute sin/cos values to avoid repeated calculations
    T_ = np.zeros((s, 3))
    for i in range(s):
        T_[i, 0] = T[i, 0]  # compression ratio
        theta = T[i, 1]      # angle
        T_[i, 1] = np.cos(theta)  # pre-computed cosine
        T_[i, 2] = np.sin(theta)  # pre-computed sine
    return T_
```

**Usage in Main Loop**:
```python
k, COS, SIN = T_[vi % lnt]
rot = rotate_(diffx, diffy, COS, SIN)  # Use pre-computed values
```

## Datashader Integration Optimizations

### 1. Large-Scale Point Cloud Handling

**Purpose**: Handle point clouds with millions of points efficiently for visualization.

**Implementation**: `app.py` lines 177-183, 400-402

**Process**:
```python
# Automatic bounds calculation
xbounds = (pts[:, 0].min()-0.2, pts[:, 0].max()+0.2)
ybounds = (pts[:, 1].min()-0.2, pts[:, 1].max()+0.2)

# High-resolution canvas
cvs = ds.Canvas(plot_width=1500, plot_height=1500, 
                x_range=xbounds, y_range=ybounds)

# Efficient point aggregation
agg = cvs.points(df, 'x', 'y')

# Logarithmic density mapping
img = ds.tf.set_background(ds.tf.shade(agg, how="log", cmap=cc.fire), "black")
```

**Performance Benefits**:
- O(1) rendering time regardless of point count (after aggregation)
- Automatic density-based coloring
- Memory-efficient handling of large datasets
- GPU acceleration where available

### 2. Fast Plotting Mode

**Implementation**: Global state management for incremental updates

**Key Variables**:
```python
fast_prev_pts = None     # Cache previous points
fast_prev_N = math.inf   # Cache previous iteration count
prev_was_fast = False    # Track fast mode state
```

**Incremental Update Logic**:
```python
def fast_plot_chaos_game(p, need_full_update):
    if prev_was_fast and not need_full_update:
        if N > fast_prev_N:
            # Append new points to existing data
            N_new = N - fast_prev_N
            pts = f.getPointsV(vs, x0, y0, N_new+1, None, T, heap)[1:]
            pts = np.append(fast_prev_pts, pts, axis=0)
```

**Benefits**:
- Avoids full regeneration for parameter changes
- Enables real-time parameter adjustment
- Reduces computation for interactive applications

## Advanced Algorithm Features

### 1. Adaptive Chaos Detection

**Location**: `ChaosFinder.py:149-252`

**Multi-stage Validation**:
```python
def test(args1, args2, n, N, thresh, kind='quadratic'):
    # Stage 1: Transient elimination
    for _ in range(n):
        # Discard initial points to reach attractor
        
    # Stage 2: Lyapunov exponent calculation with Gram-Schmidt
    for _ in range(N):
        # Apply map transformation
        # Calculate Jacobian matrix  
        # Gram-Schmidt orthogonalization
        # Update Lyapunov estimates
        
    # Stage 3: Quality checks
    if check_unbounded(x,y,thresh): return [-1,-1,-1]
    if check_movement(x,y,xp,yp): count += 1
```

**Sophisticated Boundedness Detection**:
```python
@njit
def check_unbounded(x, y, thresh):
    return (abs(x) > thresh or abs(y) > thresh or
            math.isnan(x) or math.isnan(y) or
            math.isinf(x) or math.isinf(y))
```

### 2. Fractal Dimension Calculation

**Kaplan-Yorke Conjecture Implementation**:
```python
def fractal_dimension(maxLE, minLE):
    if maxLE < 0.0:
        return 0.0
    else:
        sum_ = maxLE + minLE
        if sum_ > 0.0:
            j = 2.0
            pos_sum = sum_
        else:
            j = 1.0  
            pos_sum = maxLE
        return j + (pos_sum / abs(minLE))
```

**Usage in Chaos Validation**:
```python
def exclude(maxLE, minLE, C, fd, thresh=0.):
    return maxLE <= thresh or abs(fd - 1.) < 0.11  # Avoid integer dimensions

def exclude_cubic(maxLE, minLE, C, fd, thresh=0.):
    exclude = maxLE <= thresh
    for i in [1., 2.]:
        exclude = exclude or abs(fd - i) < 0.11  # Avoid dimensions 1 and 2
    return exclude
```

### 3. Multi-mode Parameter Generation

**Continuous vs Discrete Parameter Sets**:
```python
def get_random_args(n):
    # Continuous mode: uniform distribution
    return 2.4*np.random.rand(n)-1.2

def get_random_args_(n):
    # Discrete mode: quantized parameter space
    args = np.zeros(n)
    for i in range(n):
        args[i] = round(-1.2 + np.random.randint(25)*0.1, 1)
    return args
```

**Adaptive Search Strategy**:
```python
while condition(maxLE, minLE, C, fd, thresh=LE_thresh):
    try:
        args1, args2 = randomizer()
        maxLE, minLE, C = test(args1, args2, N_trans, N_test, thresh, kind)
        fd = fractal_dimension(maxLE, minLE)
    except ZeroDivisionError:
        maxLE = -1  # Handle numerical instability gracefully
```

## Specialized Geometric Functions

### 1. Polygon Generation and Manipulation

**Regular Polygon Generation**:
```python
@njit
def get_polygon(num, scale=1, recenter=True):
    pts = np.zeros((num,2))
    dtheta = 2*PI / float(num)
    # Generate vertices using polar coordinates
    for i in range(1, num):
        theta += dtheta
        dx = np.cos(theta)
        dy = np.sin(theta)
        x += scale*dx
        y += scale*dy
        pts[i] = np.array([x, y])
    return recenter_(pts, num) if recenter else pts
```

**Midpoint Stacking**:
```python
@njit
def stack_midpoints(vertices):
    # Double vertex count by adding midpoints
    s = vertices.shape[0]
    s_ = (s*2)
    vs = np.zeros((s_, 2))
    for i in range(s_):
        if i % 2 == 0:
            vs[i] = vertices[int(i/2)]  # Original vertex
        else:
            p1 = vertices[int((i-1)/2)]
            p2 = vertices[int((i+1)/2)]
            vs[i] = get_midpoint(p1, p2)  # Computed midpoint
```

### 2. 3D Extensions

**3D Polygon Generation**:
```python
@njit
def get_prism(num=4, scale=1):
    btm = pad(get_polygon(num))      # Bottom face
    top = pad(get_polygon(num))      # Top face
    add_to_axis(btm, -0.5, 2)       # Offset bottom
    add_to_axis(top, 0.5, 2)        # Offset top
    # Combine into single vertex array
```

**3D Rotation Matrices**:
```python
@njit
def get_3D_rotn_matrix(a, b, c):
    # Full 3D rotation matrix with Euler angles
    COSA, SINA = np.cos(a), np.sin(a)
    COSB, SINB = np.cos(b), np.sin(b)  
    COSC, SINC = np.cos(c), np.sin(c)
    # Construct rotation matrix
```

## Interactive Features and State Management

### 1. Real-time Parameter Adjustment

**Global State Tracking**:
```python
default_params = {"poly": 3, "N": 10000, "ln": 0, "sym": False, "offset": 0, 
                 "jump": "1/2", "midpoints": False, "center": False, "fig_json":None}

# Preset configurations for instant loading
presets = {"sierpt": sierpt, "sierpc":sierpc, "vicsek":vicsek, 
          "tsquare": tsquare, "techs": techs, "webs": webs, "XTREME": XTREME}
```

**Incremental Update Logic**:
```python
def update_fig(p):
    if not p["fig_json"] or prev_was_fast: 
        return raw_figure(...)  # Full regeneration
    
    # Incremental update for small changes
    oldfig = go.Figure(p["fig_json"])
    # Update only changed data, keep visualization state
```

### 2. Smart Iteration Management

**Adaptive Iteration Strategy**:
```python
def iterations_callback(p):
    oldN = len(sizeT)
    if oldN < N:  # Increase iterations
        # Continue from last point
        x0 = oldfig['data'][0]['x'][oldN-1]
        y0 = oldfig['data'][0]['y'][oldN-1]
        N = N-oldN
        pts = f.getPointsV(vs, x0, y0, N+1, None, T, heap)
        # Append new points to existing data
    elif 0<=oldN-N<5:  # Small decrease
        # Simply truncate existing data
    else:  # Large decrease
        # Full regeneration more efficient
```

## Error Handling and Robustness

### 1. Numerical Stability

**Boundary Checking**:
```python
@njit  
def check_movement(x,y,xp,yp):
    # Detect fixed points and numerical stagnation
    return (abs(x-xp) < 1e-16 or abs(y-yp) < 1e-16)
```

**Graceful Degradation**:
```python
try:
    maxLE, minLE, C = test(args1, args2, ntrans, N_test, thresh, kind)
    fd = fractal_dimension(maxLE, minLE)
except ZeroDivisionError:
    maxLE, minLE, C, fd = -1,-1,-1,-1  # Signal failure
```

### 2. Memory Management

**Automatic Memory Cleanup**:
```python
def reset_fast_globals():
    global fast_prev_N, fast_prev_pts, prev_was_fast
    fast_prev_pts = None    # Clear cached data
    fast_prev_N = math.inf
    prev_was_fast = False
```

## Implementation Recommendations for Rust

### 1. Performance-Critical Optimizations

**SIMD Vectorization**:
- Use `std::simd` or `packed_simd` for point transformations
- Vectorize coordinate calculations in main loops
- Consider autovectorization hints for compiler

**Memory Layout Optimization**:
```rust
#[repr(C)]
struct Point2D {
    x: f64,
    y: f64,
}

// Structure of Arrays for better cache behavior
struct PointCloud {
    x_coords: Vec<f64>,
    y_coords: Vec<f64>,
}
```

### 2. Async/Parallel Processing

**Multi-threading Strategy**:
- Separate point generation into chunks
- Parallel processing for independent iterations
- Lock-free data structures where possible

**WebAssembly Threading**:
- Use SharedArrayBuffer for large point clouds
- Web Workers for background computation
- Progressive rendering for large datasets

### 3. Advanced Features to Preserve

**Adaptive Quality**:
- Implement iteration budget system
- Quality-based early termination
- Progressive refinement for interactive use

**State Management**:
- Efficient diff-based updates
- Immutable parameter structures
- Rollback capability for experimentation

The optimization techniques documented here represent years of refinement in the Python implementation and should be carefully preserved and enhanced in the Rust/WebAssembly version to achieve maximum performance and usability.