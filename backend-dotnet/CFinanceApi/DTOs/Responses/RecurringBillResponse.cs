namespace CFinanceApi.DTOs.Responses;

public class RecurringBillResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public CategoryResponse? Category { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public string? NextDueDate { get; set; }
    public int ReminderDays { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public string? CreatedAt { get; set; }
    
    // Extended properties
    public int DaysUntilDue { get; set; }
    public bool IsOverdue { get; set; }
    public bool NeedsReminder { get; set; }
}
