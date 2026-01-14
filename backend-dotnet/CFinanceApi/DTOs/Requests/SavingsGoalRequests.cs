using System.ComponentModel.DataAnnotations;

namespace CFinanceApi.DTOs.Requests;

public class CreateSavingsGoalRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal TargetAmount { get; set; }

    public decimal CurrentAmount { get; set; } = 0;
    public string? TargetDate { get; set; }
    public string Icon { get; set; } = "savings";
    public string Color { get; set; } = "#4CAF50";
}

public class UpdateSavingsGoalRequest
{
    public string? Name { get; set; }
    public decimal? TargetAmount { get; set; }
    public decimal? CurrentAmount { get; set; }
    public string? TargetDate { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool? IsCompleted { get; set; }
}

public class ContributeRequest
{
    [Required]
    public decimal Amount { get; set; }
}
