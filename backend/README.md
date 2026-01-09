# Backend - Personal Finance Manager

Flask-based REST API backend for the Personal Finance Manager application.

## 🏗️ Architecture

The backend follows a modular architecture with:
- **Blueprint-based routing** for organized API endpoints
- **SQLAlchemy ORM** for database operations
- **JWT authentication** for secure access
- **Auto-categorization engine** for intelligent expense classification

## 📁 Project Structure

```
backend/
├── api/                    # API blueprints
│   ├── __init__.py        # Blueprint registration
│   ├── auth.py            # Authentication endpoints
│   ├── expenses.py        # Expense management
│   ├── budgets.py         # Budget management
│   ├── recurring_bills.py # Recurring bills
│   ├── savings_goals.py   # Savings goals
│   ├── categories.py      # Categories
│   └── dashboard.py       # Dashboard statistics
├── utils/                 # Utility modules
│   ├── categorization.py # Auto-categorization logic
│   └── file_upload.py    # File handling
├── uploads/              # Receipt uploads (gitignored)
├── models.py             # Database models
├── config.py             # Configuration
├── app.py                # Application entry point
└── requirements.txt      # Python dependencies
```

## 🚀 Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file (based on `.env.example`):

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Database
DATABASE_URL=postgresql://financeuser:financepass@localhost:5432/financedb

# Upload settings
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# CORS
CORS_ORIGINS=http://localhost:4200
```

### 4. Run the Application

```bash
python app.py
```

Server runs on `http://localhost:5005`

## 🗄️ Database Models

### User
- Email, username, password (hashed)
- Relationships: expenses, budgets, recurring_bills, savings_goals

### Category
- Name, icon, color
- Predefined categories for expense classification

### Expense
- Amount, description, date, notes
- Optional receipt upload
- Foreign keys: user_id, category_id

### Budget
- Amount, period (monthly/yearly)
- Foreign keys: user_id, category_id
- Tracks spending vs. budget

### RecurringBill
- Name, amount, frequency, next_due_date
- Reminder settings
- Foreign keys: user_id, category_id

### SavingsGoal
- Name, target_amount, current_amount
- Optional target_date, icon, color
- Foreign key: user_id

### CategorizationRule
- Keyword-based rules for auto-categorization
- Priority-based matching

## 🔐 Authentication

JWT-based authentication with access and refresh tokens:

```python
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {...}
}
```

Protected endpoints require `Authorization: Bearer <token>` header.

## 📝 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info
- `PUT /me` - Update user info

### Expenses (`/api/expenses`)
- `GET /` - List expenses (with filters)
- `GET /:id` - Get expense details
- `POST /` - Create expense (with receipt upload)
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense
- `GET /receipts/:filename` - Get receipt file

### Budgets (`/api/budgets`)
- `GET /` - List budgets with spending
- `POST /` - Create budget
- `PUT /:id` - Update budget
- `DELETE /:id` - Delete budget

### Recurring Bills (`/api/recurring-bills`)
- `GET /` - List recurring bills
- `POST /` - Create bill
- `PUT /:id` - Update bill
- `DELETE /:id` - Delete bill
- `POST /:id/pay` - Mark as paid (updates next due date)

### Savings Goals (`/api/savings-goals`)
- `GET /` - List goals
- `POST /` - Create goal
- `PUT /:id` - Update goal
- `DELETE /:id` - Delete goal
- `POST /:id/contribute` - Add contribution

### Categories (`/api/categories`)
- `GET /` - List all categories

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get dashboard statistics
- `GET /spending-by-category` - Category breakdown
- `GET /spending-trend` - Monthly spending trends
- `GET /recent-expenses` - Recent expenses
- `GET /budget-overview` - Budget status overview

## 🤖 Auto-Categorization

The system automatically categorizes expenses based on:

1. **Custom Rules**: User-defined keyword patterns
2. **Built-in Rules**: Predefined patterns for common merchants
3. **Keyword Matching**: Description analysis

Example rules:
- "Starbucks" → Dining
- "Walmart" → Groceries
- "Netflix" → Entertainment

## 📤 File Uploads

Receipt uploads are handled with:
- Allowed formats: PNG, JPG, JPEG, GIF, PDF
- Max size: 16MB
- Unique filename generation
- Secure file storage

## ⚙️ Configuration

Configuration is managed through environment variables and `config.py`:

```python
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    # ... more settings
```

## 🧪 Testing

### Setup Test Environment

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Create test database
sudo -u postgres psql
CREATE DATABASE financedb_test;
GRANT ALL PRIVILEGES ON DATABASE financedb_test TO financeuser;
\q
```

### Run Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_expenses.py

# Run specific test
pytest tests/test_expenses.py::TestExpensesGetEndpoints::test_get_all_expenses
```

### Test Coverage

The test suite includes 70+ unit tests covering:
- ✅ Authentication (6 tests)
- ✅ Expenses GET endpoints (10 tests)
- ✅ Budgets GET endpoints (8 tests)
- ✅ Categories GET endpoints (4 tests)
- ✅ Recurring Bills GET endpoints (9 tests)
- ✅ Savings Goals GET endpoints (9 tests)
- ✅ Dashboard GET endpoints (10 tests)
- ✅ Create/Update operations (14 tests)

See `tests/README.md` for detailed documentation.

## 🔒 Security Features

- Password hashing with werkzeug
- JWT token authentication
- CORS protection
- SQL injection prevention (SQLAlchemy)
- File upload validation
- Input sanitization

## 📊 Database Migrations

Using Flask-Migrate for schema changes:

```bash
# Initialize migrations
flask db init

# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade
```

## 🐛 Debugging

Enable debug mode:

```python
FLASK_ENV=development
DEBUG=True
```

View logs in console output.

## 📦 Dependencies

Key packages:
- **Flask 3.0.0** - Web framework
- **Flask-SQLAlchemy 3.1.1** - ORM
- **Flask-JWT-Extended 4.6.0** - JWT auth
- **psycopg2-binary 2.9.9** - PostgreSQL adapter
- **Flask-CORS 4.0.0** - CORS handling
- **Pillow 10.1.0** - Image processing

## 🚀 Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5005 app:app
```

### Environment Variables

Set production environment variables:
- Use strong SECRET_KEY and JWT_SECRET_KEY
- Set FLASK_ENV=production
- Configure production DATABASE_URL
- Set appropriate CORS_ORIGINS

### Database

Ensure PostgreSQL is properly configured with:
- Connection pooling
- Regular backups
- Proper indexing

## 📈 Performance Optimization

- Database query optimization with indexes
- Pagination for large result sets
- Caching with Redis (recommended for production)
- File compression for uploads

## 🔗 Integration

The backend integrates with:
- PostgreSQL database
- File system for uploads
- Frontend Angular application via REST API

## 📞 Support

For backend-specific issues, check:
- Flask logs
- PostgreSQL logs
- Error responses from API endpoints
