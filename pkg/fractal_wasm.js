let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
 * Color mapping functions
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14}
 */
export const ColorScheme = Object.freeze({
    Fire: 0, "0": "Fire",
    Jet: 1, "1": "Jet",
    Prism: 2, "2": "Prism",
    Turbo: 3, "3": "Turbo",
    ColorWheel: 4, "4": "ColorWheel",
    GnuPlot: 5, "5": "GnuPlot",
    Bmy: 6, "6": "Bmy",
    Plasma: 7, "7": "Plasma",
    Viridis: 8, "8": "Viridis",
    Inferno: 9, "9": "Inferno",
    Magma: 10, "10": "Magma",
    Ocean: 11, "11": "Ocean",
    Rainbow: 12, "12": "Rainbow",
    Cool: 13, "13": "Cool",
    Hot: 14, "14": "Hot",
});

const FractalGeneratorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_fractalgenerator_free(ptr >>> 0, 1));
/**
 * Main fractal generator struct
 */
export class FractalGenerator {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FractalGeneratorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fractalgenerator_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.fractalgenerator_new();
        this.__wbg_ptr = ret >>> 0;
        FractalGeneratorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Generate chaos game fractal points
     * @param {Array<any>} vertices_js
     * @param {number} x0
     * @param {number} y0
     * @param {number} iterations
     * @param {Array<any>} transforms_js
     * @param {Rule} rule
     * @returns {Float64Array}
     */
    chaos_game(vertices_js, x0, y0, iterations, transforms_js, rule) {
        _assertClass(rule, Rule);
        const ret = wasm.fractalgenerator_chaos_game(this.__wbg_ptr, vertices_js, x0, y0, iterations, transforms_js, rule.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Generate IFS fractal points
     * @param {number} start_x
     * @param {number} start_y
     * @param {number} iterations
     * @param {Array<any>} transforms_js
     * @param {Array<any>} probabilities_js
     * @param {string} parse_mode
     * @returns {Float64Array}
     */
    ifs_fractal(start_x, start_y, iterations, transforms_js, probabilities_js, parse_mode) {
        const ptr0 = passStringToWasm0(parse_mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.fractalgenerator_ifs_fractal(this.__wbg_ptr, start_x, start_y, iterations, transforms_js, probabilities_js, ptr0, len0);
        var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v2;
    }
    /**
     * Generate Mandelbrot set
     * @param {number} width
     * @param {number} height
     * @param {number} x_min
     * @param {number} x_max
     * @param {number} y_min
     * @param {number} y_max
     * @param {number} max_iterations
     * @returns {Uint32Array}
     */
    mandelbrot_set(width, height, x_min, x_max, y_min, y_max, max_iterations) {
        const ret = wasm.fractalgenerator_mandelbrot_set(this.__wbg_ptr, width, height, x_min, x_max, y_min, y_max, max_iterations);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Generate Julia set
     * @param {number} width
     * @param {number} height
     * @param {number} x_min
     * @param {number} x_max
     * @param {number} y_min
     * @param {number} y_max
     * @param {number} c_real
     * @param {number} c_imag
     * @param {number} max_iterations
     * @returns {Uint32Array}
     */
    julia_set(width, height, x_min, x_max, y_min, y_max, c_real, c_imag, max_iterations) {
        const ret = wasm.fractalgenerator_julia_set(this.__wbg_ptr, width, height, x_min, x_max, y_min, y_max, c_real, c_imag, max_iterations);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Generate Burning Ship fractal
     * @param {number} width
     * @param {number} height
     * @param {number} x_min
     * @param {number} x_max
     * @param {number} y_min
     * @param {number} y_max
     * @param {number} max_iterations
     * @returns {Uint32Array}
     */
    burning_ship(width, height, x_min, x_max, y_min, y_max, max_iterations) {
        const ret = wasm.fractalgenerator_burning_ship(this.__wbg_ptr, width, height, x_min, x_max, y_min, y_max, max_iterations);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Convert iteration counts to RGBA with color mapping
     * @param {Uint32Array} iterations
     * @param {number} width
     * @param {number} height
     * @param {number} max_iterations
     * @param {ColorScheme} color_scheme
     * @returns {Uint8Array}
     */
    iterations_to_rgba(iterations, width, height, max_iterations, color_scheme) {
        const ptr0 = passArray32ToWasm0(iterations, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.fractalgenerator_iterations_to_rgba(this.__wbg_ptr, ptr0, len0, width, height, max_iterations, color_scheme);
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Generate RGBA pixel data from points with color mapping
     * @param {Float64Array} points
     * @param {number} width
     * @param {number} height
     * @param {ColorScheme} color_scheme
     * @returns {Uint8Array}
     */
    points_to_rgba(points, width, height, color_scheme) {
        const ptr0 = passArrayF64ToWasm0(points, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.fractalgenerator_points_to_rgba(this.__wbg_ptr, ptr0, len0, width, height, color_scheme);
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Find a random chaotic map
     * @param {number} n_plot
     * @param {number} n_test
     * @param {boolean} is_cubic
     * @returns {Float64Array}
     */
    find_random_chaos(n_plot, n_test, is_cubic) {
        const ret = wasm.fractalgenerator_find_random_chaos(this.__wbg_ptr, n_plot, n_test, is_cubic);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
}

const FractalPresetsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_fractalpresets_free(ptr >>> 0, 1));

export class FractalPresets {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FractalPresetsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fractalpresets_free(ptr, 0);
    }
    /**
     * Get Sierpinski triangle configuration
     * @returns {Array<any>}
     */
    static sierpinski_triangle() {
        const ret = wasm.fractalpresets_sierpinski_triangle();
        return ret;
    }
    /**
     * Get Sierpinski triangle transform parameters
     * @returns {Array<any>}
     */
    static sierpinski_triangle_transforms() {
        const ret = wasm.fractalpresets_sierpinski_triangle_transforms();
        return ret;
    }
    /**
     * Get Sierpinski carpet configuration (4-sided polygon with midpoints)
     * @returns {Array<any>}
     */
    static sierpinski_carpet() {
        const ret = wasm.fractalpresets_sierpinski_carpet();
        return ret;
    }
    /**
     * Get Sierpinski carpet transform parameters
     * @returns {Array<any>}
     */
    static sierpinski_carpet_transforms() {
        const ret = wasm.fractalpresets_sierpinski_carpet_transforms();
        return ret;
    }
    /**
     * Get Vicsek square configuration (4-sided polygon with center)
     * @returns {Array<any>}
     */
    static vicsek_square() {
        const ret = wasm.fractalpresets_vicsek_square();
        return ret;
    }
    /**
     * Get Vicsek square transform parameters
     * @returns {Array<any>}
     */
    static vicsek_square_transforms() {
        const ret = wasm.fractalpresets_vicsek_square_transforms();
        return ret;
    }
    /**
     * Get T-square configuration
     * @returns {Array<any>}
     */
    static t_square() {
        const ret = wasm.fractalpresets_t_square();
        return ret;
    }
    /**
     * Get T-square transform parameters
     * @returns {Array<any>}
     */
    static t_square_transforms() {
        const ret = wasm.fractalpresets_t_square_transforms();
        return ret;
    }
    /**
     * Get Techs pattern configuration
     * @returns {Array<any>}
     */
    static techs_pattern() {
        const ret = wasm.fractalpresets_techs_pattern();
        return ret;
    }
    /**
     * Get Techs pattern transform parameters
     * @returns {Array<any>}
     */
    static techs_pattern_transforms() {
        const ret = wasm.fractalpresets_techs_pattern_transforms();
        return ret;
    }
    /**
     * Get Web pattern configuration
     * @returns {Array<any>}
     */
    static web_pattern() {
        const ret = wasm.fractalpresets_web_pattern();
        return ret;
    }
    /**
     * Get Web pattern transform parameters
     * @returns {Array<any>}
     */
    static web_pattern_transforms() {
        const ret = wasm.fractalpresets_web_pattern_transforms();
        return ret;
    }
    /**
     * Get Dragon curve IFS parameters
     * @returns {Array<any>}
     */
    static dragon_curve() {
        const ret = wasm.fractalpresets_dragon_curve();
        return ret;
    }
    /**
     * Get Dragon curve probabilities
     * @returns {Array<any>}
     */
    static dragon_curve_probs() {
        const ret = wasm.fractalpresets_dragon_curve_probs();
        return ret;
    }
    /**
     * Get Barnsley fern IFS parameters
     * @returns {Array<any>}
     */
    static barnsley_fern() {
        const ret = wasm.fractalpresets_barnsley_fern();
        return ret;
    }
    /**
     * Get Barnsley fern probabilities
     * @returns {Array<any>}
     */
    static barnsley_fern_probs() {
        const ret = wasm.fractalpresets_barnsley_fern_probs();
        return ret;
    }
    /**
     * Get Mandelbrot-like IFS parameters
     * @returns {Array<any>}
     */
    static mandelbrot_like() {
        const ret = wasm.fractalpresets_mandelbrot_like();
        return ret;
    }
    /**
     * Get Mandelbrot-like probabilities
     * @returns {Array<any>}
     */
    static mandelbrot_like_probs() {
        const ret = wasm.fractalpresets_mandelbrot_like_probs();
        return ret;
    }
    /**
     * Get Spiral IFS parameters
     * @returns {Array<any>}
     */
    static spiral() {
        const ret = wasm.fractalpresets_spiral();
        return ret;
    }
    /**
     * Get Spiral probabilities
     * @returns {Array<any>}
     */
    static spiral_probs() {
        const ret = wasm.fractalpresets_spiral_probs();
        return ret;
    }
    /**
     * Get Christmas tree IFS parameters
     * @returns {Array<any>}
     */
    static christmas_tree() {
        const ret = wasm.fractalpresets_christmas_tree();
        return ret;
    }
    /**
     * Get Christmas tree probabilities
     * @returns {Array<any>}
     */
    static christmas_tree_probs() {
        const ret = wasm.fractalpresets_christmas_tree_probs();
        return ret;
    }
    /**
     * Get Maple leaf IFS parameters
     * @returns {Array<any>}
     */
    static maple_leaf() {
        const ret = wasm.fractalpresets_maple_leaf();
        return ret;
    }
    /**
     * Get Maple leaf probabilities
     * @returns {Array<any>}
     */
    static maple_leaf_probs() {
        const ret = wasm.fractalpresets_maple_leaf_probs();
        return ret;
    }
}

const RuleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rule_free(ptr >>> 0, 1));
/**
 * Rule system for vertex selection constraints
 */
export class Rule {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RuleFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rule_free(ptr, 0);
    }
    /**
     * @param {number} length
     * @param {number} offset
     * @param {boolean} symmetry
     */
    constructor(length, offset, symmetry) {
        const ret = wasm.rule_new(length, offset, symmetry);
        this.__wbg_ptr = ret >>> 0;
        RuleFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} element
     */
    add(element) {
        wasm.rule_add(this.__wbg_ptr, element);
    }
    /**
     * @param {number} vertex_count
     * @param {number} index
     * @returns {boolean}
     */
    check(vertex_count, index) {
        const ret = wasm.rule_check(this.__wbg_ptr, vertex_count, index);
        return ret !== 0;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = arg0.crypto;
        return ret;
    };
    imports.wbg.__wbg_from_2a5d3e218e67aa85 = function(arg0) {
        const ret = Array.from(arg0);
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        arg0.getRandomValues(arg1);
    }, arguments) };
    imports.wbg.__wbg_get_b9b93047fe3cf45b = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_length_e2d2a49132c1b256 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_log_4d95aa40ada3ba83 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = arg0.msCrypto;
        return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_newwithlength_a381634e90c276d4 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = arg0.node;
        return ret;
    };
    imports.wbg.__wbg_of_66b3ee656cbd962b = function(arg0, arg1) {
        const ret = Array.of(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = arg0.process;
        return ret;
    };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        arg0.randomFillSync(arg1);
    }, arguments) };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
        const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = arg0.versions;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('fractal_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
