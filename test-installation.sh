#!/bin/bash

# 🧪 WebAssembly Fractal Generator - Installation Test Script
# This script verifies that the installation is working correctly

set -e

echo "🧪 Testing WebAssembly Fractal Generator Installation..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Test 1: Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"

PREREQ_PASSED=0

command_exists rustc
if print_result $? "Rust compiler found"; then
    ((PREREQ_PASSED++))
fi

command_exists cargo  
if print_result $? "Cargo package manager found"; then
    ((PREREQ_PASSED++))
fi

command_exists wasm-pack
if print_result $? "wasm-pack found"; then
    ((PREREQ_PASSED++))
else
    echo -e "${YELLOW}💡 To install wasm-pack: cargo install wasm-pack${NC}"
fi

command_exists python3
if print_result $? "Python 3 found"; then
    ((PREREQ_PASSED++))
fi

if [ $PREREQ_PASSED -lt 3 ]; then
    echo -e "${YELLOW}⚠️  Missing prerequisites. Run ./setup-wasm.sh to install missing components.${NC}"
fi

# Test 2: Check project structure
echo ""
echo -e "${BLUE}📁 Checking Project Structure...${NC}"

test -f "fractal-wasm/Cargo.toml"
print_result $? "Rust project configuration found"

test -f "setup-wasm.sh"
print_result $? "Setup script found"

test -f "test-wasm.html"
print_result $? "Test HTML file found"

test -d "wasm-frontend"
print_result $? "Frontend directory found"

# Test 3: Check WebAssembly build
echo ""
echo -e "${BLUE}🔨 Checking WebAssembly Build...${NC}"

WASM_BUILT=0

if test -d "fractal-wasm/pkg"; then
    print_result 0 "WebAssembly package directory exists"
    ((WASM_BUILT++))
else
    print_result 1 "WebAssembly package directory exists"
    echo -e "${YELLOW}💡 Run ./setup-wasm.sh to build WebAssembly module${NC}"
fi

if test -f "fractal-wasm/pkg/fractal_wasm.js"; then
    print_result 0 "JavaScript bindings found"
    ((WASM_BUILT++))
else
    print_result 1 "JavaScript bindings found"
fi

if test -f "fractal-wasm/pkg/fractal_wasm_bg.wasm"; then
    print_result 0 "WebAssembly binary found"
    ((WASM_BUILT++))
else
    print_result 1 "WebAssembly binary found"
fi

# Test 4: Build verification
echo ""
echo -e "${BLUE}🔧 Verifying Build System...${NC}"

cd fractal-wasm
if cargo check --quiet 2>/dev/null; then
    echo -e "${GREEN}✅ Rust project compiles correctly${NC}"
else
    echo -e "${RED}❌ Rust project has compilation issues${NC}"
fi
cd ..

# Test 5: Server availability test
echo ""
echo -e "${BLUE}🌐 Testing Local Server...${NC}"

# Check if server is already running
if curl -s http://localhost:8000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Local server is already running on port 8000${NC}"
    echo -e "${BLUE}🔗 Test URLs:${NC}"
    echo "   Simple test: http://localhost:8000/test-wasm.html"
    echo "   Full app:    http://localhost:8000/wasm-frontend/index.html"
else
    echo -e "${YELLOW}ℹ️  Local server not running on port 8000${NC}"
    echo -e "${BLUE}💡 To start the server, run:${NC}"
    echo "   python3 -m http.server 8000"
fi

# Test 6: File permissions
echo ""
echo -e "${BLUE}🔒 Checking File Permissions...${NC}"

if [ -x "setup-wasm.sh" ]; then
    echo -e "${GREEN}✅ Setup script is executable${NC}"
else
    echo -e "${YELLOW}⚠️  Setup script not executable (run: chmod +x setup-wasm.sh)${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}📊 Installation Test Summary${NC}"
echo "================================="

# Count files that should exist
EXPECTED_FILES=6
FOUND_FILES=0

[ -f "fractal-wasm/Cargo.toml" ] && ((FOUND_FILES++))
[ -f "fractal-wasm/pkg/fractal_wasm.js" ] && ((FOUND_FILES++))
[ -f "fractal-wasm/pkg/fractal_wasm_bg.wasm" ] && ((FOUND_FILES++))
[ -f "test-wasm.html" ] && ((FOUND_FILES++))
[ -f "wasm-frontend/index.html" ] && ((FOUND_FILES++))
[ -f "wasm-frontend/fractal.js" ] && ((FOUND_FILES++))

if [ $FOUND_FILES -eq $EXPECTED_FILES ] && [ $WASM_BUILT -eq 3 ]; then
    echo -e "${GREEN}🎉 All core files present ($FOUND_FILES/$EXPECTED_FILES)${NC}"
    echo -e "${GREEN}✅ Installation appears to be working correctly!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "1. Start the server: python3 -m http.server 8000"
    echo "2. Open browser to: http://localhost:8000/test-wasm.html"
    echo "3. Verify fractal generation works"
    echo "4. Test the full app: http://localhost:8000/wasm-frontend/index.html"
    echo "5. Run automated tests: http://localhost:8000/test-ui-functionality.html"
elif [ $WASM_BUILT -eq 0 ]; then
    echo -e "${RED}⚠️  WebAssembly module not built${NC}"
    echo -e "${YELLOW}💡 Run: ./setup-wasm.sh${NC}"
else
    echo -e "${RED}⚠️  Some files missing ($FOUND_FILES/$EXPECTED_FILES found)${NC}"
    echo -e "${YELLOW}💡 Try running: ./setup-wasm.sh${NC}"
fi

echo ""
echo -e "${BLUE}📚 For detailed testing procedures, see: INSTALL.md${NC}"