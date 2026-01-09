"""
Unit tests for savings goals endpoints.
"""
import pytest
from datetime import date, timedelta


class TestSavingsGoalsGetEndpoints:
    """Test GET endpoints for savings goals."""

    def test_get_all_goals(self, client, auth_headers, test_savings_goal):
        """Test getting all savings goals for a user."""
        response = client.get('/api/savings-goals', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check that progress is calculated
        for goal in data:
            assert 'id' in goal
            assert 'name' in goal
            assert 'target_amount' in goal
            assert 'current_amount' in goal
            assert 'progress' in goal
            assert 0 <= goal['progress'] <= 100

    def test_get_goals_empty(self, client, auth_headers):
        """Test getting goals when none exist."""
        response = client.get('/api/savings-goals', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_goals_with_completion_filter(self, client, auth_headers, test_savings_goal):
        """Test getting goals filtered by completion status."""
        response = client.get(
            '/api/savings-goals?is_completed=false',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert all(not goal['is_completed'] for goal in data)

    def test_get_single_goal(self, client, auth_headers, test_savings_goal):
        """Test getting a single savings goal by ID."""
        response = client.get(
            f'/api/savings-goals/{test_savings_goal.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == test_savings_goal.id
        assert data['name'] == test_savings_goal.name
        assert float(data['target_amount']) == float(test_savings_goal.target_amount)
        assert float(data['current_amount']) == float(test_savings_goal.current_amount)

    def test_get_nonexistent_goal(self, client, auth_headers):
        """Test getting a goal that doesn't exist."""
        response = client.get('/api/savings-goals/99999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data

    def test_get_goals_unauthorized(self, client, test_savings_goal):
        """Test getting goals without authentication."""
        response = client.get('/api/savings-goals')
        
        assert response.status_code == 401

    def test_get_goals_progress_calculation(self, client, auth_headers, db_session, test_user):
        """Test that progress is calculated correctly."""
        from models import SavingsGoal
        
        # Create goal with 50% completion
        goal = SavingsGoal(
            user_id=test_user.id,
            name='Half Complete Goal',
            target_amount=1000.00,
            current_amount=500.00,
            icon='savings',
            color='#4CAF50'
        )
        db_session.add(goal)
        db_session.commit()
        
        response = client.get('/api/savings-goals', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        goal_data = next((g for g in data if g['name'] == 'Half Complete Goal'), None)
        assert goal_data is not None
        assert goal_data['progress'] == 50.0

    def test_get_goals_over_100_percent(self, client, auth_headers, db_session, test_user):
        """Test goal with current amount exceeding target."""
        from models import SavingsGoal
        
        goal = SavingsGoal(
            user_id=test_user.id,
            name='Exceeded Goal',
            target_amount=1000.00,
            current_amount=1200.00,
            is_completed=True,
            icon='savings',
            color='#4CAF50'
        )
        db_session.add(goal)
        db_session.commit()
        
        response = client.get('/api/savings-goals', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        goal_data = next((g for g in data if g['name'] == 'Exceeded Goal'), None)
        assert goal_data is not None
        assert goal_data['progress'] == 120.0
        assert goal_data['is_completed'] is True


class TestSavingsGoalsCreateEndpoint:
    """Test CREATE endpoint for savings goals."""

    def test_create_goal(self, client, auth_headers):
        """Test creating a new savings goal."""
        goal_data = {
            'name': 'New Car Fund',
            'target_amount': 5000.00,
            'current_amount': 0.00,
            'target_date': (date.today() + timedelta(days=365)).isoformat(),
            'icon': 'directions_car',
            'color': '#2196F3'
        }
        
        response = client.post(
            '/api/savings-goals',
            json=goal_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'goal' in data
        assert data['goal']['name'] == goal_data['name']
        assert float(data['goal']['target_amount']) == goal_data['target_amount']
        assert data['goal']['progress'] == 0.0

