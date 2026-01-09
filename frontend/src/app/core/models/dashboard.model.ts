export interface DashboardStats {
  total_expenses: number;
  total_budget: number;
  budget_remaining: number;
  budget_percentage: number;
  upcoming_bills: number;
  active_savings_goals: number;
  total_saved: number;
}

export interface SpendingByCategory {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
}

