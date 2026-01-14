using System.ComponentModel.DataAnnotations;

namespace CFinanceApi.DTOs.Requests;

public class CreateBudgetRequest
{
    [Required]
    public int CategoryId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    public string Period { get; set; } = "monthly";
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}

public class UpdateBudgetRequest
{
    public decimal? Amount { get; set; }
    public string? Period { get; set; }
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}
