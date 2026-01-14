# High Level Design Document

# Personal Finance Manager Application

**Version:** 1.0  
**Last Updated:** January 2026  
**Document Type:** High Level Design (HLD)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Component Architecture](#4-component-architecture)
5. [Database Design](#5-database-design)
6. [API Specifications](#6-api-specifications)
7. [Authentication & Security](#7-authentication--security)
8. [Application Flows](#8-application-flows)
9. [Data Models](#9-data-models)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Non-Functional Requirements](#11-non-functional-requirements)

---

## 1. Executive Summary

### 1.1 Purpose

The Personal Finance Manager is a full-stack web application designed to help users manage their personal finances effectively. It provides comprehensive expense tracking, budget management, recurring bill monitoring, and savings goal tracking with intelligent auto-categorization capabilities.

### 1.2 Scope

The system encompasses:
- User authentication and authorization
- Expense tracking with receipt management
- Budget creation and monitoring
- Recurring bill management with reminders
- Savings goals tracking
- Analytics dashboard with visualizations
- Monthly financial reports

### 1.3 Key Features

| Feature | Description |
|---------|-------------|
| **Expense Management** | Add, edit, delete expenses with receipt uploads and auto-categorization |
| **Budget Tracking** | Create monthly/yearly budgets per category with real-time progress monitoring |
| **Recurring Bills** | Track recurring payments with automatic reminders and due date management |
| **Savings Goals** | Set and track progress towards savings targets |
| **Dashboard Analytics** | Visual representation of spending patterns and financial health |
| **Monthly Reports** | Comprehensive monthly expense reports with category breakdown |

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                        Angular 17 SPA Application                            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │    │
│  │  │Dashboard │ │ Expenses │ │ Budgets  │ │  Bills   │ │ Savings Goals    │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │    │
│  │                                                                              │    │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │    │
│  │  │                    Core Services & Interceptors                        │  │    │
│  │  │  • AuthService  • ExpenseService  • BudgetService  • CategoryService  │  │    │
│  │  │  • AuthGuard    • HTTP Interceptor • Reactive Forms                   │  │    │
│  │  └───────────────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         │ HTTPS / REST API
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    API GATEWAY                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                              Flask Application                               │    │
│  │                                                                              │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                         Middleware Layer                             │    │    │
│  │  │   • CORS Handler  • JWT Authentication  • Error Handlers            │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                              │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                        API Blueprints                                │    │    │
│  │  │  ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────────────┐ │    │    │
│  │  │  │  Auth   │ │  Expenses │ │  Budgets │ │   Recurring Bills       │ │    │    │
│  │  │  └─────────┘ └───────────┘ └──────────┘ └─────────────────────────┘ │    │    │
│  │  │  ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────────────┐ │    │    │
│  │  │  │Dashboard│ │ Savings   │ │Categories│ │   Monthly Report        │ │    │    │
│  │  │  │         │ │  Goals    │ │          │ │                         │ │    │    │
│  │  │  └─────────┘ └───────────┘ └──────────┘ └─────────────────────────┘ │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                              │    │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│  │  │                        Utility Layer                                 │    │    │
│  │  │   • Auto-Categorization Engine  • File Upload Handler               │    │    │
│  │  └─────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         │ SQLAlchemy ORM
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  DATA LAYER                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                            PostgreSQL Database                               │    │
│  │                                                                              │    │
│  │  ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐    │    │
│  │  │  Users  │ │ Categories│ │ Expenses │ │ Budgets  │ │ Recurring Bills │    │    │
│  │  └─────────┘ └───────────┘ └──────────┘ └──────────┘ └─────────────────┘    │    │
│  │                                                                              │    │
│  │  ┌────────────────────────┐ ┌──────────────────────────────────────────┐    │    │
│  │  │    Savings Goals       │ │       Categorization Rules               │    │    │
│  │  └────────────────────────┘ └──────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                            File Storage                                      │    │
│  │                       Receipt Images / PDFs                                  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Overview

The application follows a **three-tier architecture**:

| Tier | Component | Technology | Description |
|------|-----------|------------|-------------|
| **Presentation** | Frontend SPA | Angular 17 | Single Page Application with Material Design UI |
| **Application** | REST API Server | Flask 3.0 | Business logic, authentication, and data processing |
| **Data** | Database | PostgreSQL | Persistent data storage with relational schema |

### 2.3 Communication Patterns

```
┌──────────────┐     HTTP/HTTPS      ┌──────────────┐    SQL Queries    ┌──────────────┐
│   Browser    │ ◄─────────────────► │  Flask API   │ ◄───────────────► │  PostgreSQL  │
│  (Angular)   │    JSON/REST        │   Server     │   SQLAlchemy ORM  │   Database   │
└──────────────┘                     └──────────────┘                   └──────────────┘
       │                                    │
       │ localStorage                       │ File System
       ▼                                    ▼
┌──────────────┐                     ┌──────────────┐
│   JWT Token  │                     │   Uploads    │
│   Storage    │                     │   (Receipts) │
└──────────────┘                     └──────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 17.x | Frontend framework with standalone components |
| **Angular Material** | 17.x | UI component library (Material Design) |
| **TypeScript** | 5.x | Type-safe JavaScript superset |
| **RxJS** | 7.8.x | Reactive programming library |
| **Chart.js** | 4.4.x | Data visualization charts |
| **ng2-charts** | 5.0.x | Angular wrapper for Chart.js |

### 3.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Flask** | 3.0.x | Python web framework |
| **Flask-JWT-Extended** | 4.6.x | JWT authentication |
| **Flask-SQLAlchemy** | 3.1.x | ORM for database operations |
| **Flask-CORS** | 4.0.x | Cross-Origin Resource Sharing |
| **psycopg2-binary** | 2.9.x | PostgreSQL adapter |
| **Werkzeug** | 3.x | Password hashing utilities |
| **python-dotenv** | 1.x | Environment variable management |

### 3.3 Database Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 12+ | Primary relational database |
| **SQLAlchemy** | 2.x | SQL toolkit and ORM |

### 3.4 Development Tools

| Tool | Purpose |
|------|---------|
| **npm** | Frontend package management |
| **pip** | Python package management |
| **Git** | Version control |
| **Angular CLI** | Angular project tooling |

---

## 4. Component Architecture

### 4.1 Frontend Component Hierarchy

```
App Root
├── Auth Module (Lazy Loaded)
│   ├── LoginComponent
│   └── RegisterComponent
│
└── Protected Routes (Auth Guard)
    ├── DashboardComponent
    │   ├── Stats Cards
    │   ├── Category Doughnut Chart
    │   ├── Spending Trend Line Chart
    │   ├── Budget Overview List
    │   └── Recent Expenses Table
    │
    ├── ExpensesComponent
    │   ├── Filter Panel
    │   ├── Expenses Table
    │   └── ExpenseDialogComponent (CRUD Dialog)
    │
    ├── BudgetsComponent
    │   ├── Budget Cards Grid
    │   └── BudgetDialogComponent (CRUD Dialog)
    │
    ├── RecurringBillsComponent
    │   ├── Bills List with Status
    │   └── RecurringBillDialogComponent (CRUD Dialog)
    │
    ├── SavingsGoalsComponent
    │   ├── Goals Progress Cards
    │   ├── SavingsGoalDialogComponent (CRUD Dialog)
    │   └── ContributeDialogComponent (Add Funds)
    │
    └── MonthlyReportsComponent
        ├── Month Selector
        ├── Summary Stats
        └── Category Breakdown Table
```

### 4.2 Frontend Services Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Angular Services                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │   AuthService    │    │  ExpenseService  │    │  BudgetService   │   │
│  │                  │    │                  │    │                  │   │
│  │ • login()        │    │ • getExpenses()  │    │ • getBudgets()   │   │
│  │ • register()     │    │ • createExpense()│    │ • createBudget() │   │
│  │ • logout()       │    │ • updateExpense()│    │ • updateBudget() │   │
│  │ • refreshToken() │    │ • deleteExpense()│    │ • deleteBudget() │   │
│  │ • getToken()     │    │                  │    │                  │   │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘   │
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │ CategoryService  │    │RecurringBillSvc  │    │SavingsGoalService│   │
│  │                  │    │                  │    │                  │   │
│  │ • getCategories()│    │ • getBills()     │    │ • getGoals()     │   │
│  │                  │    │ • createBill()   │    │ • createGoal()   │   │
│  │                  │    │ • markAsPaid()   │    │ • contribute()   │   │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘   │
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐                           │
│  │ DashboardService │    │MonthlyReportSvc  │                           │
│  │                  │    │                  │                           │
│  │ • getStats()     │    │ • getReport()    │                           │
│  │ • getSpending()  │    │ • exportReport() │                           │
│  │ • getTrends()    │    │                  │                           │
│  └──────────────────┘    └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Backend Blueprint Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Flask Application                                │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       Application Factory                          │  │
│  │                         (app.py)                                   │  │
│  │                                                                    │  │
│  │  • Configuration Loading    • Extension Initialization            │  │
│  │  • Blueprint Registration   • Error Handlers                      │  │
│  │  • CORS Setup               • JWT Manager                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        API Blueprints                              │  │
│  │                                                                    │  │
│  │  /api/auth/*            - Authentication endpoints                 │  │
│  │  /api/expenses/*        - Expense management                       │  │
│  │  /api/budgets/*         - Budget management                        │  │
│  │  /api/categories/*      - Category listing                         │  │
│  │  /api/recurring-bills/* - Recurring bill management                │  │
│  │  /api/savings-goals/*   - Savings goal management                  │  │
│  │  /api/dashboard/*       - Dashboard statistics                     │  │
│  │  /api/monthly-report/*  - Monthly report generation                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       Utility Modules                              │  │
│  │                                                                    │  │
│  │  • categorization.py  - Auto-categorization engine                │  │
│  │  • file_upload.py     - Receipt file handling                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                DATABASE SCHEMA                                       │
│                               (cfinance schema)                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌───────────────┐
                                    │    USERS      │
                                    ├───────────────┤
                                    │ PK id         │
                                    │    email      │
                                    │    username   │
                                    │    password   │
                                    │    first_name │
                                    │    last_name  │
                                    │    created_at │
                                    │    updated_at │
                                    └───────┬───────┘
                                            │
            ┌───────────────┬───────────────┼───────────────┬───────────────┐
            │               │               │               │               │
            ▼               ▼               ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │   EXPENSES    │ │   BUDGETS     │ │RECURRING_BILLS│ │ SAVINGS_GOALS │
    ├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────┤
    │ PK id         │ │ PK id         │ │ PK id         │ │ PK id         │
    │ FK user_id    │ │ FK user_id    │ │ FK user_id    │ │ FK user_id    │
    │ FK category_id│ │ FK category_id│ │ FK category_id│ │    name       │
    │    amount     │ │    amount     │ │    name       │ │    target_amt │
    │    description│ │    period     │ │    amount     │ │    current_amt│
    │    notes      │ │    start_date │ │    frequency  │ │    target_date│
    │    date       │ │    end_date   │ │    next_due   │ │    icon       │
    │    receipt    │ │    created_at │ │    reminder   │ │    color      │
    │    is_recurr  │ │    updated_at │ │    is_active  │ │    is_complete│
    │    created_at │ └───────┬───────┘ │    notes      │ │    created_at │
    │    updated_at │         │         │    created_at │ │    updated_at │
    └───────┬───────┘         │         │    updated_at │ └───────────────┘
            │                 │         └───────┬───────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │  CATEGORIES   │
                      ├───────────────┤
                      │ PK id         │
                      │    name       │
                      │    icon       │
                      │    color      │
                      │    created_at │
                      └───────┬───────┘
                              │
                              ▼
                      ┌───────────────┐
                      │CATEGORIZATION │
                      │    _RULES     │
                      ├───────────────┤
                      │ PK id         │
                      │ FK category_id│
                      │    keyword    │
                      │    priority   │
                      │    created_at │
                      └───────────────┘
```

### 5.2 Table Definitions

#### 5.2.1 Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| email | VARCHAR(120) | UNIQUE NOT NULL | User email address |
| username | VARCHAR(80) | UNIQUE NOT NULL | Display username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(50) | NULLABLE | User's first name |
| last_name | VARCHAR(50) | NULLABLE | User's last name |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### 5.2.2 Categories Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(50) | UNIQUE NOT NULL | Category name |
| icon | VARCHAR(50) | NULLABLE | Material icon name |
| color | VARCHAR(7) | NULLABLE | Hex color code |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Default Categories:**
- Groceries, Dining, Transportation, Utilities, Entertainment
- Shopping, Healthcare, Housing, Personal, Education
- Insurance, Savings, Other

#### 5.2.3 Expenses Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY (users) | Owner reference |
| category_id | INTEGER | FOREIGN KEY (categories) | Category reference |
| amount | NUMERIC(10,2) | NOT NULL | Expense amount |
| description | VARCHAR(255) | NULLABLE | Expense description |
| notes | TEXT | NULLABLE | Additional notes |
| date | DATE | NOT NULL | Expense date |
| receipt_path | VARCHAR(255) | NULLABLE | Receipt file path |
| is_recurring | BOOLEAN | DEFAULT FALSE | Recurring expense flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:** `user_id`, `date`, `category_id`

#### 5.2.4 Budgets Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY (users) | Owner reference |
| category_id | INTEGER | FOREIGN KEY (categories) | Category reference |
| amount | NUMERIC(10,2) | NOT NULL | Budget limit |
| period | VARCHAR(20) | DEFAULT 'monthly' | Budget period (monthly/yearly) |
| start_date | DATE | NOT NULL | Budget start date |
| end_date | DATE | NULLABLE | Budget end date |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:** UNIQUE(user_id, category_id, period)

#### 5.2.5 Recurring Bills Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY (users) | Owner reference |
| category_id | INTEGER | FOREIGN KEY (categories) | Category reference |
| name | VARCHAR(100) | NOT NULL | Bill name |
| amount | NUMERIC(10,2) | NOT NULL | Bill amount |
| frequency | VARCHAR(20) | NOT NULL | weekly/monthly/yearly |
| next_due_date | DATE | NOT NULL | Next payment date |
| reminder_days | INTEGER | DEFAULT 3 | Days before reminder |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| notes | TEXT | NULLABLE | Additional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:** `user_id`, `next_due_date`

#### 5.2.6 Savings Goals Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY (users) | Owner reference |
| name | VARCHAR(100) | NOT NULL | Goal name |
| target_amount | NUMERIC(10,2) | NOT NULL | Target amount |
| current_amount | NUMERIC(10,2) | DEFAULT 0 | Current saved amount |
| target_date | DATE | NULLABLE | Target completion date |
| icon | VARCHAR(50) | NULLABLE | Display icon |
| color | VARCHAR(7) | NULLABLE | Display color |
| is_completed | BOOLEAN | DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### 5.2.7 Categorization Rules Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| category_id | INTEGER | FOREIGN KEY (categories) | Target category |
| keyword | VARCHAR(100) | NOT NULL | Matching keyword |
| priority | INTEGER | DEFAULT 0 | Rule priority |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

## 6. API Specifications

### 6.1 API Base Information

| Property | Value |
|----------|-------|
| Base URL | `http://localhost:5005/api` |
| Protocol | HTTP/HTTPS |
| Format | JSON |
| Authentication | JWT Bearer Token |

### 6.2 Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2026-01-14T10:00:00"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Headers:** `Authorization: Bearer <refresh_token>`

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/api/auth/me`
Get current authenticated user details.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2026-01-14T10:00:00"
}
```

### 6.3 Expense Endpoints

#### GET `/api/expenses`
Retrieve all expenses for the authenticated user.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | integer | Filter by category |
| start_date | string | Start date (YYYY-MM-DD) |
| end_date | string | End date (YYYY-MM-DD) |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category_id": 2,
    "category": {
      "id": 2,
      "name": "Dining",
      "icon": "restaurant",
      "color": "#FF9800"
    },
    "amount": 45.50,
    "description": "Lunch at Restaurant",
    "notes": "Business meeting",
    "date": "2026-01-14",
    "receipt_path": "uploads/receipt_123.jpg",
    "is_recurring": false,
    "created_at": "2026-01-14T12:00:00",
    "updated_at": "2026-01-14T12:00:00"
  }
]
```

#### POST `/api/expenses`
Create a new expense.

**Request Body (JSON or Multipart):**
```json
{
  "amount": 45.50,
  "description": "Lunch at Restaurant",
  "category_id": 2,
  "date": "2026-01-14",
  "notes": "Business meeting",
  "is_recurring": false
}
```

**Note:** If `category_id` is not provided, auto-categorization is applied based on description.

**Response (201 Created):**
```json
{
  "message": "Expense created successfully",
  "expense": { ... }
}
```

#### PUT `/api/expenses/{id}`
Update an existing expense.

**Response (200 OK):**
```json
{
  "message": "Expense updated successfully",
  "expense": { ... }
}
```

#### DELETE `/api/expenses/{id}`
Delete an expense.

**Response (200 OK):**
```json
{
  "message": "Expense deleted successfully"
}
```

### 6.4 Budget Endpoints

#### GET `/api/budgets`
Retrieve all budgets with spending information.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | monthly | Budget period (monthly/yearly) |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Groceries",
      "icon": "shopping_cart",
      "color": "#4CAF50"
    },
    "amount": 500.00,
    "period": "monthly",
    "start_date": "2026-01-01",
    "end_date": null,
    "spent": 320.50,
    "remaining": 179.50,
    "percentage": 64.1,
    "created_at": "2026-01-01T00:00:00"
  }
]
```

#### POST `/api/budgets`
Create a new budget.

**Request Body:**
```json
{
  "category_id": 1,
  "amount": 500.00,
  "period": "monthly",
  "start_date": "2026-01-01",
  "end_date": null
}
```

### 6.5 Recurring Bills Endpoints

#### GET `/api/recurring-bills`
Retrieve all recurring bills.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| is_active | boolean | Filter by active status |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "category_id": 4,
    "category": { ... },
    "name": "Netflix Subscription",
    "amount": 15.99,
    "frequency": "monthly",
    "next_due_date": "2026-01-20",
    "reminder_days": 3,
    "is_active": true,
    "notes": "Premium plan",
    "days_until_due": 6,
    "is_overdue": false,
    "needs_reminder": false,
    "created_at": "2026-01-01T00:00:00"
  }
]
```

#### POST `/api/recurring-bills/{id}/pay`
Mark a bill as paid and update next due date.

**Response (200 OK):**
```json
{
  "message": "Bill marked as paid",
  "bill": {
    "id": 1,
    "next_due_date": "2026-02-20",
    ...
  }
}
```

### 6.6 Savings Goals Endpoints

#### GET `/api/savings-goals`
Retrieve all savings goals.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| is_completed | boolean | Filter by completion status |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Emergency Fund",
    "target_amount": 10000.00,
    "current_amount": 5500.00,
    "progress": 55.0,
    "target_date": "2026-12-31",
    "icon": "savings",
    "color": "#4CAF50",
    "is_completed": false,
    "created_at": "2026-01-01T00:00:00"
  }
]
```

#### POST `/api/savings-goals/{id}/contribute`
Add contribution to a savings goal.

**Request Body:**
```json
{
  "amount": 500.00
}
```

**Response (200 OK):**
```json
{
  "message": "Contribution added successfully",
  "goal": {
    "id": 1,
    "current_amount": 6000.00,
    "progress": 60.0,
    ...
  }
}
```

### 6.7 Dashboard Endpoints

#### GET `/api/dashboard/stats`
Get dashboard statistics for current month.

**Response (200 OK):**
```json
{
  "total_expenses": 1250.50,
  "total_budget": 2000.00,
  "budget_remaining": 749.50,
  "budget_percentage": 62.5,
  "upcoming_bills": 3,
  "active_savings_goals": 2,
  "total_saved": 5500.00
}
```

#### GET `/api/dashboard/spending-by-category`
Get spending breakdown by category.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | month | Time period (month/year/all) |

**Response (200 OK):**
```json
[
  {
    "category_id": 1,
    "category_name": "Groceries",
    "color": "#4CAF50",
    "icon": "shopping_cart",
    "amount": 450.00
  }
]
```

#### GET `/api/dashboard/spending-trend`
Get spending trend over time.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 6months | Time period (6months/year) |

**Response (200 OK):**
```json
[
  { "month": "2025-08", "amount": 1200.00 },
  { "month": "2025-09", "amount": 1350.00 },
  { "month": "2025-10", "amount": 980.00 },
  { "month": "2025-11", "amount": 1150.00 },
  { "month": "2025-12", "amount": 1420.00 },
  { "month": "2026-01", "amount": 1250.00 }
]
```

#### GET `/api/dashboard/budget-overview`
Get budget overview with spending and status.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "category": { "id": 1, "name": "Groceries", ... },
    "amount": 500.00,
    "spent": 320.00,
    "remaining": 180.00,
    "percentage": 64.0,
    "status": "good"
  }
]
```

### 6.8 Categories Endpoint

#### GET `/api/categories`
Get all available expense categories.

**Response (200 OK):**
```json
[
  { "id": 1, "name": "Groceries", "icon": "shopping_cart", "color": "#4CAF50" },
  { "id": 2, "name": "Dining", "icon": "restaurant", "color": "#FF9800" },
  { "id": 3, "name": "Transportation", "icon": "directions_car", "color": "#2196F3" }
]
```

### 6.9 Monthly Report Endpoints

#### GET `/api/monthly-report`
Get comprehensive monthly report.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| year | integer | current | Report year |
| month | integer | current | Report month (1-12) |

**Response (200 OK):**
```json
{
  "year": 2026,
  "month": 1,
  "month_name": "January 2026",
  "total_spending": 1250.50,
  "total_budget": 2000.00,
  "budget_remaining": 749.50,
  "spending_by_category": [
    { "category_id": 1, "category_name": "Groceries", "amount": 450.00, ... }
  ],
  "top_categories": [
    { "category_name": "Groceries", "budget": 500.00, "spending": 450.00, "percentage": 90.0 }
  ],
  "expense_details": [
    { "id": 1, "date": "2026-01-14", "description": "...", "amount": 45.50, ... }
  ]
}
```

### 6.10 API Error Responses

| Status Code | Description | Example Response |
|-------------|-------------|------------------|
| 400 | Bad Request | `{"error": "Email and password are required"}` |
| 401 | Unauthorized | `{"error": "Invalid email or password"}` |
| 404 | Not Found | `{"error": "Expense not found"}` |
| 500 | Server Error | `{"error": "Internal server error"}` |

---

## 7. Authentication & Security

### 7.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

   ┌────────┐                    ┌────────┐                    ┌────────┐
   │ Client │                    │  API   │                    │Database│
   └───┬────┘                    └───┬────┘                    └───┬────┘
       │                             │                             │
       │  1. POST /auth/login        │                             │
       │  {email, password}          │                             │
       │────────────────────────────►│                             │
       │                             │  2. Query User              │
       │                             │────────────────────────────►│
       │                             │                             │
       │                             │  3. User Record             │
       │                             │◄────────────────────────────│
       │                             │                             │
       │                             │  4. Verify Password Hash    │
       │                             │  (werkzeug)                 │
       │                             │                             │
       │                             │  5. Generate JWT Tokens     │
       │                             │  (access + refresh)         │
       │                             │                             │
       │  6. Return Tokens           │                             │
       │  {access_token,             │                             │
       │   refresh_token, user}      │                             │
       │◄────────────────────────────│                             │
       │                             │                             │
       │  7. Store in localStorage   │                             │
       │                             │                             │
```

### 7.2 JWT Token Structure

**Access Token (1 hour expiry):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "1",
    "iat": 1705222800,
    "exp": 1705226400,
    "type": "access"
  }
}
```

**Refresh Token (30 days expiry):**
```json
{
  "payload": {
    "sub": "1",
    "iat": 1705222800,
    "exp": 1707814800,
    "type": "refresh"
  }
}
```

### 7.3 Request Authentication

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        PROTECTED REQUEST FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

   ┌────────┐                    ┌────────────┐                 ┌────────┐
   │ Client │                    │HTTP Intercept│               │  API   │
   └───┬────┘                    └──────┬──────┘                └───┬────┘
       │                                │                           │
       │  1. Request to /api/expenses   │                           │
       │───────────────────────────────►│                           │
       │                                │                           │
       │                                │  2. Add Auth Header       │
       │                                │  Authorization: Bearer... │
       │                                │──────────────────────────►│
       │                                │                           │
       │                                │                           │ 3. Validate JWT
       │                                │                           │
       │                                │  4. Response              │
       │                                │◄──────────────────────────│
       │  5. Return Data                │                           │
       │◄───────────────────────────────│                           │
       │                                │                           │
```

### 7.4 Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | werkzeug.security with scrypt algorithm |
| **Token Authentication** | JWT with separate access/refresh tokens |
| **CORS Protection** | Flask-CORS with configured allowed origins |
| **Route Protection** | Angular AuthGuard for frontend routes |
| **API Protection** | @jwt_required() decorator for all protected endpoints |
| **SQL Injection Prevention** | SQLAlchemy ORM parameterized queries |
| **File Upload Validation** | Whitelist of allowed file extensions (png, jpg, jpeg, gif, pdf) |
| **Max Upload Size** | 16MB file size limit |
| **XSS Protection** | Angular's built-in sanitization |

### 7.5 Token Refresh Flow

```
┌────────┐                    ┌────────┐
│ Client │                    │  API   │
└───┬────┘                    └───┬────┘
    │                             │
    │  GET /api/expenses          │
    │  (with expired access token)│
    │────────────────────────────►│
    │                             │
    │  401 Unauthorized           │
    │◄────────────────────────────│
    │                             │
    │  POST /auth/refresh         │
    │  (with refresh token)       │
    │────────────────────────────►│
    │                             │
    │  {new access_token}         │
    │◄────────────────────────────│
    │                             │
    │  Retry original request     │
    │  (with new access token)    │
    │────────────────────────────►│
    │                             │
```

---

## 8. Application Flows

### 8.1 User Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           USER REGISTRATION FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │ Frontend │        │ Backend  │        │ Database │
     └────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                   │                   │                   │
          │  1. Fill Form     │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │                   │  2. Validate Form │                   │
          │                   │  (email, password)│                   │
          │                   │                   │                   │
          │                   │  3. POST /auth/   │                   │
          │                   │     register      │                   │
          │                   │──────────────────►│                   │
          │                   │                   │                   │
          │                   │                   │  4. Check Email   │
          │                   │                   │     Unique        │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │                   │  5. Hash Password │
          │                   │                   │                   │
          │                   │                   │  6. Create User   │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │                   │  7. Generate JWT  │
          │                   │                   │                   │
          │                   │  8. Return Tokens │                   │
          │                   │◄──────────────────│                   │
          │                   │                   │                   │
          │                   │  9. Store Tokens  │                   │
          │                   │  10. Redirect to  │                   │
          │                   │      Dashboard    │                   │
          │  11. Show Dashboard                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
```

### 8.2 Expense Creation Flow (with Auto-Categorization)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      EXPENSE CREATION WITH AUTO-CATEGORIZATION                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │ Frontend │        │ Backend  │        │ Database │
     └────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                   │                   │                   │
          │  1. Open Dialog   │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │  2. Enter Details │                   │                   │
          │  "Starbucks $5.50"│                   │                   │
          │  (no category)    │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │                   │  3. POST /expenses│                   │
          │                   │  {amount, desc}   │                   │
          │                   │──────────────────►│                   │
          │                   │                   │                   │
          │                   │                   │  4. Query Rules   │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │                   │  5. Match Rule    │
          │                   │                   │  "starbucks" →    │
          │                   │                   │  "Dining"         │
          │                   │                   │                   │
          │                   │                   │  6. Create Expense│
          │                   │                   │  with category_id │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │  7. Return Expense│                   │
          │                   │  with Category    │                   │
          │                   │◄──────────────────│                   │
          │                   │                   │                   │
          │  8. Show Success  │                   │                   │
          │  "Categorized as  │                   │                   │
          │   Dining"         │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
```

### 8.3 Budget Monitoring Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           BUDGET MONITORING FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │ Frontend │        │ Backend  │        │ Database │
     └────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                   │                   │                   │
          │  1. View Budgets  │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │                   │  2. GET /budgets  │                   │
          │                   │──────────────────►│                   │
          │                   │                   │                   │
          │                   │                   │  3. Get Budgets   │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │                   │  4. For Each Budget│
          │                   │                   │  Calculate Spent: │
          │                   │                   │  SUM(expenses)    │
          │                   │                   │  WHERE category   │
          │                   │                   │  AND current month│
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │                   │  5. Calculate:    │
          │                   │                   │  - remaining      │
          │                   │                   │  - percentage     │
          │                   │                   │  - status         │
          │                   │                   │                   │
          │                   │  6. Return Budget │                   │
          │                   │  with spending    │                   │
          │                   │◄──────────────────│                   │
          │                   │                   │                   │
          │  7. Display with  │                   │                   │
          │  Progress Bars:   │                   │                   │
          │  ■■■■■■□□ 64%     │                   │                   │
          │  (Good/Warning/   │                   │                   │
          │   Exceeded)       │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
```

### 8.4 Recurring Bill Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         RECURRING BILL PAYMENT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │ Frontend │        │ Backend  │        │ Database │
     └────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                   │                   │                   │
          │  1. View Bills    │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │                   │  2. GET /bills    │                   │
          │                   │──────────────────►│                   │
          │                   │                   │                   │
          │                   │                   │  3. Fetch Bills   │
          │                   │                   │  + Calculate:     │
          │                   │                   │  - days_until_due │
          │                   │                   │  - is_overdue     │
          │                   │                   │  - needs_reminder │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │  4. Display Bills │                   │                   │
          │  with Status      │                   │                   │
          │  🔴 Overdue       │                   │                   │
          │  🟡 Due Soon      │                   │                   │
          │  🟢 OK            │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
          │  5. Click "Pay"   │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │                   │  6. POST /{id}/pay│                   │
          │                   │──────────────────►│                   │
          │                   │                   │                   │
          │                   │                   │  7. Calculate     │
          │                   │                   │  Next Due Date:   │
          │                   │                   │  - weekly: +7 days│
          │                   │                   │  - monthly: +1 mon│
          │                   │                   │  - yearly: +1 year│
          │                   │                   │                   │
          │                   │                   │  8. Update Bill   │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │  9. Show Updated  │                   │                   │
          │  Next Due Date    │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
```

### 8.5 Savings Goal Contribution Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        SAVINGS GOAL CONTRIBUTION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │ Frontend │        │ Backend  │        │ Database │
     └────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                   │                   │                   │
          │  1. View Goals    │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │  2. Goal Progress │                   │                   │
          │  $5,500 / $10,000 │                   │                   │
          │  ████████░░ 55%   │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
          │  3. Click         │                   │                   │
          │  "Contribute"     │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │  4. Enter $500    │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │                   │  5. POST /{id}/   │                   │
          │                   │     contribute    │                   │
          │                   │  {amount: 500}    │                   │
          │                   │──────────────────►│                   │
          │                   │                   │                   │
          │                   │                   │  6. Update Goal   │
          │                   │                   │  current_amount   │
          │                   │                   │  += 500           │
          │                   │                   │──────────────────►│
          │                   │                   │                   │
          │                   │                   │  7. Check if      │
          │                   │                   │  target reached   │
          │                   │                   │  → auto-complete  │
          │                   │                   │                   │
          │  8. Updated Goal  │                   │                   │
          │  $6,000 / $10,000 │                   │                   │
          │  █████████░░ 60%  │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
```

### 8.6 Dashboard Data Loading Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD DATA LOADING FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │ Frontend │        │ Backend  │        │ Database │
     └────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                   │                   │                   │
          │  1. Navigate to   │                   │                   │
          │     Dashboard     │                   │                   │
          │──────────────────►│                   │                   │
          │                   │                   │                   │
          │  2. Show Spinner  │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
          │                   │  3. PARALLEL API  │                   │
          │                   │     CALLS:        │                   │
          │                   │                   │                   │
          │                   │  GET /stats ──────┼──────────────────►│
          │                   │  GET /spending ───┼──────────────────►│
          │                   │  GET /trend ──────┼──────────────────►│
          │                   │  GET /budget ─────┼──────────────────►│
          │                   │  GET /recent ─────┼──────────────────►│
          │                   │                   │                   │
          │                   │  4. Aggregate     │                   │
          │                   │     Results       │                   │
          │                   │◄──────────────────│                   │
          │                   │                   │                   │
          │  5. Render:       │                   │                   │
          │  - Stats Cards    │                   │                   │
          │  - Doughnut Chart │                   │                   │
          │  - Line Chart     │                   │                   │
          │  - Budget Bars    │                   │                   │
          │  - Expense Table  │                   │                   │
          │◄──────────────────│                   │                   │
          │                   │                   │                   │
```

---

## 9. Data Models

### 9.1 Frontend Models (TypeScript Interfaces)

#### User Model
```typescript
interface User {
  id?: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token?: string;
  user: User;
}
```

#### Expense Model
```typescript
interface Expense {
  id?: number;
  user_id?: number;
  category_id: number;
  category?: Category;
  amount: number;
  description: string;
  notes?: string;
  date: string;          // ISO date string (YYYY-MM-DD)
  receipt_path?: string;
  is_recurring?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ExpenseFilter {
  category_id?: number;
  start_date?: string;
  end_date?: string;
}
```

#### Budget Model
```typescript
interface Budget {
  id?: number;
  user_id?: number;
  category_id: number;
  category?: Category;
  amount: number;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  spent?: number;        // Calculated field
  remaining?: number;    // Calculated field
  percentage?: number;   // Calculated field
  status?: 'good' | 'warning' | 'exceeded';  // Calculated field
  created_at?: string;
}
```

#### Category Model
```typescript
interface Category {
  id: number;
  name: string;
  icon: string;          // Material icon name
  color: string;         // Hex color code (#RRGGBB)
}
```

#### Recurring Bill Model
```typescript
interface RecurringBill {
  id?: number;
  user_id?: number;
  category_id: number;
  category?: Category;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  reminder_days: number;
  is_active: boolean;
  notes?: string;
  days_until_due?: number;    // Calculated field
  is_overdue?: boolean;       // Calculated field
  needs_reminder?: boolean;   // Calculated field
  created_at?: string;
}
```

#### Savings Goal Model
```typescript
interface SavingsGoal {
  id?: number;
  user_id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  progress?: number;     // Calculated percentage
  target_date?: string;
  icon?: string;
  color?: string;
  is_completed: boolean;
  created_at?: string;
}
```

#### Dashboard Models
```typescript
interface DashboardStats {
  total_expenses: number;
  total_budget: number;
  budget_remaining: number;
  budget_percentage: number;
  upcoming_bills: number;
  active_savings_goals: number;
  total_saved: number;
}

interface SpendingByCategory {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
}

interface SpendingTrend {
  month: string;         // YYYY-MM format
  amount: number;
}
```

### 9.2 Backend Models (SQLAlchemy)

```python
class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'cfinance'}
    
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    expenses = relationship('Expense', backref='user', cascade='all, delete-orphan')
    budgets = relationship('Budget', backref='user', cascade='all, delete-orphan')
    recurring_bills = relationship('RecurringBill', backref='user', cascade='all, delete-orphan')
    savings_goals = relationship('SavingsGoal', backref='user', cascade='all, delete-orphan')
```

---

## 10. Deployment Architecture

### 10.1 Development Environment

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT ENVIRONMENT                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                            Developer Machine                                 │
  │                                                                              │
  │  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
  │  │  Angular CLI    │      │   Flask Dev     │      │  PostgreSQL     │     │
  │  │  Dev Server     │      │   Server        │      │  Database       │     │
  │  │                 │      │                 │      │                 │     │
  │  │  Port: 4200     │◄────►│  Port: 5005     │◄────►│  Port: 5432     │     │
  │  │                 │ HTTP │                 │ SQL  │                 │     │
  │  │  Hot Reload     │      │  Debug Mode     │      │  financedb      │     │
  │  │  ng serve       │      │  python app.py  │      │                 │     │
  │  └─────────────────┘      └─────────────────┘      └─────────────────┘     │
  │                                    │                                        │
  │                           ┌────────┴────────┐                              │
  │                           │  File System    │                              │
  │                           │  /uploads       │                              │
  │                           └─────────────────┘                              │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Production Environment

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION ENVIRONMENT                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────┐
                              │    Client     │
                              │   (Browser)   │
                              └───────┬───────┘
                                      │
                              ┌───────▼───────┐
                              │ Load Balancer │
                              │   (Optional)  │
                              └───────┬───────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
  ┌────────▼────────┐        ┌────────▼────────┐        ┌────────▼────────┐
  │   Web Server    │        │   Web Server    │        │   Web Server    │
  │    (Nginx)      │        │    (Nginx)      │        │    (Nginx)      │
  │                 │        │                 │        │                 │
  │  Static Files   │        │  Static Files   │        │  Static Files   │
  │  (Angular)      │        │  (Angular)      │        │  (Angular)      │
  └────────┬────────┘        └────────┬────────┘        └────────┬────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      │
                              ┌───────▼───────┐
                              │   API Layer   │
                              │  (Gunicorn)   │
                              │               │
                              │  4 Workers    │
                              │  Port: 5005   │
                              └───────┬───────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
  ┌────────▼────────┐        ┌────────▼────────┐        ┌────────▼────────┐
  │   PostgreSQL    │        │ Cloud Storage   │        │     Redis       │
  │  (Primary DB)   │        │  (Receipts)     │        │  (Cache/Queue)  │
  │                 │        │  S3/GCS/Azure   │        │   (Optional)    │
  │  Connection     │        │                 │        │                 │
  │  Pooling        │        │                 │        │                 │
  └─────────────────┘        └─────────────────┘        └─────────────────┘
```

### 10.3 Environment Configuration

**Development Configuration:**
```python
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://financeuser:financepass@localhost:5432/financedb'
    CORS_ORIGINS = ['http://localhost:4200']
```

**Production Configuration:**
```python
class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
```

### 10.4 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Flask secret key | Random 64-character hex string |
| `JWT_SECRET_KEY` | JWT signing key | Random 64-character hex string |
| `CORS_ORIGINS` | Allowed CORS origins | `https://app.example.com` |
| `UPLOAD_FOLDER` | Receipt upload directory | `/var/uploads` |
| `MAX_CONTENT_LENGTH` | Max upload size (bytes) | `16777216` (16MB) |

---

## 11. Non-Functional Requirements

### 11.1 Performance Requirements

| Metric | Target |
|--------|--------|
| API Response Time | < 500ms for 95th percentile |
| Page Load Time | < 3 seconds initial load |
| Database Queries | < 100ms per query |
| Concurrent Users | Support 100+ concurrent users |
| File Upload | Handle files up to 16MB |

### 11.2 Scalability Considerations

| Aspect | Implementation |
|--------|----------------|
| **Horizontal Scaling** | Stateless API design allows multiple instances |
| **Database Scaling** | Connection pooling ready, read replicas supported |
| **File Storage** | Cloud storage integration ready (S3, GCS) |
| **Caching** | Redis integration ready for session/data caching |
| **Load Balancing** | Standard HTTP load balancing compatible |

### 11.3 Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.9% availability |
| Recovery Time | < 1 hour for critical failures |
| Data Backup | Daily automated backups |
| Failover | Database failover within 5 minutes |

### 11.4 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Data Encryption | HTTPS/TLS for data in transit |
| Password Security | Scrypt hashing algorithm |
| Authentication | JWT tokens with 1-hour expiry |
| Authorization | User-specific data isolation |
| Input Validation | Server-side validation on all inputs |
| CORS Policy | Whitelist-based origin validation |
| Rate Limiting | Ready for implementation |

### 11.5 Maintainability

| Aspect | Implementation |
|--------|----------------|
| Code Organization | Modular architecture (blueprints, services) |
| Documentation | Inline comments, README files |
| Logging | Structured logging (ready) |
| Monitoring | Health check endpoint |
| Testing | Unit test structure in place |

### 11.6 Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | 14+ |
| Mobile Chrome | 90+ |

### 11.7 Responsive Design Breakpoints

| Breakpoint | Target Devices |
|------------|----------------|
| < 768px | Mobile phones |
| 768px - 1024px | Tablets |
| 1024px - 1440px | Laptops |
| > 1440px | Desktop monitors |

---

## Appendix A: API Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh token | Refresh |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/me` | Update current user | Yes |
| GET | `/api/expenses` | List expenses | Yes |
| POST | `/api/expenses` | Create expense | Yes |
| GET | `/api/expenses/{id}` | Get expense | Yes |
| PUT | `/api/expenses/{id}` | Update expense | Yes |
| DELETE | `/api/expenses/{id}` | Delete expense | Yes |
| GET | `/api/budgets` | List budgets | Yes |
| POST | `/api/budgets` | Create budget | Yes |
| GET | `/api/budgets/{id}` | Get budget | Yes |
| PUT | `/api/budgets/{id}` | Update budget | Yes |
| DELETE | `/api/budgets/{id}` | Delete budget | Yes |
| GET | `/api/recurring-bills` | List bills | Yes |
| POST | `/api/recurring-bills` | Create bill | Yes |
| GET | `/api/recurring-bills/{id}` | Get bill | Yes |
| PUT | `/api/recurring-bills/{id}` | Update bill | Yes |
| DELETE | `/api/recurring-bills/{id}` | Delete bill | Yes |
| POST | `/api/recurring-bills/{id}/pay` | Mark paid | Yes |
| GET | `/api/savings-goals` | List goals | Yes |
| POST | `/api/savings-goals` | Create goal | Yes |
| GET | `/api/savings-goals/{id}` | Get goal | Yes |
| PUT | `/api/savings-goals/{id}` | Update goal | Yes |
| DELETE | `/api/savings-goals/{id}` | Delete goal | Yes |
| POST | `/api/savings-goals/{id}/contribute` | Add funds | Yes |
| GET | `/api/categories` | List categories | Yes |
| GET | `/api/dashboard/stats` | Get stats | Yes |
| GET | `/api/dashboard/spending-by-category` | Category breakdown | Yes |
| GET | `/api/dashboard/spending-trend` | Spending trend | Yes |
| GET | `/api/dashboard/recent-expenses` | Recent expenses | Yes |
| GET | `/api/dashboard/budget-overview` | Budget overview | Yes |
| GET | `/api/monthly-report` | Monthly report | Yes |
| GET | `/api/monthly-report/export` | Export report | Yes |
| GET | `/health` | Health check | No |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **SPA** | Single Page Application |
| **JWT** | JSON Web Token |
| **ORM** | Object-Relational Mapping |
| **REST** | Representational State Transfer |
| **CORS** | Cross-Origin Resource Sharing |
| **Auto-Categorization** | Automatic expense category assignment based on keywords |
| **Budget Period** | Time frame for budget tracking (monthly/yearly) |
| **Recurring Bill** | Periodic payment with automatic due date calculation |
| **Savings Goal** | Target amount to save with progress tracking |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Development Team | Initial HLD document |

---

**End of High Level Design Document**
