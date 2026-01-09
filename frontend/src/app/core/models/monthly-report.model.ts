export interface MonthlyReportExpense {
  id: number;
  date: string;
  description: string;
  amount: number;
  category?: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
}

export interface CategorySpending {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  expenses: MonthlyReportExpense[];
  spending_by_category: CategorySpending[];
  total_amount: number;
}

