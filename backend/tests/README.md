# Backend Unit Tests

Comprehensive unit test suite for the Personal Finance Manager backend API.

## Test Coverage

### Modules Tested

1. **Authentication (`test_auth.py`)**
   - User registration
   - User login
   - Get current user
   - Token validation

2. **Expenses (`test_expenses.py`)**
   - Get all expenses
   - Get single expense
   - Filter by category
   - Filter by date range
   - Create expense
   - Expense ordering

3. **Budgets (`test_budgets.py`)**
   - Get all budgets
   - Get single budget
   - Budget spending calculations
   - Filter by period
   - Create budget
   - Duplicate budget validation

4. **Categories (`test_categories.py`)**
   - Get all categories
   - Category structure validation
   - Data consistency

5. **Recurring Bills (`test_recurring_bills.py`)**
   - Get all bills
   - Get single bill
   - Reminder status calculation
   - Filter by active status
   - Create bill
   - Bill ordering by due date

6. **Savings Goals (`test_savings_goals.py`)**
   - Get all goals
   - Get single goal
   - Progress calculation
   - Filter by completion
   - Create goal
   - Over-target handling

7. **Dashboard (`test_dashboard.py`)**
   - Get statistics
   - Spending by category
   - Spending trends
   - Recent expenses
   - Budget overview

## Running Tests

### Prerequisites

```bash
# Install test dependencies
pip install -r requirements-test.txt
```

### Create Test Database

```bash
# Create test database
sudo -u postgres psql
CREATE DATABASE financedb_test;
GRANT ALL PRIVILEGES ON DATABASE financedb_test TO financeuser;
\q
```

### Run All Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=. --cov-report=html
```

### Run Specific Test Files

```bash
# Run authentication tests
pytest tests/test_auth.py

# Run expense tests
pytest tests/test_expenses.py

# Run dashboard tests
pytest tests/test_dashboard.py
```

### Run Specific Test Classes

```bash
# Run GET endpoint tests for expenses
pytest tests/test_expenses.py::TestExpensesGetEndpoints

# Run authentication endpoint tests
pytest tests/test_auth.py::TestAuthEndpoints
```

### Run Specific Test Functions

```bash
# Run single test
pytest tests/test_expenses.py::TestExpensesGetEndpoints::test_get_all_expenses

# Run tests matching a pattern
pytest -k "test_get"
```

## Test Markers

Tests are organized with markers for easy filtering:

```bash
# Run only unit tests
pytest -m unit

# Run integration tests
pytest -m integration

# Skip slow tests
pytest -m "not slow"
```

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Fixtures and configuration
├── test_auth.py            # Authentication tests
├── test_expenses.py        # Expense endpoint tests
├── test_budgets.py         # Budget endpoint tests
├── test_categories.py      # Category endpoint tests
├── test_recurring_bills.py # Recurring bill tests
├── test_savings_goals.py   # Savings goal tests
└── test_dashboard.py       # Dashboard endpoint tests
```

## Fixtures

Common fixtures available in all tests (defined in `conftest.py`):

- `app` - Flask application instance
- `client` - Test client for making requests
- `db_session` - Database session
- `test_user` - Pre-created test user
- `auth_headers` - Authentication headers with JWT token
- `test_categories` - Pre-created test categories
- `test_expense` - Single test expense
- `test_budget` - Single test budget
- `test_recurring_bill` - Single test recurring bill
- `test_savings_goal` - Single test savings goal
- `multiple_expenses` - Multiple test expenses
- `multiple_budgets` - Multiple test budgets

## Coverage Report

After running tests with coverage:

```bash
# Generate HTML coverage report
pytest --cov=. --cov-report=html

# View report
open htmlcov/index.html
```

## Writing New Tests

### Test Class Structure

```python
class TestFeatureGetEndpoints:
    """Test GET endpoints for feature."""

    def test_get_all_items(self, client, auth_headers):
        """Test getting all items."""
        response = client.get('/api/items', headers=auth_headers)
        assert response.status_code == 200
        # Additional assertions...
```

### Common Assertions

```python
# Status codes
assert response.status_code == 200
assert response.status_code == 201
assert response.status_code == 400
assert response.status_code == 401
assert response.status_code == 404

# Response structure
data = response.get_json()
assert isinstance(data, list)
assert 'field_name' in data
assert data['field'] == expected_value

# Data validation
assert len(data) > 0
assert all('id' in item for item in data)
```

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    pip install -r requirements-test.txt
    pytest --cov=. --cov-report=xml
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Fixtures**: Use fixtures for common setup
3. **Cleanup**: Tests automatically rollback database changes
4. **Naming**: Use descriptive test names (`test_what_when_expected`)
5. **Assertions**: Include meaningful assertion messages
6. **Coverage**: Aim for >80% code coverage

## Troubleshooting

### Database Connection Issues

```bash
# Verify test database exists
psql -U financeuser -l | grep financedb_test

# Recreate test database
dropdb -U postgres financedb_test
createdb -U postgres financedb_test
```

### Import Errors

```bash
# Ensure you're in the backend directory
cd backend

# Verify PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Failed Tests

```bash
# Run with more verbose output
pytest -vv

# Show print statements
pytest -s

# Stop on first failure
pytest -x
```

## Test Statistics

- **Total Test Files**: 8
- **Total Test Classes**: 14
- **Total Test Functions**: 70+
- **Coverage Target**: 80%+

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain >80% coverage
4. Update this README if needed

## Support

For issues with tests:
1. Check test database connection
2. Verify fixtures are loading correctly
3. Review test output for specific errors
4. Check `conftest.py` for fixture definitions

