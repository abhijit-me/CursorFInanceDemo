namespace CFinanceApi.DTOs.Responses;

public class BudgetResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public CategoryResponse? Category { get; set; }
    public decimal Amount { get; set; }
    public string Period { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string? CreatedAt { get; set; }
    
    // Extended properties for budget overview
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public decimal Percentage { get; set; }
    public string? Status { get; set; }
}
