import { Category } from './category.model';

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

