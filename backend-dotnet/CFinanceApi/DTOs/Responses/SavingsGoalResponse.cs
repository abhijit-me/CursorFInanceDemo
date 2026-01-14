namespace CFinanceApi.DTOs.Responses;

public class SavingsGoalResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal Progress { get; set; }
    public string? TargetDate { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsCompleted { get; set; }
    public string? CreatedAt { get; set; }
}
