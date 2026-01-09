"""
Unit tests for authentication endpoints.
"""
import pytest


class TestAuthEndpoints:
    """Test authentication API endpoints."""

    def test_register_user(self, client):
        """Test user registration."""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'password123',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['email'] == 'newuser@example.com'

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post('/api/auth/register', json={
            'email': test_user.email,
            'username': 'anotheruser',
            'password': 'password123'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': test_user.email,
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == test_user.email

    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials."""
        response = client.post('/api/auth/login', json={
            'email': test_user.email,
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data

    def test_get_current_user(self, client, auth_headers):
        """Test getting current user details."""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'email' in data
        assert 'username' in data

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authentication."""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401

