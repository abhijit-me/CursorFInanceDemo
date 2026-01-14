import { Category } from './category.model';

export interface MonthlyReport {
  year: number;
  month: number;
  month_name: string;
  total_spending: number;
  total_budget: number;
  budget_remaining: number;
  spending_by_category: SpendingByCategory[];
  top_categories: TopCategory[];
  expense_details: ExpenseDetail[];
}

export interface SpendingByCategory {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
}

export interface TopCategory {
  category_id: number;
  category_name: string;
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
  month_name: string;
  data: ExportRow[];
}

export interface ExportRow {
  Date: string;
  Description: string;
  Category: string;
  Amount: number;
}
