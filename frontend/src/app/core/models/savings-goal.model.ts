export interface SavingsGoal {
  id?: number;
  user_id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  progress?: number;
  target_date?: string;
  icon?: string;
  color?: string;
  is_completed?: boolean;
  created_at?: string;
}

