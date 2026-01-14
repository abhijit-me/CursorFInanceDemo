import api from './api';
import { Expense, ExpenseFilter } from '../types';

export const expenseService = {
  getExpenses: async (filter?: ExpenseFilter): Promise<Expense[]> => {
    const params = new URLSearchParams();
    
    if (filter?.categoryId) {
      params.set('categoryId', filter.categoryId.toString());
    }
    if (filter?.startDate) {
      params.set('startDate', filter.startDate);
    }
    if (filter?.endDate) {
      params.set('endDate', filter.endDate);
    }

    const response = await api.get<Expense[]>('/expenses', { params });
    return response.data;
  },

  getExpense: async (id: number): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (expense: Expense, receipt?: File): Promise<{ message: string; expense: Expense }> => {
    const formData = new FormData();
    formData.append('amount', expense.amount.toString());
    formData.append('description', expense.description);
    formData.append('categoryId', expense.categoryId.toString());
    formData.append('date', expense.date);
    
    if (expense.notes) {
      formData.append('notes', expense.notes);
    }
    if (receipt) {
      formData.append('receipt', receipt);
    }
    if (expense.isRecurring !== undefined) {
      formData.append('isRecurring', expense.isRecurring.toString());
    }

    const response = await api.post<{ message: string; expense: Expense }>('/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateExpense: async (id: number, expense: Partial<Expense>, receipt?: File): Promise<{ message: string; expense: Expense }> => {
    const formData = new FormData();
    
    if (expense.amount !== undefined) {
      formData.append('amount', expense.amount.toString());
    }
    if (expense.description) {
      formData.append('description', expense.description);
    }
    if (expense.categoryId !== undefined) {
      formData.append('categoryId', expense.categoryId.toString());
    }
    if (expense.date) {
      formData.append('date', expense.date);
    }
    if (expense.notes !== undefined) {
      formData.append('notes', expense.notes);
    }
    if (receipt) {
      formData.append('receipt', receipt);
    }
    if (expense.isRecurring !== undefined) {
      formData.append('isRecurring', expense.isRecurring.toString());
    }

    const response = await api.put<{ message: string; expense: Expense }>(`/expenses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteExpense: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/expenses/${id}`);
    return response.data;
  },
};
