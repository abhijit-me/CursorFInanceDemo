import api from './api';
import { SavingsGoal } from '../types';

export const savingsGoalService = {
  getGoals: async (): Promise<SavingsGoal[]> => {
    const response = await api.get<SavingsGoal[]>('/savings-goals');
    return response.data;
  },

  getGoal: async (id: number): Promise<SavingsGoal> => {
    const response = await api.get<SavingsGoal>(`/savings-goals/${id}`);
    return response.data;
  },

  createGoal: async (goal: SavingsGoal): Promise<{ message: string; goal: SavingsGoal }> => {
    const response = await api.post<{ message: string; goal: SavingsGoal }>('/savings-goals', goal);
    return response.data;
  },

  updateGoal: async (id: number, goal: Partial<SavingsGoal>): Promise<{ message: string; goal: SavingsGoal }> => {
    const response = await api.put<{ message: string; goal: SavingsGoal }>(`/savings-goals/${id}`, goal);
    return response.data;
  },

  deleteGoal: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/savings-goals/${id}`);
    return response.data;
  },

  contribute: async (id: number, amount: number): Promise<{ message: string; goal: SavingsGoal }> => {
    const response = await api.post<{ message: string; goal: SavingsGoal }>(`/savings-goals/${id}/contribute`, { amount });
    return response.data;
  },
};
