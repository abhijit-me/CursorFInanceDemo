# Finance Manager - React Frontend

This is a React-based frontend for the Finance Manager application, converted from the original Angular app.

## Features

- **Dashboard**: Overview of expenses, budgets, savings goals, and spending trends with interactive charts
- **Expenses**: Track and manage expenses with filtering and receipt upload
- **Budgets**: Set and monitor budgets by category
- **Recurring Bills**: Manage recurring bills with reminders
- **Savings Goals**: Track progress towards savings goals
- **Monthly Reports**: View detailed monthly spending reports with export to Excel

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router v6** for routing
- **Chart.js** with react-chartjs-2 for charts
- **Axios** for API calls
- **date-fns** for date utilities
- **xlsx** for Excel export

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5005/api
```

### Build for Production

```bash
npm run build
```

The production build will be in the `build` folder.

## Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Login, Register
│   ├── budgets/         # Budget management
│   ├── common/          # Shared components (Layout, ProtectedRoute)
│   ├── dashboard/       # Dashboard with stats and charts
│   ├── expenses/        # Expense management
│   ├── monthly-reports/ # Monthly reports with export
│   ├── recurring-bills/ # Recurring bill management
│   └── savings-goals/   # Savings goal management
├── contexts/            # React contexts (AuthContext)
├── services/            # API services
├── types/               # TypeScript types
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## API

This frontend connects to a backend API. The API URL is configured via the `REACT_APP_API_URL` environment variable.

### Required API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `GET /api/categories` - Get categories
- `GET/POST/PUT/DELETE /api/expenses` - Expense CRUD
- `GET/POST/PUT/DELETE /api/budgets` - Budget CRUD
- `GET/POST/PUT/DELETE /api/recurring-bills` - Recurring bill CRUD
- `GET/POST/PUT/DELETE /api/savings-goals` - Savings goal CRUD
- `GET /api/dashboard/*` - Dashboard data
- `GET /api/monthly-report` - Monthly report

## License

MIT
