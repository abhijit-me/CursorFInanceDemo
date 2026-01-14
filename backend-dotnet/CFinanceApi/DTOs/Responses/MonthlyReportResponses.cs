namespace CFinanceApi.DTOs.Responses;

public class MonthlyReportResponse
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalSpending { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal BudgetRemaining { get; set; }
    public List<SpendingByCategoryResponse> SpendingByCategory { get; set; } = new();
    public List<TopCategoryResponse> TopCategories { get; set; } = new();
    public List<ExpenseDetailResponse> ExpenseDetails { get; set; } = new();
}

public class TopCategoryResponse
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public decimal Budget { get; set; }
    public decimal Spending { get; set; }
    public decimal Percentage { get; set; }
}

public class ExpenseDetailResponse
{
    public int Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CategoryResponse? Category { get; set; }
    public decimal Amount { get; set; }
}

public class MonthlyReportExportResponse
{
    public string MonthName { get; set; } = string.Empty;
    public List<ExportDataRow> Data { get; set; } = new();
}

public class ExportDataRow
{
    public string Date { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
