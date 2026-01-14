import { Category } from './category.model';

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

