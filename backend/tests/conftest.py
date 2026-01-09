"""
Pytest configuration and fixtures for backend tests.
"""
import pytest
import os
from app import create_app
from models import db, User, Category, Expense, Budget, RecurringBill, SavingsGoal
from datetime import date, datetime, timedelta


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    # Set test configuration
    os.environ['DATABASE_URL'] = 'postgresql://financeuser:financepass@localhost:5432/financedb_test'
    os.environ['FLASK_ENV'] = 'testing'
    
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'postgresql://financeuser:financepass@localhost:5432/financedb_test',
        'WTF_CSRF_ENABLED': False,
    })
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create test categories
        categories_data = [
            {'name': 'Groceries', 'icon': 'shopping_cart', 'color': '#4CAF50'},
            {'name': 'Dining', 'icon': 'restaurant', 'color': '#FF9800'},
            {'name': 'Transportation', 'icon': 'directions_car', 'color': '#2196F3'},
            {'name': 'Utilities', 'icon': 'flash_on', 'color': '#9C27B0'},
            {'name': 'Entertainment', 'icon': 'movie', 'color': '#E91E63'},
            {'name': 'Shopping', 'icon': 'shopping_bag', 'color': '#00BCD4'},
            {'name': 'Healthcare', 'icon': 'local_hospital', 'color': '#F44336'},
            {'name': 'Housing', 'icon': 'home', 'color': '#795548'},
            {'name': 'Personal', 'icon': 'person', 'color': '#607D8B'},
            {'name': 'Other', 'icon': 'more_horiz', 'color': '#9E9E9E'},
        ]
        
        for cat_data in categories_data:
            if not Category.query.filter_by(name=cat_data['name']).first():
                category = Category(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        
        yield app
        
        # Cleanup
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope='function')
def db_session(app):
    """Create database session for tests."""
    with app.app_context():
        yield db.session
        # Rollback changes after each test
        db.session.rollback()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email='test@example.com',
        username='testuser',
        first_name='Test',
        last_name='User'
    )
    user.set_password('password123')
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post('/api/auth/login', json={
        'email': test_user.email,
        'password': 'password123'
    })
    data = response.get_json()
    token = data['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def test_categories(db_session):
    """Get test categories."""
    return Category.query.all()


@pytest.fixture
def test_expense(db_session, test_user, test_categories):
    """Create a test expense."""
    expense = Expense(
        user_id=test_user.id,
        category_id=test_categories[0].id,
        amount=50.00,
        description='Test Expense',
        notes='This is a test',
        date=date.today(),
        is_recurring=False
    )
    db_session.add(expense)
    db_session.commit()
    return expense


@pytest.fixture
def test_budget(db_session, test_user, test_categories):
    """Create a test budget."""
    budget = Budget(
        user_id=test_user.id,
        category_id=test_categories[0].id,
        amount=500.00,
        period='monthly',
        start_date=date.today()
    )
    db_session.add(budget)
    db_session.commit()
    return budget


@pytest.fixture
def test_recurring_bill(db_session, test_user, test_categories):
    """Create a test recurring bill."""
    bill = RecurringBill(
        user_id=test_user.id,
        category_id=test_categories[0].id,
        name='Test Bill',
        amount=100.00,
        frequency='monthly',
        next_due_date=date.today() + timedelta(days=7),
        reminder_days=3,
        is_active=True
    )
    db_session.add(bill)
    db_session.commit()
    return bill


@pytest.fixture
def test_savings_goal(db_session, test_user):
    """Create a test savings goal."""
    goal = SavingsGoal(
        user_id=test_user.id,
        name='Test Goal',
        target_amount=1000.00,
        current_amount=250.00,
        target_date=date.today() + timedelta(days=180),
        icon='savings',
        color='#4CAF50'
    )
    db_session.add(goal)
    db_session.commit()
    return goal


@pytest.fixture
def multiple_expenses(db_session, test_user, test_categories):
    """Create multiple test expenses."""
    expenses = []
    for i in range(5):
        expense = Expense(
            user_id=test_user.id,
            category_id=test_categories[i % len(test_categories)].id,
            amount=50.00 + (i * 10),
            description=f'Test Expense {i+1}',
            date=date.today() - timedelta(days=i),
            is_recurring=False
        )
        db_session.add(expense)
        expenses.append(expense)
    db_session.commit()
    return expenses


@pytest.fixture
def multiple_budgets(db_session, test_user, test_categories):
    """Create multiple test budgets."""
    budgets = []
    for i, category in enumerate(test_categories[:3]):
        budget = Budget(
            user_id=test_user.id,
            category_id=category.id,
            amount=500.00 + (i * 100),
            period='monthly',
            start_date=date.today()
        )
        db_session.add(budget)
        budgets.append(budget)
    db_session.commit()
    return budgets

