"""
Unit tests for categories endpoints.
"""
import pytest


class TestCategoriesGetEndpoints:
    """Test GET endpoints for categories."""

    def test_get_all_categories(self, client, auth_headers, test_categories):
        """Test getting all categories."""
        response = client.get('/api/categories', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 10  # We create 10 test categories
        
        # Check structure of category objects
        for category in data:
            assert 'id' in category
            assert 'name' in category
            assert 'icon' in category
            assert 'color' in category

    def test_get_categories_includes_all_fields(self, client, auth_headers):
        """Test that categories include all required fields."""
        response = client.get('/api/categories', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        if len(data) > 0:
            category = data[0]
            assert 'id' in category
            assert 'name' in category
            assert 'icon' in category
            assert 'color' in category
            assert isinstance(category['id'], int)
            assert isinstance(category['name'], str)

    def test_get_categories_unauthorized(self, client):
        """Test getting categories without authentication."""
        response = client.get('/api/categories')
        
        assert response.status_code == 401

    def test_get_categories_returns_consistent_data(self, client, auth_headers):
        """Test that categories are consistent across multiple requests."""
        response1 = client.get('/api/categories', headers=auth_headers)
        response2 = client.get('/api/categories', headers=auth_headers)
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.get_json()
        data2 = response2.get_json()
        
        assert len(data1) == len(data2)
        assert data1 == data2

