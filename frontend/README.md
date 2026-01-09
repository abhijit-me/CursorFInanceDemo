# Frontend - Personal Finance Manager

Angular-based frontend application with Material Design for the Personal Finance Manager.

## 🏗️ Architecture

Modern Angular application with:
- **Standalone components** for better modularity
- **Lazy loading** for optimized bundle sizes
- **Service-based architecture** for business logic
- **Reactive forms** with validation
- **Material Design** for beautiful UI

## 📁 Project Structure

```
frontend/src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # API services
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Dashboard
│   │   ├── expenses/          # Expense management
│   │   ├── budgets/           # Budget tracking
│   │   ├── recurring-bills/   # Bills management
│   │   └── savings-goals/     # Goals tracking
│   ├── app.component.ts       # Root component
│   ├── app.config.ts          # Application config
│   └── app.routes.ts          # Route definitions
├── environments/              # Environment configs
├── styles.scss               # Global styles
└── index.html                # HTML entry point
```

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5005/api'
};
```

### 3. Run Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200`

### 4. Build for Production

```bash
npm run build
# or
ng build --configuration production
```

## 🎨 Features

### Dashboard
- **Overview statistics** cards
- **Interactive charts** with Chart.js
- **Recent expenses** table
- **Budget overview** with progress bars
- **Quick navigation** to all sections

### Expense Management
- **CRUD operations** for expenses
- **Receipt upload** with preview
- **Auto-categorization** suggestions
- **Advanced filtering** by date and category
- **Responsive grid** layout

### Budget Tracking
- **Monthly/yearly budgets** per category
- **Real-time progress** tracking
- **Visual indicators** (good/warning/exceeded)
- **Budget vs. actual** comparison
- **Easy budget** creation

### Recurring Bills
- **Bill management** with reminders
- **Due date tracking** with countdown
- **Overdue indicators** and warnings
- **Mark as paid** functionality
- **Automatic next** due date calculation

### Savings Goals
- **Goal creation** with custom icons/colors
- **Progress visualization** with charts
- **Contribution tracking**
- **Goal completion** celebrations
- **Target date** reminders

## 🎯 Key Components

### Authentication

```typescript
// Login Component
LoginComponent
- Reactive form validation
- JWT token storage
- Error handling
- Route navigation

// Register Component
RegisterComponent
- Multi-field validation
- Password strength check
- Account creation
```

### Services

```typescript
// AuthService
- Login/Register/Logout
- Token management
- User state management
- Auto-login on refresh

// ExpenseService
- CRUD operations
- File upload handling
- Filtering support

// BudgetService
- Budget management
- Spending calculations

// DashboardService
- Statistics aggregation
- Chart data formatting
```

### Guards

```typescript
// AuthGuard
- Route protection
- Redirect to login
- Token validation
```

### Interceptors

```typescript
// AuthInterceptor
- Automatic token attachment
- Request modification
```

## 📊 Data Visualization

Using **Chart.js** with **ng2-charts**:

### Doughnut Chart
- Spending by category
- Color-coded categories
- Interactive legend

### Line Chart
- Monthly spending trends
- Smooth animations
- Responsive design

## 🎨 Material Design Components

Utilizing Angular Material:
- `MatCard` - Content containers
- `MatButton` - Action buttons
- `MatIcon` - Material icons
- `MatTable` - Data tables
- `MatDialog` - Modal dialogs
- `MatFormField` - Form inputs
- `MatProgressBar` - Progress indicators
- `MatDatepicker` - Date selection
- `MatSnackBar` - Notifications

## 🔐 Security

- **Route guards** for protected pages
- **JWT token** authentication
- **HTTP interceptors** for automatic auth
- **XSS protection** via Angular sanitization
- **CSRF protection** via Angular HTTP client

## 📱 Responsive Design

Mobile-first approach with:
- Responsive grid layouts
- Touch-friendly buttons
- Mobile navigation
- Adaptive charts
- Fluid typography

## 🎭 State Management

Reactive state management using:
- **RxJS** for reactive programming
- **BehaviorSubject** for state
- **Observables** for async operations
- **Service-based** state

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Code coverage
ng test --code-coverage
```

## 🎯 Form Validation

Comprehensive validation:
- Required fields
- Email format
- Password strength
- Number ranges
- Date validation
- Custom validators

## 🚀 Performance Optimization

- **Lazy loading** modules
- **OnPush** change detection strategy
- **TrackBy** for lists
- **Image optimization**
- **Bundle optimization**
- **Code splitting**

## 📦 Key Dependencies

```json
{
  "@angular/core": "^17.0.0",
  "@angular/material": "^17.0.0",
  "chart.js": "^4.4.0",
  "ng2-charts": "^5.0.4",
  "rxjs": "~7.8.0"
}
```

## 🎨 Theming

Material Design theme customization in `styles.scss`:

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';

// Custom theme colors
$primary: #3f51b5;
$accent: #ff4081;
$warn: #f44336;
```

## 🔧 Development Tips

### Hot Reload
Changes auto-reload in development mode

### DevTools
Use Angular DevTools browser extension

### Debugging
- Browser DevTools
- Angular error messages
- Console logging
- Breakpoints

## 📈 Build Optimization

Production build optimizations:
- **AOT compilation**
- **Tree shaking**
- **Minification**
- **Compression**
- **Source maps** (optional)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Code Style

Following Angular Style Guide:
- Component naming: `*.component.ts`
- Service naming: `*.service.ts`
- Module naming: `*.module.ts`
- Kebab-case for files
- PascalCase for classes

## 🔄 Update Dependencies

```bash
# Update Angular CLI
npm install -g @angular/cli@latest

# Update packages
ng update @angular/core @angular/cli
ng update @angular/material
```

## 🐛 Common Issues

### Port Already in Use
```bash
ng serve --port 4201
```

### Node Module Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Memory Issues
```bash
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build
```

## 📞 Support

For frontend issues:
- Check browser console
- Review network requests
- Verify API connectivity
- Check component errors
