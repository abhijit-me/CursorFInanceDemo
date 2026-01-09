# Quick Start Guide - 5 Minutes to Running App

Get the Personal Finance Manager up and running in just 5 minutes!

## Prerequisites

Make sure you have installed:
- Node.js 18+
- Python 3.8+
- PostgreSQL 12+

## Quick Setup

### 1. Database (1 minute)

```bash
# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE financedb;
CREATE USER financeuser WITH PASSWORD 'financepass';
GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;
EOF

# Initialize schema (creates cfinance schema and tables)
cd database
psql -U financeuser -d financedb -f init.sql
psql -U financeuser -d financedb -f seed.sql
psql -U financeuser -d financedb -f sampledata.sql  # Optional: adds 132 sample records
cd ..
```

### 2. Backend (2 minutes)

```bash
# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
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

# Create uploads folder
mkdir uploads

# Start backend (keep this running)
python app.py &
cd ..
```

### 3. Frontend (2 minutes)

Open a new terminal:

```bash
# Setup frontend
cd frontend
npm install

# Start frontend (keep this running)
npm start &
```

### 4. Access Application

Open browser: `http://localhost:4200`

**Demo Login:**
- Email: `demo@financeapp.com`
- Password: `demo123`

## Done! 🎉

You now have a fully functional finance manager running!

## Next Steps

1. Create your own account
2. Add your first expense
3. Set up a budget
4. Explore the dashboard

## Need Help?

See the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## Troubleshooting

**Backend not starting?**
```bash
# Check if port 5005 is free
lsof -i :5005
```

**Frontend not starting?**
```bash
# Check if port 4200 is free
lsof -i :4200
```

**Database connection failed?**
```bash
# Verify PostgreSQL is running
sudo service postgresql status
```

---

**Windows Users:** Replace `source venv/bin/activate` with `venv\Scripts\activate` and use PowerShell or Command Prompt instead of bash commands.

