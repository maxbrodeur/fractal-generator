# Algorithm Parameter Specifications

This document provides detailed parameter specifications for all fractal generation algorithms, including data types, ranges, default values, and constraints.

## Data Type Definitions

### Basic Types
- `f64`: 64-bit floating point number
- `i32`: 32-bit signed integer
- `bool`: Boolean value (true/false)
- `Array2D<f64>`: 2D array of f64 values
- `Vec<f64>`: Vector of f64 values

### Custom Types
```rust
struct Point2D {
    x: f64,
    y: f64,
}

struct Point3D {
    x: f64,
    y: f64,
    z: f64,
}

struct Rule {
    length: i32,      // Number of previous choices to track
    offset: i32,      // Forbidden offset from last vertex
    symmetry: bool,   // Whether to apply symmetric restrictions
}

struct Transformation {
    a: f64, b: f64, c: f64,  // First row: x_new = a*x + b*y + c
    d: f64, e: f64, f: f64,  // Second row: y_new = d*x + e*y + f
}

struct ColorMap {
    name: String,
    values: Vec<(f64, f64, f64)>,  // RGB values from 0.0 to 1.0
}
```

## Chaos Game Algorithm Parameters

### Core Function: `chaos_game_generate`

```rust
pub fn chaos_game_generate(
    vertices: &[Point2D],           // Polygon vertices
    initial_point: Point2D,         // Starting point
    iterations: i32,                // Number of points to generate
    compression_ratio: f64,         // Jump distance ratio (0.0 to 1.0)
    rotation_angle: f64,            // Rotation in radians
    rule: Rule,                     // Vertex selection rule
) -> Vec<Point2D>
```

#### Parameter Details

**vertices**: `&[Point2D]`
- **Description**: Array of vertices defining the polygon
- **Constraints**: 
  - Minimum 3 vertices
  - Maximum 1000 vertices (practical limit)
  - Vertices should form a non-degenerate polygon
- **Example**: `[(0.0, 0.866), (-0.5, 0.0), (0.5, 0.0)]` (equilateral triangle)

**initial_point**: `Point2D`
- **Description**: Starting point for iteration
- **Constraints**: 
  - Should be within or near the convex hull of vertices
  - Typical range: [-10.0, 10.0] for both x and y
- **Default**: `(0.0, 0.0)`

**iterations**: `i32`
- **Description**: Number of fractal points to generate
- **Constraints**: 
  - Minimum: 100
  - Maximum: 100,000,000 (limited by memory)
  - Recommended: 10,000 - 1,000,000
- **Default**: `10000`

**compression_ratio**: `f64`
- **Description**: Fraction of distance to jump toward selected vertex
- **Constraints**: 
  - Range: (0.0, 1.0) - exclusive bounds
  - Typical values: 0.3 to 0.8
  - Common values: 0.5 (Sierpinski), 0.667 (Vicsek)
- **Default**: `0.5`

**rotation_angle**: `f64`
- **Description**: Angle to rotate the jump vector (in radians)
- **Constraints**: 
  - Range: [0.0, 2π]
  - Usually small values: 0.0 to 0.5
- **Default**: `0.0`

**rule**: `Rule`
- **Description**: Constraints on vertex selection
- **Sub-parameters**:
  - `length`: Number of previous vertices to remember (0-10)
  - `offset`: Forbidden distance from last vertex (-vertices_count to +vertices_count)
  - `symmetry`: Apply symmetric restrictions (true/false)
- **Default**: `Rule { length: 0, offset: 0, symmetry: false }`

### Specific Algorithm Parameters

#### Sierpinski Triangle
```rust
let params = ChaosGameParams {
    vertices: equilateral_triangle(),    // 3 vertices
    compression_ratio: 0.5,
    rule: Rule { length: 0, offset: 0, symmetry: false },
    // Other parameters: defaults
};
```

#### Vicsek Square
```rust
let params = ChaosGameParams {
    vertices: square_with_center(),      // 5 vertices (4 corners + center)
    compression_ratio: 2.0/3.0,
    rule: Rule { length: 0, offset: 0, symmetry: false },
    // Other parameters: defaults
};
```

#### T-Square
```rust
let params = ChaosGameParams {
    vertices: unit_square(),             // 4 vertices
    compression_ratio: 0.5,
    rule: Rule { length: 1, offset: 2, symmetry: false },
    // Other parameters: defaults
};
```

## Iterated Function System (IFS) Parameters

### Core Function: `ifs_generate`

```rust
pub fn ifs_generate(
    transformations: &[Transformation], // Array of affine transformations
    probabilities: &[f64],              // Selection probabilities
    initial_point: Point3D,             // Starting point
    iterations: i32,                    // Number of points to generate
    parsing_mode: ParsingMode,          // How to interpret transformation parameters
) -> Vec<Point3D>
```

#### Parameter Details

**transformations**: `&[Transformation]`
- **Description**: Array of affine transformation matrices
- **Constraints**:
  - Minimum: 2 transformations
  - Maximum: 100 transformations
  - Each transformation must be contractive (eigenvalues < 1 in magnitude)
- **Format**: Each transformation has 6 parameters `[a, b, c, d, e, f]`

**probabilities**: `&[f64]`
- **Description**: Probability weights for selecting each transformation
- **Constraints**:
  - Length must equal transformations length
  - All values must be positive
  - Sum should equal 1.0 (normalized automatically if not)
  - Range per value: (0.0, 1.0]
- **Example**: `[0.01, 0.07, 0.07, 0.85]` (Barnsley fern)

**initial_point**: `Point3D`
- **Description**: Starting point for iteration
- **Constraints**: Typically `(0.0, 0.0, 0.0)`
- **Default**: `(0.0, 0.0, 0.0)`

**iterations**: `i32`
- **Description**: Number of points to generate
- **Constraints**: Same as chaos game
- **Recommended**: 50,000 - 500,000 for detailed IFS

**parsing_mode**: `ParsingMode`
- **Description**: How to interpret the 6 transformation parameters
- **Options**:
  ```rust
  enum ParsingMode {
      Regular,  // x' = ax + by + c, y' = dx + ey + f
      Borke,    // x' = ax + by + e, y' = cx + dy + f
  }
  ```

### Predefined IFS Parameters

#### Barnsley Fern
```rust
let transformations = vec![
    Transformation { a: 0.0,  b: 0.0,  c: 0.0,  d: 0.16, e: 0.0, f: 0.0 },
    Transformation { a: 0.2,  b: -0.26, c: 0.23, d: 0.22, e: 0.0, f: 1.6 },
    Transformation { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0.0, f: 0.44 },
    Transformation { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0.0, f: 1.6 },
];
let probabilities = vec![0.01, 0.07, 0.07, 0.85];
let parsing_mode = ParsingMode::Borke;
```

#### Dragon Curve
```rust
let transformations = vec![
    Transformation { 
        a: 0.824074, b: 0.281428, c: -0.212346, 
        d: 0.864198, e: -1.882290, f: -0.110607 
    },
    Transformation { 
        a: 0.088272, b: 0.520988, c: -0.463889, 
        d: -0.377778, e: 0.785360, f: 8.095795 
    },
];
let probabilities = vec![0.8, 0.2];
let parsing_mode = ParsingMode::Borke;
```

## Chaotic Map Generation Parameters

### Core Function: `find_chaotic_map`

```rust
pub fn find_chaotic_map(
    map_type: MapType,                  // Quadratic or Cubic
    parameter_range: (f64, f64),        // Range for random parameters
    generation_mode: GenerationMode,    // Continuous or Discrete
    lyapunov_iterations: i32,          // Iterations for LE calculation
    transient_iterations: i32,         // Iterations to discard
    lyapunov_threshold: f64,           // Minimum LE for chaos
    max_attempts: i32,                 // Maximum search attempts
) -> Result<ChaoticMap, String>
```

#### Parameter Details

**map_type**: `MapType`
```rust
enum MapType {
    Quadratic,  // 6 parameters per equation (12 total)
    Cubic,      // 10 parameters per equation (20 total)
}
```

**parameter_range**: `(f64, f64)`
- **Description**: Range for randomly generated coefficients
- **Default**: `(-1.2, 1.2)`
- **Constraints**: 
  - Range should not be too large (causes unbounded behavior)
  - Range should not be too small (limits chaos possibilities)

**generation_mode**: `GenerationMode`
```rust
enum GenerationMode {
    Continuous,  // Parameters from continuous uniform distribution
    Discrete,    // Parameters from discrete set with step size
}
```

**lyapunov_iterations**: `i32`
- **Description**: Number of iterations for Lyapunov exponent calculation
- **Constraints**: 
  - Minimum: 10,000
  - Recommended: 50,000 - 100,000
  - Higher values give more accurate results but take longer
- **Default**: `70000`

**transient_iterations**: `i32`
- **Description**: Number of initial iterations to discard
- **Purpose**: Allow trajectory to reach attractor
- **Constraints**: 
  - Minimum: 100
  - Recommended: 1,000 - 5,000
- **Default**: `1000`

**lyapunov_threshold**: `f64`
- **Description**: Minimum positive Lyapunov exponent for chaos detection
- **Constraints**: 
  - Range: (0.0, 1.0)
  - Typical: 1e-4 to 1e-3
  - Lower values find more maps but may include weak chaos
- **Default**: `1e-4`

**max_attempts**: `i32`
- **Description**: Maximum number of parameter sets to try
- **Constraints**: 
  - Minimum: 100
  - Recommended: 1,000 - 10,000
  - Higher values increase chance of finding chaos
- **Default**: `10000`

### Map Testing Function: `test_map_chaos`

```rust
pub fn test_map_chaos(
    x_coefficients: &[f64],             // Coefficients for x equation
    y_coefficients: &[f64],             // Coefficients for y equation
    lyapunov_iterations: i32,
    transient_iterations: i32,
    unbounded_threshold: f64,
) -> LyapunovResult
```

**x_coefficients, y_coefficients**: `&[f64]`
- **Length**: 6 for quadratic, 10 for cubic maps
- **Range**: Typically [-1.2, 1.2]
- **Order** (quadratic): `[a, b, c, d, e, f]` for equation `a + b*x + c*x² + d*x*y + e*y + f*y²`

**unbounded_threshold**: `f64`
- **Description**: Threshold for detecting divergent trajectories
- **Default**: `1e6`
- **Purpose**: Reject parameter sets that cause explosion

## Color Mapping Parameters

### Core Function: `apply_color_mapping`

```rust
pub fn apply_color_mapping(
    points: &[Point2D],                 // Point cloud data
    canvas_width: i32,                  // Output image width
    canvas_height: i32,                 // Output image height
    color_map: ColorMap,                // Color mapping scheme
    aggregation_method: AggregationMethod, // How to handle point density
    background_color: (f64, f64, f64),  // RGB background color
) -> ImageData
```

#### Parameter Details

**canvas_width, canvas_height**: `i32`
- **Description**: Output image dimensions in pixels
- **Constraints**: 
  - Minimum: 100x100
  - Maximum: 8192x8192 (memory permitting)
  - Recommended: 1000x1000 to 2000x2000
- **Default**: `1500x1500`

**color_map**: `ColorMap`
- **Description**: Color scheme for point density visualization
- **Predefined options**:
  ```rust
  enum StandardColorMap {
      Fire,        // Red-orange-yellow
      Jet,         // Blue-cyan-yellow-red
      Viridis,     // Purple-blue-green-yellow
      Plasma,      // Purple-pink-yellow
      Turbo,       // Improved jet
      Grayscale,   // Black to white
  }
  ```

**aggregation_method**: `AggregationMethod`
```rust
enum AggregationMethod {
    Linear,      // Linear point density mapping
    Log,         // Logarithmic mapping (recommended)
    Sqrt,        // Square root mapping
    Power(f64),  // Power law with custom exponent
}
```

**background_color**: `(f64, f64, f64)`
- **Description**: RGB background color (0.0 to 1.0 range)
- **Default**: `(0.0, 0.0, 0.0)` (black)

### Bounds Calculation
```rust
pub fn calculate_bounds(
    points: &[Point2D],
    padding_factor: f64,                // Extra space around data
) -> (f64, f64, f64, f64)              // (min_x, max_x, min_y, max_y)
```

**padding_factor**: `f64`
- **Description**: Fraction of data range to add as padding
- **Range**: [0.0, 1.0]
- **Default**: `0.05` (5% padding)

## Random Number Generation Parameters

### Random State Configuration
```rust
pub struct RandomConfig {
    seed: Option<u64>,                  // Seed for reproducibility
    generator_type: GeneratorType,      // RNG algorithm
}

enum GeneratorType {
    XorShift,    // Fast, good quality
    PCG,         // High quality, moderate speed
    ChaCha,      // Cryptographic quality, slower
}
```

**seed**: `Option<u64>`
- **Description**: Seed value for deterministic results
- **None**: Use system entropy for true randomness
- **Some(value)**: Use specific seed for reproducible results

## Memory and Performance Parameters

### Performance Configuration
```rust
pub struct PerformanceConfig {
    chunk_size: i32,                    // Points to process in batches
    parallel_threads: Option<i32>,      // Number of threads (None = auto)
    memory_limit_mb: i32,              // Maximum memory usage
    enable_simd: bool,                 // Use SIMD optimizations
}
```

**chunk_size**: `i32`
- **Description**: Number of points to generate in each batch
- **Range**: 1,000 - 100,000
- **Purpose**: Balance memory usage and performance
- **Default**: `10000`

**parallel_threads**: `Option<i32>`
- **Description**: Number of threads for parallel computation
- **None**: Auto-detect based on CPU cores
- **Some(n)**: Use specific number of threads
- **Range**: 1 to number of logical CPU cores

**memory_limit_mb**: `i32`
- **Description**: Maximum memory usage in megabytes
- **Default**: `1024` (1GB)
- **Purpose**: Prevent excessive memory consumption

**enable_simd**: `bool`
- **Description**: Enable SIMD vectorization optimizations
- **Default**: `true`
- **Performance impact**: 2-4x speedup on supported hardware

## Validation and Error Handling

### Parameter Validation Rules

1. **Range Validation**: All numeric parameters must be within specified ranges
2. **Array Length Validation**: Arrays must have required lengths and relationships
3. **Constraint Validation**: Complex constraints (e.g., transformation contractivity)
4. **Memory Safety**: Parameter combinations that could cause excessive memory usage

### Error Types
```rust
enum ParameterError {
    OutOfRange { param: String, value: f64, range: (f64, f64) },
    InvalidLength { param: String, expected: i32, actual: i32 },
    InvalidConstraint { param: String, reason: String },
    MemoryLimit { requested_mb: i32, limit_mb: i32 },
}
```

### Example Validation Function
```rust
pub fn validate_chaos_game_params(
    vertices: &[Point2D],
    compression_ratio: f64,
    iterations: i32,
    rule: &Rule,
) -> Result<(), ParameterError> {
    // Implementation validates all parameters and returns specific errors
}
```