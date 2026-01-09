"""
Unit tests for expenses endpoints.
"""
import pytest
from datetime import date, timedelta


class TestExpensesGetEndpoints:
    """Test GET endpoints for expenses."""

    def test_get_all_expenses(self, client, auth_headers, multiple_expenses):
        """Test getting all expenses for a user."""
        response = client.get('/api/expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 5
        assert all('id' in expense for expense in data)
        assert all('amount' in expense for expense in data)
        assert all('description' in expense for expense in data)

    def test_get_expenses_empty(self, client, auth_headers):
        """Test getting expenses when none exist."""
        response = client.get('/api/expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_expenses_with_category_filter(self, client, auth_headers, multiple_expenses, test_categories):
        """Test getting expenses filtered by category."""
        category_id = test_categories[0].id
        response = client.get(
            f'/api/expenses?category_id={category_id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert all(expense['category_id'] == category_id for expense in data)

    def test_get_expenses_with_date_filter(self, client, auth_headers, multiple_expenses):
        """Test getting expenses filtered by date range."""
        start_date = (date.today() - timedelta(days=3)).isoformat()
        end_date = date.today().isoformat()
        
        response = client.get(
            f'/api/expenses?start_date={start_date}&end_date={end_date}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) <= 5

    def test_get_single_expense(self, client, auth_headers, test_expense):
        """Test getting a single expense by ID."""
        response = client.get(
            f'/api/expenses/{test_expense.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == test_expense.id
        assert data['description'] == test_expense.description
        assert float(data['amount']) == float(test_expense.amount)
        assert 'category' in data

    def test_get_nonexistent_expense(self, client, auth_headers):
        """Test getting an expense that doesn't exist."""
        response = client.get('/api/expenses/99999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data

    def test_get_expenses_unauthorized(self, client, multiple_expenses):
        """Test getting expenses without authentication."""
        response = client.get('/api/expenses')
        
        assert response.status_code == 401

    def test_get_expenses_ordered_by_date(self, client, auth_headers, multiple_expenses):
        """Test that expenses are returned in date descending order."""
        response = client.get('/api/expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Check that dates are in descending order
        dates = [expense['date'] for expense in data]
        assert dates == sorted(dates, reverse=True)

    def test_get_expenses_with_category_details(self, client, auth_headers, test_expense):
        """Test that expense includes category details."""
        response = client.get('/api/expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        if len(data) > 0:
            expense = data[0]
            assert 'category' in expense
            assert 'name' in expense['category']
            assert 'icon' in expense['category']
            assert 'color' in expense['category']


class TestExpensesCreateEndpoint:
    """Test CREATE endpoint for expenses."""

    def test_create_expense(self, client, auth_headers, test_categories):
        """Test creating a new expense."""
        expense_data = {
            'amount': 75.50,
            'description': 'Test Grocery Shopping',
            'category_id': test_categories[0].id,
            'date': date.today().isoformat(),
            'notes': 'Weekly groceries'
        }
        
        response = client.post(
            '/api/expenses',
            json=expense_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'expense' in data
        assert data['expense']['description'] == expense_data['description']
        assert float(data['expense']['amount']) == expense_data['amount']

    def test_create_expense_missing_required_fields(self, client, auth_headers):
        """Test creating expense without required fields."""
        response = client.post(
            '/api/expenses',
            json={'description': 'Incomplete'},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

