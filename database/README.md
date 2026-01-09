# Database Setup

This directory contains database initialization and seed scripts for the Personal Finance Manager application.

## Prerequisites

- PostgreSQL 12 or higher installed
- `psql` command-line tool

## Database Schema

All tables are created within the `cfinance` schema to provide logical separation and organization.

## Setup Instructions

### 1. Create Database and User

```bash
# Connect to PostgreSQL as admin
sudo -u postgres psql

# Create database
CREATE DATABASE financedb;

# Create user
CREATE USER financeuser WITH PASSWORD 'financepass';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;

# Exit
\q
```

### 2. Initialize Schema

```bash
# Run initialization script
psql -U financeuser -d financedb -f init.sql
```

### 3. Seed Data

```bash
# Run seed script (creates categories and demo user)
psql -U financeuser -d financedb -f seed.sql
```

### 4. Load Sample Data (Optional)

To populate the demo account with realistic sample data:

```bash
# Run sample data script (132 records: budgets, bills, goals, expenses)
psql -U financeuser -d financedb -f sampledata.sql
```

This will add:
- 13 budgets (one per category)
- 8 recurring bills
- 5 savings goals
- 106 expenses spanning October-December 2024

## Database Schema

### Schema: cfinance

All tables are organized under the `cfinance` schema.

### Tables

- **cfinance.users** - User accounts
- **cfinance.categories** - Expense categories
- **cfinance.expenses** - User expenses with optional receipts
- **cfinance.budgets** - Monthly/yearly budgets per category
- **cfinance.recurring_bills** - Recurring bills with reminders
- **cfinance.savings_goals** - Savings goals with progress tracking
- **cfinance.categorization_rules** - Rules for auto-categorizing expenses

## Demo Account

After running the seed script, you can login with:
- Email: `demo@financeapp.com`
- Password: `demo123`

## Resetting the Database

To completely reset the database:

```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS financedb;"
sudo -u postgres psql -c "CREATE DATABASE financedb;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;"

# Re-run initialization and seed
psql -U financeuser -d financedb -f init.sql
psql -U financeuser -d financedb -f seed.sql
```

