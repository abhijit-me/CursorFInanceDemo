import api from './api';
import { RecurringBill } from '../types';

export const recurringBillService = {
  getBills: async (): Promise<RecurringBill[]> => {
    const response = await api.get<RecurringBill[]>('/recurring-bills');
    return response.data;
  },

  getBill: async (id: number): Promise<RecurringBill> => {
    const response = await api.get<RecurringBill>(`/recurring-bills/${id}`);
    return response.data;
  },

  createBill: async (bill: RecurringBill): Promise<{ message: string; bill: RecurringBill }> => {
    const response = await api.post<{ message: string; bill: RecurringBill }>('/recurring-bills', bill);
    return response.data;
  },

  updateBill: async (id: number, bill: Partial<RecurringBill>): Promise<{ message: string; bill: RecurringBill }> => {
    const response = await api.put<{ message: string; bill: RecurringBill }>(`/recurring-bills/${id}`, bill);
    return response.data;
  },

  deleteBill: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/recurring-bills/${id}`);
    return response.data;
  },

  markAsPaid: async (id: number): Promise<{ message: string; bill: RecurringBill }> => {
    const response = await api.post<{ message: string; bill: RecurringBill }>(`/recurring-bills/${id}/pay`, {});
    return response.data;
  },
};
