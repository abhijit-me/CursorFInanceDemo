#!/bin/bash

# Backend Test Runner Script
# This script runs the backend unit tests with proper configuration

set -e  # Exit on error

echo "🧪 Personal Finance Manager - Backend Tests"
echo "==========================================="
echo ""

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Warning: Virtual environment not activated"
    echo "   Run: source venv/bin/activate"
    echo ""
fi

# Check if test dependencies are installed
if ! python -c "import pytest" 2>/dev/null; then
    echo "📦 Installing test dependencies..."
    pip install -r requirements-test.txt
    echo ""
fi

# Check if test database exists
if ! psql -U financeuser -lqt | cut -d \| -f 1 | grep -qw financedb_test 2>/dev/null; then
    echo "⚠️  Test database 'financedb_test' not found"
    echo "   Creating test database..."
    psql -U postgres -c "CREATE DATABASE financedb_test;" 2>/dev/null || true
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE financedb_test TO financeuser;" 2>/dev/null || true
    echo "   ✅ Test database created"
    echo ""
fi

# Parse command line arguments
TEST_PATH="${1:-tests/}"
VERBOSE=""
COVERAGE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE="-v"
            shift
            ;;
        -c|--coverage)
            COVERAGE="--cov=. --cov-report=html --cov-report=term-missing"
            shift
            ;;
        -h|--help)
            echo "Usage: ./run_tests.sh [OPTIONS] [TEST_PATH]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose    Verbose output"
            echo "  -c, --coverage   Generate coverage report"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./run_tests.sh                          # Run all tests"
            echo "  ./run_tests.sh -v                       # Run with verbose output"
            echo "  ./run_tests.sh -c                       # Run with coverage"
            echo "  ./run_tests.sh tests/test_expenses.py   # Run specific test file"
            exit 0
            ;;
        *)
            TEST_PATH="$1"
            shift
            ;;
    esac
done

# Run tests
echo "🚀 Running tests..."
echo ""

if [ -n "$COVERAGE" ]; then
    pytest $VERBOSE $COVERAGE $TEST_PATH
    echo ""
    echo "📊 Coverage report generated in htmlcov/index.html"
else
    pytest $VERBOSE $TEST_PATH
fi

echo ""
echo "✅ Tests completed!"

