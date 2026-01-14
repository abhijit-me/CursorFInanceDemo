import { Category } from './category.model';

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

