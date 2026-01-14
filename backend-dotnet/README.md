# CFinance API - .NET 8 Backend

This is the .NET 8 Web API backend for the CFinance personal finance management application. It is a direct port of the Python Flask backend.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Expenses**: CRUD operations for expenses with category auto-detection
- **Budgets**: Monthly and yearly budget management with spending tracking
- **Recurring Bills**: Track recurring bills with due date reminders
- **Savings Goals**: Track savings progress with contributions
- **Dashboard**: Statistics and spending overview
- **Monthly Reports**: Detailed monthly spending reports with export

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL database

## Configuration

Update `appsettings.json` or set environment variables:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=financedb;Username=financeuser;Password=financepass"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-minimum-32-characters",
    "Issuer": "CFinanceApi",
    "Audience": "CFinanceApi"
  },
  "Cors": {
    "Origins": "http://localhost:4200"
  }
}
```

## Running the Application

```bash
# Navigate to the project directory
cd CFinanceApi

# Restore dependencies
dotnet restore

# Run the application
dotnet run

# Or run with specific profile
dotnet run --launch-profile http
```

The API will be available at:
- HTTP: `http://localhost:5005`
- Swagger UI: `http://localhost:5005/swagger`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update current user |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| GET | `/api/expenses/{id}` | Get expense by ID |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/receipts/{filename}` | Get receipt file |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get all budgets |
| GET | `/api/budgets/{id}` | Get budget by ID |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

### Recurring Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recurring-bills` | Get all recurring bills |
| GET | `/api/recurring-bills/{id}` | Get bill by ID |
| POST | `/api/recurring-bills` | Create bill |
| PUT | `/api/recurring-bills/{id}` | Update bill |
| DELETE | `/api/recurring-bills/{id}` | Delete bill |
| POST | `/api/recurring-bills/{id}/pay` | Mark bill as paid |

### Savings Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings-goals` | Get all savings goals |
| GET | `/api/savings-goals/{id}` | Get goal by ID |
| POST | `/api/savings-goals` | Create goal |
| PUT | `/api/savings-goals/{id}` | Update goal |
| DELETE | `/api/savings-goals/{id}` | Delete goal |
| POST | `/api/savings-goals/{id}/contribute` | Add contribution |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/spending-by-category` | Get spending by category |
| GET | `/api/dashboard/spending-trend` | Get spending trend |
| GET | `/api/dashboard/recent-expenses` | Get recent expenses |
| GET | `/api/dashboard/budget-overview` | Get budget overview |

### Monthly Report
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monthly-report` | Get monthly report |
| GET | `/api/monthly-report/export` | Export monthly report |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## Database Schema

The API uses the same database schema as the Python backend. The tables are located in the `cfinance` schema:

- `users` - User accounts
- `categories` - Expense categories
- `expenses` - User expenses
- `budgets` - User budgets
- `recurring_bills` - Recurring bills
- `savings_goals` - Savings goals
- `categorization_rules` - Auto-categorization rules

## Project Structure

```
CFinanceApi/
├── Controllers/           # API Controllers
│   ├── AuthController.cs
│   ├── BudgetsController.cs
│   ├── CategoriesController.cs
│   ├── DashboardController.cs
│   ├── ExpensesController.cs
│   ├── MonthlyReportController.cs
│   ├── RecurringBillsController.cs
│   └── SavingsGoalsController.cs
├── Data/                  # Database context
│   └── ApplicationDbContext.cs
├── DTOs/                  # Data Transfer Objects
│   ├── Requests/
│   └── Responses/
├── Models/                # Entity models
│   ├── Budget.cs
│   ├── Category.cs
│   ├── CategorizationRule.cs
│   ├── Expense.cs
│   ├── RecurringBill.cs
│   ├── SavingsGoal.cs
│   └── User.cs
├── Services/              # Business logic services
│   ├── CategorizationService.cs
│   ├── FileUploadService.cs
│   └── JwtService.cs
├── Properties/
│   └── launchSettings.json
├── Program.cs             # Application entry point
├── appsettings.json       # Configuration
└── appsettings.Development.json
```

## License

This project is licensed under the MIT License.
