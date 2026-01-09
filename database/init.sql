-- Personal Finance Manager Database Schema

-- Create database
-- CREATE DATABASE financedb;

-- Create user (optional)
-- CREATE USER financeuser WITH PASSWORD 'financepass';
-- GRANT ALL PRIVILEGES ON DATABASE financedb TO financeuser;

-- Connect to database
-- \c financedb;

-- Create schema
CREATE SCHEMA IF NOT EXISTS cfinance;

-- Grant schema permissions
GRANT ALL ON SCHEMA cfinance TO financeuser;
GRANT ALL ON ALL TABLES IN SCHEMA cfinance TO financeuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA cfinance TO financeuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA cfinance GRANT ALL ON TABLES TO financeuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA cfinance GRANT ALL ON SEQUENCES TO financeuser;

-- Users table
CREATE TABLE IF NOT EXISTS cfinance.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON cfinance.users(email);

-- Categories table
CREATE TABLE IF NOT EXISTS cfinance.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS cfinance.expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES cfinance.users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES cfinance.categories(id),
    amount NUMERIC(10, 2) NOT NULL,
    description VARCHAR(255),
    notes TEXT,
    date DATE NOT NULL,
    receipt_path VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_id ON cfinance.expenses(user_id);
CREATE INDEX idx_expenses_date ON cfinance.expenses(date);
CREATE INDEX idx_expenses_category_id ON cfinance.expenses(category_id);

-- Budgets table
CREATE TABLE IF NOT EXISTS cfinance.budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES cfinance.users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES cfinance.categories(id),
    amount NUMERIC(10, 2) NOT NULL,
    period VARCHAR(20) NOT NULL DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, period)
);

CREATE INDEX idx_budgets_user_id ON cfinance.budgets(user_id);

-- Recurring bills table
CREATE TABLE IF NOT EXISTS cfinance.recurring_bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES cfinance.users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES cfinance.categories(id),
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    next_due_date DATE NOT NULL,
    reminder_days INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recurring_bills_user_id ON cfinance.recurring_bills(user_id);
CREATE INDEX idx_recurring_bills_next_due_date ON cfinance.recurring_bills(next_due_date);

-- Savings goals table
CREATE TABLE IF NOT EXISTS cfinance.savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES cfinance.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount NUMERIC(10, 2) NOT NULL,
    current_amount NUMERIC(10, 2) DEFAULT 0,
    target_date DATE,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_savings_goals_user_id ON cfinance.savings_goals(user_id);

-- Categorization rules table
CREATE TABLE IF NOT EXISTS cfinance.categorization_rules (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES cfinance.categories(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categorization_rules_category_id ON cfinance.categorization_rules(category_id);

