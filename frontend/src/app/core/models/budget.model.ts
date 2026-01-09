import { Category } from './category.model';

export interface Budget {
  id?: number;
  user_id?: number;
  category_id: number;
  category?: Category;
  amount: number;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  spent?: number;
  remaining?: number;
  percentage?: number;
  status?: 'good' | 'warning' | 'exceeded';
  created_at?: string;
}

