import api from './api';
import { MonthlyReport, ExportData } from '../types';

export const monthlyReportService = {
  getMonthlyReport: async (year?: number, month?: number): Promise<MonthlyReport> => {
    const params = new URLSearchParams();
    if (year) {
      params.set('year', year.toString());
    }
    if (month) {
      params.set('month', month.toString());
    }
    
    const response = await api.get<MonthlyReport>('/monthly-report', { params });
    return response.data;
  },

  exportMonthlyReport: async (year?: number, month?: number): Promise<ExportData> => {
    const params = new URLSearchParams();
    if (year) {
      params.set('year', year.toString());
    }
    if (month) {
      params.set('month', month.toString());
    }
    
    const response = await api.get<ExportData>('/monthly-report/export', { params });
    return response.data;
  },
};
