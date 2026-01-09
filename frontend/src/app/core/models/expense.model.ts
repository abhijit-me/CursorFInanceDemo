import { Category } from './category.model';

export interface Expense {
  id?: number;
  user_id?: number;
  category_id: number;
  category?: Category;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  receipt_path?: string;
  is_recurring?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseFilter {
  category_id?: number;
  start_date?: string;
  end_date?: string;
}

