export interface SavingsGoal {
  id?: number;
  userId?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress?: number;
  targetDate?: string;
  icon?: string;
  color?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

