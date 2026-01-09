"""
Unit tests for recurring bills endpoints.
"""
import pytest
from datetime import date, timedelta


class TestRecurringBillsGetEndpoints:
    """Test GET endpoints for recurring bills."""

    def test_get_all_bills(self, client, auth_headers, test_recurring_bill):
        """Test getting all recurring bills for a user."""
        response = client.get('/api/recurring-bills', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check that reminder information is included
        for bill in data:
            assert 'id' in bill
            assert 'name' in bill
            assert 'amount' in bill
            assert 'frequency' in bill
            assert 'next_due_date' in bill
            assert 'days_until_due' in bill
            assert 'is_overdue' in bill
            assert 'needs_reminder' in bill

    def test_get_bills_empty(self, client, auth_headers):
        """Test getting bills when none exist."""
        response = client.get('/api/recurring-bills', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_bills_with_active_filter(self, client, auth_headers, test_recurring_bill):
        """Test getting bills filtered by active status."""
        response = client.get(
            '/api/recurring-bills?is_active=true',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert all(bill['is_active'] for bill in data)

    def test_get_single_bill(self, client, auth_headers, test_recurring_bill):
        """Test getting a single recurring bill by ID."""
        response = client.get(
            f'/api/recurring-bills/{test_recurring_bill.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == test_recurring_bill.id
        assert data['name'] == test_recurring_bill.name
        assert float(data['amount']) == float(test_recurring_bill.amount)

    def test_get_nonexistent_bill(self, client, auth_headers):
        """Test getting a bill that doesn't exist."""
        response = client.get('/api/recurring-bills/99999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data

    def test_get_bills_unauthorized(self, client, test_recurring_bill):
        """Test getting bills without authentication."""
        response = client.get('/api/recurring-bills')
        
        assert response.status_code == 401

    def test_get_bills_with_reminder_status(self, client, auth_headers, db_session, test_user, test_categories):
        """Test that bills include correct reminder status."""
        from models import RecurringBill
        
        # Create bill due in 2 days (should need reminder if reminder_days >= 2)
        bill = RecurringBill(
            user_id=test_user.id,
            category_id=test_categories[0].id,
            name='Soon Due Bill',
            amount=50.00,
            frequency='monthly',
            next_due_date=date.today() + timedelta(days=2),
            reminder_days=3,
            is_active=True
        )
        db_session.add(bill)
        db_session.commit()
        
        response = client.get('/api/recurring-bills', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        bill_data = next((b for b in data if b['name'] == 'Soon Due Bill'), None)
        assert bill_data is not None
        assert bill_data['needs_reminder'] is True

    def test_get_bills_ordered_by_due_date(self, client, auth_headers, db_session, test_user, test_categories):
        """Test that bills are ordered by next due date."""
        from models import RecurringBill
        
        # Create multiple bills with different due dates
        for i in range(3):
            bill = RecurringBill(
                user_id=test_user.id,
                category_id=test_categories[0].id,
                name=f'Bill {i}',
                amount=50.00,
                frequency='monthly',
                next_due_date=date.today() + timedelta(days=i+1),
                reminder_days=3,
                is_active=True
            )
            db_session.add(bill)
        db_session.commit()
        
        response = client.get('/api/recurring-bills', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Check that due dates are in ascending order
        due_dates = [bill['next_due_date'] for bill in data]
        assert due_dates == sorted(due_dates)


class TestRecurringBillsCreateEndpoint:
    """Test CREATE endpoint for recurring bills."""

    def test_create_bill(self, client, auth_headers, test_categories):
        """Test creating a new recurring bill."""
        bill_data = {
            'name': 'Test Monthly Bill',
            'category_id': test_categories[0].id,
            'amount': 150.00,
            'frequency': 'monthly',
            'next_due_date': (date.today() + timedelta(days=15)).isoformat(),
            'reminder_days': 5,
            'is_active': True
        }
        
        response = client.post(
            '/api/recurring-bills',
            json=bill_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'bill' in data
        assert data['bill']['name'] == bill_data['name']
        assert float(data['bill']['amount']) == bill_data['amount']

