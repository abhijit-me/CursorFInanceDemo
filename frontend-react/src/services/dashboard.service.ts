import api from './api';
import { DashboardStats, SpendingByCategory, SpendingTrend, Budget, Expense } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getSpendingByCategory: async (period: string = 'month'): Promise<SpendingByCategory[]> => {
    const response = await api.get<SpendingByCategory[]>('/dashboard/spending-by-category', {
      params: { period },
    });
    return response.data;
  },

  getSpendingTrend: async (period: string = '6months'): Promise<SpendingTrend[]> => {
    const response = await api.get<SpendingTrend[]>('/dashboard/spending-trend', {
      params: { period },
    });
    return response.data;
  },

  getRecentExpenses: async (limit: number = 10): Promise<Expense[]> => {
    const response = await api.get<Expense[]>('/dashboard/recent-expenses', {
      params: { limit: limit.toString() },
    });
    return response.data;
  },

  getBudgetOverview: async (): Promise<Budget[]> => {
    const response = await api.get<Budget[]>('/dashboard/budget-overview');
    return response.data;
  },
};
