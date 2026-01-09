import { Category } from './category.model';

export interface RecurringBill {
  id?: number;
  user_id?: number;
  category_id: number;
  category?: Category;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  reminder_days: number;
  is_active: boolean;
  notes?: string;
  days_until_due?: number;
  is_overdue?: boolean;
  needs_reminder?: boolean;
  created_at?: string;
}

