"""
Unit tests for dashboard endpoints.
"""
import pytest
from datetime import date, timedelta


class TestDashboardGetEndpoints:
    """Test GET endpoints for dashboard."""

    def test_get_dashboard_stats(self, client, auth_headers):
        """Test getting dashboard statistics."""
        response = client.get('/api/dashboard/stats', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Check all required fields are present
        assert 'total_expenses' in data
        assert 'total_budget' in data
        assert 'budget_remaining' in data
        assert 'budget_percentage' in data
        assert 'upcoming_bills' in data
        assert 'active_savings_goals' in data
        assert 'total_saved' in data
        
        # Check data types
        assert isinstance(data['total_expenses'], (int, float))
        assert isinstance(data['total_budget'], (int, float))
        assert isinstance(data['upcoming_bills'], int)

    def test_get_dashboard_stats_with_data(self, client, auth_headers, test_expense, test_budget, test_savings_goal):
        """Test dashboard stats with actual data."""
        response = client.get('/api/dashboard/stats', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['total_expenses'] >= 0
        assert data['total_budget'] >= 0
        assert data['active_savings_goals'] >= 1

    def test_get_spending_by_category(self, client, auth_headers, multiple_expenses):
        """Test getting spending breakdown by category."""
        response = client.get('/api/dashboard/spending-by-category', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        
        # Check structure of category spending
        for item in data:
            assert 'category_id' in item
            assert 'category_name' in item
            assert 'color' in item
            assert 'icon' in item
            assert 'amount' in item
            assert isinstance(item['amount'], (int, float))

    def test_get_spending_by_category_with_period(self, client, auth_headers, multiple_expenses):
        """Test getting spending by category with period filter."""
        response = client.get(
            '/api/dashboard/spending-by-category?period=month',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_get_spending_trend(self, client, auth_headers, multiple_expenses):
        """Test getting spending trend over time."""
        response = client.get('/api/dashboard/spending-trend', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        
        # Check structure of trend data
        for item in data:
            assert 'month' in item
            assert 'amount' in item
            assert isinstance(item['amount'], (int, float))

    def test_get_spending_trend_with_period(self, client, auth_headers):
        """Test getting spending trend with period parameter."""
        response = client.get(
            '/api/dashboard/spending-trend?period=year',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) <= 12  # Year should return max 12 months

    def test_get_recent_expenses(self, client, auth_headers, multiple_expenses):
        """Test getting recent expenses."""
        response = client.get('/api/dashboard/recent-expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) <= 10  # Default limit is 10
        
        # Check expense structure
        if len(data) > 0:
            expense = data[0]
            assert 'id' in expense
            assert 'description' in expense
            assert 'amount' in expense
            assert 'date' in expense

    def test_get_recent_expenses_with_limit(self, client, auth_headers, multiple_expenses):
        """Test getting recent expenses with custom limit."""
        response = client.get(
            '/api/dashboard/recent-expenses?limit=3',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) <= 3

    def test_get_budget_overview(self, client, auth_headers, multiple_budgets, multiple_expenses):
        """Test getting budget overview."""
        response = client.get('/api/dashboard/budget-overview', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        
        # Check budget overview structure
        for budget in data:
            assert 'id' in budget
            assert 'amount' in budget
            assert 'spent' in budget
            assert 'remaining' in budget
            assert 'percentage' in budget
            assert 'status' in budget
            assert budget['status'] in ['good', 'warning', 'exceeded']

    def test_get_dashboard_stats_unauthorized(self, client):
        """Test getting dashboard stats without authentication."""
        response = client.get('/api/dashboard/stats')
        
        assert response.status_code == 401

    def test_get_spending_by_category_empty(self, client, auth_headers):
        """Test spending by category with no expenses."""
        response = client.get('/api/dashboard/spending-by-category', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

