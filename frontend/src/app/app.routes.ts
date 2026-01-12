import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/expenses/expenses.component').then(m => m.ExpensesComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/budgets/budgets.component').then(m => m.BudgetsComponent)
      },
      {
        path: 'recurring-bills',
        loadComponent: () => import('./features/recurring-bills/recurring-bills.component').then(m => m.RecurringBillsComponent)
      },
      {
        path: 'savings-goals',
        loadComponent: () => import('./features/savings-goals/savings-goals.component').then(m => m.SavingsGoalsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

