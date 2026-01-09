"""
Unit tests for budgets endpoints.
"""
import pytest
from datetime import date


class TestBudgetsGetEndpoints:
    """Test GET endpoints for budgets."""

    def test_get_all_budgets(self, client, auth_headers, multiple_budgets):
        """Test getting all budgets for a user."""
        response = client.get('/api/budgets', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 3
        
        # Check that spending information is included
        for budget in data:
            assert 'id' in budget
            assert 'amount' in budget
            assert 'spent' in budget
            assert 'remaining' in budget
            assert 'percentage' in budget

    def test_get_budgets_empty(self, client, auth_headers):
        """Test getting budgets when none exist."""
        response = client.get('/api/budgets', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_budgets_with_period_filter(self, client, auth_headers, test_budget):
        """Test getting budgets filtered by period."""
        response = client.get(
            '/api/budgets?period=monthly',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert all(budget['period'] == 'monthly' for budget in data)

    def test_get_single_budget(self, client, auth_headers, test_budget):
        """Test getting a single budget by ID."""
        response = client.get(
            f'/api/budgets/{test_budget.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == test_budget.id
        assert float(data['amount']) == float(test_budget.amount)
        assert data['period'] == test_budget.period

    def test_get_nonexistent_budget(self, client, auth_headers):
        """Test getting a budget that doesn't exist."""
        response = client.get('/api/budgets/99999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data

    def test_get_budgets_unauthorized(self, client, multiple_budgets):
        """Test getting budgets without authentication."""
        response = client.get('/api/budgets')
        
        assert response.status_code == 401

    def test_get_budgets_with_spending_calculation(self, client, auth_headers, test_budget, test_expense):
        """Test that budgets include accurate spending calculations."""
        # Create expense in same category as budget
        from models import Expense
        expense = Expense(
            user_id=test_budget.user_id,
            category_id=test_budget.category_id,
            amount=100.00,
            description='Test Expense',
            date=date.today()
        )
        from conftest import db
        db.session.add(expense)
        db.session.commit()
        
        response = client.get('/api/budgets', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Find the budget we're testing
        budget = next((b for b in data if b['id'] == test_budget.id), None)
        assert budget is not None
        assert budget['spent'] >= 0
        assert budget['remaining'] == budget['amount'] - budget['spent']

    def test_get_budgets_with_category_details(self, client, auth_headers, test_budget):
        """Test that budget includes category details."""
        response = client.get('/api/budgets', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        if len(data) > 0:
            budget = data[0]
            assert 'category' in budget
            assert 'name' in budget['category']
            assert 'icon' in budget['category']


class TestBudgetsCreateEndpoint:
    """Test CREATE endpoint for budgets."""

    def test_create_budget(self, client, auth_headers, test_categories):
        """Test creating a new budget."""
        budget_data = {
            'category_id': test_categories[1].id,  # Use different category
            'amount': 600.00,
            'period': 'monthly',
            'start_date': date.today().isoformat()
        }
        
        response = client.post(
            '/api/budgets',
            json=budget_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'budget' in data
        assert float(data['budget']['amount']) == budget_data['amount']
        assert data['budget']['period'] == budget_data['period']

    def test_create_duplicate_budget(self, client, auth_headers, test_budget):
        """Test creating a budget that already exists for category/period."""
        budget_data = {
            'category_id': test_budget.category_id,
            'amount': 700.00,
            'period': test_budget.period,
            'start_date': date.today().isoformat()
        }
        
        response = client.post(
            '/api/budgets',
            json=budget_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

