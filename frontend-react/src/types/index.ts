// User types
export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

// Category type
export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

// Expense types
export interface Expense {
  id?: number;
  userId?: number;
  categoryId: number;
  category?: Category;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  receiptPath?: string;
  isRecurring?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseFilter {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

// Budget types
export interface Budget {
  id?: number;
  userId?: number;
  categoryId: number;
  category?: Category;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  spent?: number;
  remaining?: number;
  percentage?: number;
  status?: 'good' | 'warning' | 'exceeded';
  createdAt?: string;
}

// Recurring Bill types
export interface RecurringBill {
  id?: number;
  userId?: number;
  categoryId: number;
  category?: Category;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  reminderDays: number;
  isActive: boolean;
  notes?: string;
  daysUntilDue?: number;
  isOverdue?: boolean;
  needsReminder?: boolean;
  createdAt?: string;
}

// Savings Goal types
export interface SavingsGoal {
  id?: number;
  userId?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress?: number;
  targetDate?: string;
  icon?: string;
  color?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

// Dashboard types
export interface DashboardStats {
  totalExpenses: number;
  totalBudget: number;
  budgetRemaining: number;
  budgetPercentage: number;
  upcomingBills: number;
  activeSavingsGoals: number;
  totalSaved: number;
}

export interface SpendingByCategory {
  categoryId: number;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
}

// Monthly Report types
export interface MonthlyReport {
  year: number;
  month: number;
  monthName: string;
  totalSpending: number;
  totalBudget: number;
  budgetRemaining: number;
  spendingByCategory: SpendingByCategory[];
  topCategories: TopCategory[];
  expenseDetails: ExpenseDetail[];
}

export interface TopCategory {
  categoryId: number;
  categoryName: string;
  color: string;
  icon: string;
  budget: number;
  spending: number;
  percentage: number;
}

export interface ExpenseDetail {
  id: number;
  date: string;
  description: string;
  category: Category | null;
  amount: number;
}

export interface ExportData {
  monthName: string;
  data: ExportRow[];
}

export interface ExportRow {
  Date: string;
  Description: string;
  Category: string;
  Amount: number;
}
