using System.ComponentModel.DataAnnotations;

namespace CFinanceApi.DTOs.Requests;

public class CreateExpenseRequest
{
    [Required]
    public decimal Amount { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    public int? CategoryId { get; set; }
    public string? Notes { get; set; }
    public string? Date { get; set; }
    public bool IsRecurring { get; set; } = false;
}

public class UpdateExpenseRequest
{
    public decimal? Amount { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public string? Notes { get; set; }
    public string? Date { get; set; }
    public bool? IsRecurring { get; set; }
}
