import api from './api';
import { Category } from '../types';

let cachedCategories: Category[] | null = null;

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    if (cachedCategories) {
      return cachedCategories;
    }
    
    const response = await api.get<Category[]>('/categories');
    cachedCategories = response.data;
    return response.data;
  },

  clearCache: () => {
    cachedCategories = null;
  },
};
