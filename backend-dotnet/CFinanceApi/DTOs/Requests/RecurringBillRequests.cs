using System.ComponentModel.DataAnnotations;

namespace CFinanceApi.DTOs.Requests;

public class CreateRecurringBillRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public string Frequency { get; set; } = "monthly";
    public string? NextDueDate { get; set; }
    public int ReminderDays { get; set; } = 3;
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
}

public class UpdateRecurringBillRequest
{
    public string? Name { get; set; }
    public decimal? Amount { get; set; }
    public int? CategoryId { get; set; }
    public string? Frequency { get; set; }
    public string? NextDueDate { get; set; }
    public int? ReminderDays { get; set; }
    public bool? IsActive { get; set; }
    public string? Notes { get; set; }
}
