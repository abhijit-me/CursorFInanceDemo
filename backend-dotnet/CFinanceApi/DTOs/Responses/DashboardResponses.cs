namespace CFinanceApi.DTOs.Responses;

public class DashboardStatsResponse
{
    public decimal TotalExpenses { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal BudgetRemaining { get; set; }
    public decimal BudgetPercentage { get; set; }
    public int UpcomingBills { get; set; }
    public int ActiveSavingsGoals { get; set; }
    public decimal TotalSaved { get; set; }
}

public class SpendingByCategoryResponse
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public decimal Amount { get; set; }
}

public class SpendingTrendResponse
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
