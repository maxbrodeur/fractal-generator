#!/usr/bin/env python3
"""
Test cases for fractal generation algorithms.

This module provides test cases with known inputs and expected outputs
for validating the fractal generation algorithms during Rust/WebAssembly
implementation.
"""

import numpy as np
import math
from typing import Tuple, List, Dict, Any

# Import the fractal modules (these would need to be available in test environment)
# import Fractal as f
# from chaostech.Rule import Rule
# import ChaosFinder as cfind

class FractalTestCase:
    """Base class for fractal algorithm test cases."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.input_params = {}
        self.expected_output = {}
        self.validation_criteria = {}

class ChaosGameTestCases:
    """Test cases for chaos game fractal algorithms."""
    
    @staticmethod
    def sierpinski_triangle_basic() -> FractalTestCase:
        """Basic Sierpinski triangle test case."""
        test = FractalTestCase(
            "sierpinski_triangle_basic",
            "Basic Sierpinski triangle with standard parameters"
        )
        
        test.input_params = {
            "vertices": np.array([
                [0.0, np.sqrt(3)/2],    # Top vertex
                [-0.5, 0.0],            # Bottom left
                [0.5, 0.0]              # Bottom right
            ]),
            "initial_point": (0.0, 0.0),
            "iterations": 10000,
            "compression_ratio": 0.5,
            "rotation_angle": 0.0,
            "rule_length": 0,
            "rule_offset": 0,
            "rule_symmetry": False
        }
        
        test.expected_output = {
            "point_count": 10000,
            "bounding_box": {
                "min_x": -0.5,
                "max_x": 0.5,
                "min_y": 0.0,
                "max_y": np.sqrt(3)/2
            },
            "fractal_dimension_approx": 1.585,
            "self_similarity": True,
            "convergence_iterations": 1000
        }
        
        test.validation_criteria = {
            "all_points_in_bounds": True,
            "triangular_pattern": True,
            "three_main_regions": True,
            "fractal_gaps": True,
            "dimension_tolerance": 0.1
        }
        
        return test
    
    @staticmethod
    def sierpinski_triangle_large() -> FractalTestCase:
        """Large iteration count Sierpinski triangle."""
        test = FractalTestCase(
            "sierpinski_triangle_large",
            "Sierpinski triangle with 1M iterations for performance testing"
        )
        
        test.input_params = {
            "vertices": np.array([
                [0.0, np.sqrt(3)/2],
                [-0.5, 0.0],
                [0.5, 0.0]
            ]),
            "initial_point": (0.0, 0.0),
            "iterations": 1000000,
            "compression_ratio": 0.5,
            "rotation_angle": 0.0,
            "rule_length": 0,
            "rule_offset": 0,
            "rule_symmetry": False
        }
        
        test.expected_output = {
            "point_count": 1000000,
            "max_memory_mb": 100,  # Should not exceed 100MB
            "max_generation_time_sec": 10.0  # Should complete within 10 seconds
        }
        
        return test
    
    @staticmethod
    def vicsek_square() -> FractalTestCase:
        """Vicsek square fractal test case."""
        test = FractalTestCase(
            "vicsek_square",
            "Vicsek square with center point and 2/3 compression"
        )
        
        test.input_params = {
            "vertices": np.array([
                [-0.5, -0.5],   # Bottom left
                [0.5, -0.5],    # Bottom right
                [0.5, 0.5],     # Top right
                [-0.5, 0.5],    # Top left
                [0.0, 0.0]      # Center point
            ]),
            "initial_point": (0.0, 0.0),
            "iterations": 50000,
            "compression_ratio": 2.0/3.0,
            "rotation_angle": 0.0,
            "rule_length": 0,
            "rule_offset": 0,
            "rule_symmetry": False
        }
        
        test.expected_output = {
            "point_count": 50000,
            "plus_sign_pattern": True,
            "five_main_regions": True,
            "square_symmetry": True
        }
        
        return test
    
    @staticmethod
    def t_square_with_rules() -> FractalTestCase:
        """T-square fractal with vertex selection rules."""
        test = FractalTestCase(
            "t_square_with_rules",
            "T-square fractal with rule preventing jumps 2 vertices away"
        )
        
        test.input_params = {
            "vertices": np.array([
                [-0.5, -0.5],   # Vertex 0
                [0.5, -0.5],    # Vertex 1
                [0.5, 0.5],     # Vertex 2
                [-0.5, 0.5]     # Vertex 3
            ]),
            "initial_point": (0.0, 0.0),
            "iterations": 25000,
            "compression_ratio": 0.5,
            "rotation_angle": 0.0,
            "rule_length": 1,
            "rule_offset": 2,
            "rule_symmetry": False
        }
        
        test.expected_output = {
            "point_count": 25000,
            "t_shaped_pattern": True,
            "rule_compliance": True,
            "no_opposite_jumps": True
        }
        
        test.validation_criteria = {
            "vertex_selection_rule": "Cannot select vertex 2 positions away from last selected",
            "pattern_recognition": "T-square fractal structure"
        }
        
        return test

class IFSTestCases:
    """Test cases for Iterated Function System fractals."""
    
    @staticmethod
    def barnsley_fern() -> FractalTestCase:
        """Barnsley fern fractal test case."""
        test = FractalTestCase(
            "barnsley_fern",
            "Barnsley fern with standard 4-transformation IFS"
        )
        
        test.input_params = {
            "transformations": [
                # Transformation 1: stem (1% probability)
                [0.0, 0.0, 0.0, 0.16, 0.0, 0.0],
                # Transformation 2: small leaflet (7% probability)
                [0.2, -0.26, 0.23, 0.22, 0.0, 1.6],
                # Transformation 3: large leaflet (7% probability)
                [-0.15, 0.28, 0.26, 0.24, 0.0, 0.44],
                # Transformation 4: main rachis (85% probability)
                [0.85, 0.04, -0.04, 0.85, 0.0, 1.6]
            ],
            "probabilities": [0.01, 0.07, 0.07, 0.85],
            "initial_point": [0.0, 0.0, 0.0],
            "iterations": 100000,
            "parsing_mode": "borke"  # x_new = a*x + b*y + e, y_new = c*x + d*y + f
        }
        
        test.expected_output = {
            "point_count": 100000,
            "bounding_box": {
                "min_x": -3.0,
                "max_x": 3.0,
                "min_y": -0.5,
                "max_y": 10.0
            },
            "fern_like_structure": True,
            "vertical_orientation": True,
            "self_similar_branches": True
        }
        
        test.validation_criteria = {
            "transformation_probabilities": "Should follow [1%, 7%, 7%, 85%] distribution",
            "botanical_appearance": "Should resemble natural fern structure",
            "fractal_detail": "Fine detail visible at multiple zoom levels"
        }
        
        return test
    
    @staticmethod
    def dragon_curve() -> FractalTestCase:
        """Dragon curve fractal test case."""
        test = FractalTestCase(
            "dragon_curve",
            "Dragon curve using 2-transformation IFS"
        )
        
        test.input_params = {
            "transformations": [
                [0.824074, 0.281428, -0.212346, 0.864198, -1.882290, -0.110607],
                [0.088272, 0.520988, -0.463889, -0.377778, 0.785360, 8.095795]
            ],
            "probabilities": [0.8, 0.2],
            "initial_point": [0.0, 0.0, 0.0],
            "iterations": 200000,
            "parsing_mode": "borke"
        }
        
        test.expected_output = {
            "point_count": 200000,
            "connected_curve": True,
            "no_self_intersections": True,
            "dragon_like_shape": True,
            "finite_area": True
        }
        
        return test
    
    @staticmethod
    def sierpinski_ifs() -> FractalTestCase:
        """Sierpinski triangle using IFS method (comparison with chaos game)."""
        test = FractalTestCase(
            "sierpinski_ifs",
            "Sierpinski triangle using IFS transformations"
        )
        
        test.input_params = {
            "transformations": [
                [0.5, 0.0, 0.0, 0.0, 0.5, 0.0],    # Bottom left
                [0.5, 0.0, 0.5, 0.0, 0.5, 0.0],    # Bottom right
                [0.5, 0.0, 0.0, 0.0, 0.5, 0.5]     # Top
            ],
            "probabilities": [1.0/3.0, 1.0/3.0, 1.0/3.0],
            "initial_point": [0.0, 0.0, 0.0],
            "iterations": 50000,
            "parsing_mode": "regular"  # x_new = a*x + b*y + c, y_new = d*x + e*y + f
        }
        
        test.expected_output = {
            "point_count": 50000,
            "triangular_pattern": True,
            "matches_chaos_game": True,  # Should match chaos game version
            "fractal_dimension_approx": 1.585
        }
        
        test.validation_criteria = {
            "consistency_check": "Should produce same pattern as chaos game method",
            "transformation_equivalence": "IFS transformations equivalent to chaos game jumps"
        }
        
        return test

class ChaoticMapTestCases:
    """Test cases for chaotic map generation algorithms."""
    
    @staticmethod
    def quadratic_map_known_chaotic() -> FractalTestCase:
        """Known chaotic quadratic map test case."""
        test = FractalTestCase(
            "quadratic_map_known_chaotic",
            "Pre-validated chaotic quadratic map with known properties"
        )
        
        test.input_params = {
            "x_coefficients": [0.2020, -0.8050, -0.3730, -0.6890, -0.3420, -0.6530],
            "y_coefficients": [0.1380, 0.6650, 0.6600, -0.5020, -0.2220, -0.2770],
            "initial_point": (0.05, 0.05),
            "transient_iterations": 1000,
            "lyapunov_iterations": 70000,
            "plot_iterations": 50000,
            "unbounded_threshold": 1e6
        }
        
        test.expected_output = {
            "max_lyapunov_exponent": 0.42,  # Approximate expected value
            "min_lyapunov_exponent": -1.15,  # Approximate expected value
            "fractal_dimension": 1.37,  # Approximate expected value
            "is_chaotic": True,
            "is_bounded": True,
            "point_count": 50000
        }
        
        test.validation_criteria = {
            "lyapunov_positivity": "Maximum Lyapunov exponent > 0.0001",
            "dimension_range": "Fractal dimension between 1.0 and 2.0",
            "boundedness": "All trajectory points within [-100, 100] range",
            "non_periodicity": "Should not converge to fixed points or cycles"
        }
        
        return test
    
    @staticmethod
    def cubic_map_generation() -> FractalTestCase:
        """Cubic map generation and validation test."""
        test = FractalTestCase(
            "cubic_map_generation",
            "Generate and validate cubic chaotic map"
        )
        
        test.input_params = {
            "map_order": "cubic",
            "parameter_count": 20,  # 10 per equation
            "parameter_range": [-1.2, 1.2],
            "generation_mode": "continuous",
            "max_search_attempts": 10000,
            "lyapunov_threshold": 1e-4
        }
        
        test.expected_output = {
            "generation_success": True,
            "max_lyapunov_positive": True,
            "fractal_dimension_valid": True,
            "bounded_attractor": True,
            "generation_time_reasonable": True  # Should find chaotic map within reasonable time
        }
        
        return test
    
    @staticmethod
    def lyapunov_calculation_accuracy() -> FractalTestCase:
        """Test Lyapunov exponent calculation accuracy."""
        test = FractalTestCase(
            "lyapunov_calculation_accuracy",
            "Validate Lyapunov exponent calculation against known values"
        )
        
        # Henon map: x_{n+1} = 1 - a*x_n^2 + y_n, y_{n+1} = b*x_n
        # For a=1.4, b=0.3: known chaotic with max_LE ≈ 0.419
        test.input_params = {
            "henon_a": 1.4,
            "henon_b": 0.3,
            "iterations": 100000,
            "known_max_le": 0.419,
            "known_min_le": -1.623,
            "tolerance": 0.05
        }
        
        test.expected_output = {
            "calculated_max_le": 0.419,
            "calculated_min_le": -1.623,
            "accuracy_within_tolerance": True
        }
        
        return test

class ColorMappingTestCases:
    """Test cases for color mapping and visualization functions."""
    
    @staticmethod
    def datashader_integration() -> FractalTestCase:
        """Test datashader color mapping integration."""
        test = FractalTestCase(
            "datashader_integration",
            "Validate datashader color mapping with various point densities"
        )
        
        test.input_params = {
            "point_cloud_sizes": [1000, 10000, 100000, 1000000],
            "canvas_resolution": [500, 1000, 1500],
            "color_maps": ["fire", "jet", "viridis", "plasma"],
            "aggregation_method": "log",
            "background_color": "black"
        }
        
        test.expected_output = {
            "image_generation_success": True,
            "proper_color_scaling": True,
            "density_representation": True,
            "performance_acceptable": True
        }
        
        test.validation_criteria = {
            "color_accuracy": "Colors should match specified colormap",
            "density_mapping": "Higher point density should show brighter colors",
            "edge_handling": "Image boundaries should be handled correctly",
            "memory_efficiency": "Should handle large point clouds without excessive memory"
        }
        
        return test

class PerformanceTestCases:
    """Performance and optimization test cases."""
    
    @staticmethod
    def numba_optimization_validation() -> FractalTestCase:
        """Validate Numba JIT optimization performance."""
        test = FractalTestCase(
            "numba_optimization_validation",
            "Compare performance with and without Numba optimization"
        )
        
        test.input_params = {
            "algorithms": ["sierpinski", "barnsley_fern", "lyapunov_calculation"],
            "iteration_counts": [10000, 100000, 1000000],
            "numba_enabled": [True, False],
            "repetitions": 5
        }
        
        test.expected_output = {
            "speedup_factor_min": 10,  # At least 10x speedup expected
            "memory_usage_similar": True,
            "numerical_accuracy_maintained": True
        }
        
        return test
    
    @staticmethod
    def memory_efficiency() -> FractalTestCase:
        """Test memory efficiency for large-scale generation."""
        test = FractalTestCase(
            "memory_efficiency",
            "Validate memory usage for large-scale fractal generation"
        )
        
        test.input_params = {
            "max_iterations": 10000000,  # 10M points
            "algorithms": ["chaos_game", "ifs", "chaotic_map"],
            "memory_monitoring": True
        }
        
        test.expected_output = {
            "max_memory_gb": 2.0,  # Should not exceed 2GB
            "memory_growth_linear": True,
            "no_memory_leaks": True
        }
        
        return test

def generate_all_test_cases() -> Dict[str, List[FractalTestCase]]:
    """Generate all test cases organized by category."""
    return {
        "chaos_game": [
            ChaosGameTestCases.sierpinski_triangle_basic(),
            ChaosGameTestCases.sierpinski_triangle_large(),
            ChaosGameTestCases.vicsek_square(),
            ChaosGameTestCases.t_square_with_rules()
        ],
        "ifs": [
            IFSTestCases.barnsley_fern(),
            IFSTestCases.dragon_curve(),
            IFSTestCases.sierpinski_ifs()
        ],
        "chaotic_maps": [
            ChaoticMapTestCases.quadratic_map_known_chaotic(),
            ChaoticMapTestCases.cubic_map_generation(),
            ChaoticMapTestCases.lyapunov_calculation_accuracy()
        ],
        "color_mapping": [
            ColorMappingTestCases.datashader_integration()
        ],
        "performance": [
            PerformanceTestCases.numba_optimization_validation(),
            PerformanceTestCases.memory_efficiency()
        ]
    }

def export_test_cases_json() -> str:
    """Export test cases to JSON format for cross-language validation."""
    import json
    
    test_cases = generate_all_test_cases()
    
    # Convert numpy arrays to lists for JSON serialization
    def convert_numpy(obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, dict):
            return {k: convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(item) for item in obj]
        else:
            return obj
    
    serializable_cases = {}
    for category, cases in test_cases.items():
        serializable_cases[category] = []
        for case in cases:
            serializable_case = {
                "name": case.name,
                "description": case.description,
                "input_params": convert_numpy(case.input_params),
                "expected_output": convert_numpy(case.expected_output),
                "validation_criteria": convert_numpy(case.validation_criteria)
            }
            serializable_cases[category].append(serializable_case)
    
    return json.dumps(serializable_cases, indent=2)

if __name__ == "__main__":
    # Generate and print test case summary
    test_cases = generate_all_test_cases()
    
    print("Fractal Algorithm Test Cases Summary")
    print("=" * 50)
    
    total_cases = 0
    for category, cases in test_cases.items():
        print(f"\n{category.upper()} ({len(cases)} test cases):")
        total_cases += len(cases)
        for case in cases:
            print(f"  - {case.name}: {case.description}")
    
    print(f"\nTotal test cases: {total_cases}")
    
    # Export to JSON
    json_output = export_test_cases_json()
    with open("fractal_test_cases.json", "w") as f:
        f.write(json_output)
    
    print("\nTest cases exported to fractal_test_cases.json")