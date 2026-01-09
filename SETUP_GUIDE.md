# Complete Setup Guide - Personal Finance Manager

This guide will walk you through setting up the Personal Finance Manager application from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version    # Should show v18+
npm --version     # Should show v9+
python --version  # Should show 3.8+
psql --version    # Should show 12+
```

## 🗄️ Step 1: Database Setup

### 1.1 Start PostgreSQL

```bash
# macOS/Linux
sudo service postgresql start

# Windows
# PostgreSQL should start automatically
```

### 1.2 Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Or on Windows
psql -U postgres
```

Run the following SQL commands:

```sql
-- Create database
CREATE DATABASE financedb;

-- Create user with password
CREATE USER financeuser WITH PASSWORD 'financepass';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;

-- Exit
\q
```

**Note**: The application uses a `cfinance` schema which will be created automatically by the init.sql script.

### 1.3 Initialize Schema

```bash
cd database

# Run schema creation
psql -U financeuser -d financedb -f init.sql

# Run seed data
psql -U financeuser -d financedb -f seed.sql

# Optional: Load sample data for demo account (132 records)
psql -U financeuser -d financedb -f sampledata.sql
```

If prompted for password, enter: `financepass`

**Note:** The `sampledata.sql` script is optional but highly recommended for testing and demonstrations. It adds:
- 13 budgets
- 8 recurring bills
- 5 savings goals
- 106 expenses spanning October-December 2024

### 1.4 Verify Database

```bash
psql -U financeuser -d financedb

# List tables
\dt

# You should see:
# - users
# - categories
# - expenses
# - budgets
# - recurring_bills
# - savings_goals
# - categorization_rules

# Exit
\q
```

## 🐍 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate

# Windows (Command Prompt):
venv\Scripts\activate

# Windows (PowerShell):
venv\Scripts\Activate.ps1
```

Your terminal should show `(venv)` prefix.

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask
- Flask-JWT-Extended
- Flask-SQLAlchemy
- PostgreSQL driver
- and more...

### 2.4 Configure Environment

Create a `.env` file in the backend directory:

```bash
# macOS/Linux
cat > .env << EOF
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
JWT_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')

DATABASE_URL=postgresql://financeuser:financepass@localhost:5432/financedb

UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

CORS_ORIGINS=http://localhost:4200
EOF

# Windows (PowerShell)
# Create .env file manually with the content above
```

### 2.5 Create Uploads Directory

```bash
mkdir -p uploads
```

### 2.6 Test Backend

```bash
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5005
```

Test the API:
```bash
# In a new terminal
curl http://localhost:5005/health
# Should return: {"status":"healthy"}
```

Keep the backend running for now.

## 🎨 Step 3: Frontend Setup

Open a **new terminal window** for the frontend.

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install:
- Angular framework
- Angular Material
- Chart.js
- and all dependencies

Installation may take 2-5 minutes.

### 3.3 Verify Configuration

Check `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5005/api'  // Should point to backend
};
```

### 3.4 Start Development Server

```bash
npm start
```

You should see:
```
** Angular Live Development Server is listening on localhost:4200 **
```

## 🌐 Step 4: Access the Application

### 4.1 Open Browser

Navigate to: `http://localhost:4200`

### 4.2 Login with Demo Account

Use the demo account:
- **Email**: `demo@financeapp.com`
- **Password**: `demo123`

Or create a new account using the "Sign up" link.

### 4.3 Explore Features

1. **Dashboard** - View overview and statistics
2. **Expenses** - Add and manage expenses
3. **Budgets** - Create and track budgets
4. **Recurring Bills** - Set up recurring bills
5. **Savings Goals** - Create savings goals

## 🔧 Step 5: Verification Checklist

Verify everything is working:

- [ ] Backend running on port 5005
- [ ] Frontend running on port 4200
- [ ] Database connected successfully
- [ ] Can login/register
- [ ] Can create expenses
- [ ] Can upload receipts
- [ ] Dashboard shows data
- [ ] Charts are rendering

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server`

```bash
# Check PostgreSQL status
sudo service postgresql status

# Restart if needed
sudo service postgresql restart
```

**Error**: `password authentication failed`

```bash
# Reset password
sudo -u postgres psql
ALTER USER financeuser WITH PASSWORD 'financepass';
```

### Backend Issues

**Error**: `ModuleNotFoundError`

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Error**: `Port 5005 already in use`

```bash
# Kill process on port 5005
# macOS/Linux:
sudo lsof -ti:5005 | xargs kill -9

# Windows:
netstat -ano | findstr :5005
taskkill /PID <PID> /F
```

### Frontend Issues

**Error**: `npm install fails`

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Error**: `Port 4200 already in use`

```bash
# Use different port
ng serve --port 4201
```

**Error**: `Cannot connect to API`

- Verify backend is running on port 5005
- Check `environment.ts` has correct API URL
- Check browser console for CORS errors

### Common Issues

**Chart.js not displaying**

```bash
# Reinstall chart dependencies
npm install chart.js ng2-charts --force
```

**Upload folder permission denied**

```bash
cd backend
chmod 755 uploads
```

## 🔄 Daily Development Workflow

### Starting the Application

1. **Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate
python app.py
```

2. **Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

3. **Browser**: Navigate to `http://localhost:4200`

### Stopping the Application

```bash
# In each terminal:
Ctrl + C
```

## 📦 Production Deployment

### Backend

```bash
cd backend

# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5005 app:app
```

### Frontend

```bash
cd frontend

# Build for production
ng build --configuration production

# Output in dist/ folder
# Serve with nginx, Apache, or any static server
```

### Database

- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Set up regular backups
- Use connection pooling

### Environment Variables

Set production values for:
- `SECRET_KEY` - Strong random key
- `JWT_SECRET_KEY` - Strong random key
- `DATABASE_URL` - Production database URL
- `CORS_ORIGINS` - Production frontend URL

## 📚 Next Steps

- Read [API Documentation](./backend/API.md)
- Review [Frontend Guide](./frontend/README.md)
- Explore [Database Schema](./database/README.md)
- Check out [Contributing Guidelines](./CONTRIBUTING.md)

## 🆘 Getting Help

- Check [README.md](./README.md) for overview
- Review logs in terminal windows
- Check browser console (F12) for frontend errors
- Verify API calls in Network tab
- Open an issue on GitHub

## ✅ Setup Complete!

You now have a fully functional Personal Finance Manager application running locally. Happy budgeting! 💰📊
