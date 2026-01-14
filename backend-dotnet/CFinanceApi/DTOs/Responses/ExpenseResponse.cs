namespace CFinanceApi.DTOs.Responses;

public class ExpenseResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public CategoryResponse? Category { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? Date { get; set; }
    public string? ReceiptPath { get; set; }
    public bool IsRecurring { get; set; }
    public string? CreatedAt { get; set; }
    public string? UpdatedAt { get; set; }
}
