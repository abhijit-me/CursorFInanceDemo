import { Category } from './category.model';

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

export interface SpendingByCategory {
  categoryId: number;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
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
