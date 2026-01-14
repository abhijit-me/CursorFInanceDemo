import api from './api';
import { Budget } from '../types';

export const budgetService = {
  getBudgets: async (period: string = 'monthly'): Promise<Budget[]> => {
    const response = await api.get<Budget[]>('/budgets', {
      params: { period },
    });
    return response.data;
  },

  getBudget: async (id: number): Promise<Budget> => {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  createBudget: async (budget: Budget): Promise<{ message: string; budget: Budget }> => {
    const response = await api.post<{ message: string; budget: Budget }>('/budgets', budget);
    return response.data;
  },

  updateBudget: async (id: number, budget: Partial<Budget>): Promise<{ message: string; budget: Budget }> => {
    const response = await api.put<{ message: string; budget: Budget }>(`/budgets/${id}`, budget);
    return response.data;
  },

  deleteBudget: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/budgets/${id}`);
    return response.data;
  },
};
