export interface DashboardStats {
  totalExpenses: number;
  totalBudget: number;
  budgetRemaining: number;
  budgetPercentage: number;
  upcomingBills: number;
  activeSavingsGoals: number;
  totalSaved: number;
}

export interface SpendingByCategory {
  categoryId: number;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
}

