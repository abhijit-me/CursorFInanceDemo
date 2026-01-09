# Personal Finance Manager - Smart Budgeting Application

A full-stack Personal Finance Manager application with smart budgeting features, built with Angular, Flask, and PostgreSQL. Track expenses, manage budgets, monitor recurring bills, and achieve savings goals with beautiful Material Design UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-17-red)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)

## 🌟 Features

### Expense Management
- ✅ Add, edit, and delete expenses
- 📸 Upload and attach receipt images
- 🤖 Automatic expense categorization using rule-based logic
- 🔍 Advanced filtering by category, date range
- 📊 Visual expense tracking

### Budget Management
- 💰 Create monthly/yearly budgets per category
- 📈 Real-time budget usage tracking
- ⚠️ Visual indicators for budget status (good/warning/exceeded)
- 🎯 Budget progress monitoring

### Recurring Bills & Reminders
- 🔄 Track recurring bills (weekly/monthly/yearly)
- 🔔 Automatic reminders for upcoming bills
- ⏰ Overdue bill notifications
- ✅ Mark bills as paid with automatic next due date calculation

### Savings Goals
- 🎯 Set and track savings goals
- 📊 Progress visualization
- 💵 Easy contribution tracking
- 🏆 Goal completion status

### Dashboard & Analytics
- 📊 Interactive charts and visualizations
- 📈 Spending trends over time
- 🥧 Category-wise spending breakdown
- 📉 Budget overview with progress bars
- 📋 Recent expenses summary

### Authentication & Security
- 🔐 JWT-based authentication
- 👤 User registration and login
- 🔒 Protected routes and API endpoints
- 🔑 Token refresh mechanism

## 🏗️ Project Structure

```
CursorFInanceDemo/
├── frontend/              # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Services, guards, interceptors, models
│   │   │   └── features/ # Feature modules (dashboard, expenses, etc.)
│   │   └── environments/
│   └── package.json
├── backend/               # Flask application
│   ├── api/              # API blueprints
│   ├── models.py         # Database models
│   ├── utils/            # Utility functions
│   └── app.py            # Application entry point
└── database/             # Database scripts
    ├── init.sql          # Schema definition
    └── seed.sql          # Seed data
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 12+

### 1. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE financedb;
CREATE USER financeuser WITH PASSWORD 'financepass';
GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;
\q

# Initialize schema and seed data
cd database
psql -U financeuser -d financedb -f init.sql
psql -U financeuser -d financedb -f seed.sql
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (copy and edit)
cp .env.example .env
# Edit .env with your database credentials

# Run the application
python app.py
```

Backend will run on `http://localhost:5005`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start
```

Frontend will run on `http://localhost:4200`

### 4. Access the Application

Open your browser and navigate to `http://localhost:4200`

**Demo Account:**
- Email: `demo@financeapp.com`
- Password: `demo123`

Or create a new account using the registration form.

## 📖 Detailed Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Documentation](./database/README.md)
- [API Documentation](./backend/API.md)

## 🛠️ Technology Stack

### Frontend
- **Angular 17** - Modern web framework
- **Angular Material** - Material Design components
- **Chart.js & ng2-charts** - Data visualization
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe development

### Backend
- **Flask 3.0** - Python web framework
- **Flask-JWT-Extended** - JWT authentication
- **Flask-SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Marshmallow** - Object serialization

### DevOps
- **Git** - Version control
- **npm** - Frontend package management
- **pip** - Python package management

## 🎨 Screenshots

### Dashboard
Beautiful, informative dashboard with charts and statistics

### Expense Management
Easy expense tracking with receipt uploads and auto-categorization

### Budget Tracking
Visual budget monitoring with progress indicators

### Savings Goals
Track multiple savings goals with progress visualization

## 🔧 Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

### Building for Production

```bash
# Frontend build
cd frontend
ng build --configuration production

# Backend (use gunicorn)
cd backend
gunicorn -w 4 -b 0.0.0.0:5005 app:app
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Recurring Bills
- `GET /api/recurring-bills` - Get all bills
- `POST /api/recurring-bills` - Create bill
- `POST /api/recurring-bills/:id/pay` - Mark as paid

### Savings Goals
- `GET /api/savings-goals` - Get all goals
- `POST /api/savings-goals` - Create goal
- `POST /api/savings-goals/:id/contribute` - Add contribution

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/spending-by-category` - Category breakdown
- `GET /api/dashboard/spending-trend` - Spending trends

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built with ❤️ using Cursor AI

## 🙏 Acknowledgments

- Angular Material for the beautiful UI components
- Chart.js for data visualization
- Flask community for excellent documentation
- PostgreSQL for robust data management

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note:** This is a demonstration project. For production use, ensure proper security measures, environment variable management, and deployment configurations.
Cursor Demo for Personal Finance Tracker
