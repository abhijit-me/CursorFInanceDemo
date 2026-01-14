using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CFinanceApi.Data;
using CFinanceApi.DTOs.Requests;
using CFinanceApi.DTOs.Responses;
using CFinanceApi.Models;
using CFinanceApi.Services;

namespace CFinanceApi.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICategorizationService _categorizationService;
    private readonly IFileUploadService _fileUploadService;

    public ExpensesController(
        ApplicationDbContext context,
        ICategorizationService categorizationService,
        IFileUploadService fileUploadService)
    {
        _context = context;
        _categorizationService = categorizationService;
        _fileUploadService = fileUploadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetExpenses(
        [FromQuery] int? categoryId,
        [FromQuery] string? startDate,
        [FromQuery] string? endDate)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var query = _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId.Value);

        if (categoryId.HasValue)
            query = query.Where(e => e.CategoryId == categoryId.Value);

        if (DateOnly.TryParse(startDate, out var parsedStartDate))
            query = query.Where(e => e.Date >= parsedStartDate);

        if (DateOnly.TryParse(endDate, out var parsedEndDate))
            query = query.Where(e => e.Date <= parsedEndDate);

        var expenses = await query
            .OrderByDescending(e => e.Date)
            .ToListAsync();

        return Ok(expenses.Select(MapToExpenseResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetExpense(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var expense = await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId.Value);

        if (expense == null)
            return NotFound(new ErrorResponse { Error = "Expense not found" });

        return Ok(MapToExpenseResponse(expense));
    }

    [HttpPost]
    public async Task<IActionResult> CreateExpense([FromForm] CreateExpenseRequest request, IFormFile? receipt)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (request.Amount <= 0 || string.IsNullOrEmpty(request.Description))
            return BadRequest(new ErrorResponse { Error = "Amount and description are required" });

        // Auto-categorize if category not provided
        var categoryId = request.CategoryId;
        if (!categoryId.HasValue)
        {
            categoryId = await _categorizationService.AutoCategorizeExpenseAsync(request.Description);
        }

        if (!categoryId.HasValue)
            return BadRequest(new ErrorResponse { Error = "Category is required and could not be auto-detected" });

        // Handle receipt upload
        var receiptPath = await _fileUploadService.SaveReceiptAsync(receipt);

        // Parse date
        var expenseDate = DateOnly.FromDateTime(DateTime.Today);
        if (DateOnly.TryParse(request.Date, out var parsedDate))
            expenseDate = parsedDate;

        var expense = new Expense
        {
            UserId = userId.Value,
            CategoryId = categoryId.Value,
            Amount = request.Amount,
            Description = request.Description,
            Notes = request.Notes ?? "",
            Date = expenseDate,
            ReceiptPath = receiptPath,
            IsRecurring = request.IsRecurring
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        await _context.Entry(expense).Reference(e => e.Category).LoadAsync();

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, new
        {
            message = "Expense created successfully",
            expense = MapToExpenseResponse(expense)
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id, [FromForm] UpdateExpenseRequest request, IFormFile? receipt)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var expense = await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId.Value);

        if (expense == null)
            return NotFound(new ErrorResponse { Error = "Expense not found" });

        // Update fields
        if (request.Amount.HasValue)
            expense.Amount = request.Amount.Value;
        if (request.Description != null)
            expense.Description = request.Description;
        if (request.Notes != null)
            expense.Notes = request.Notes;
        if (request.CategoryId.HasValue)
            expense.CategoryId = request.CategoryId.Value;
        if (DateOnly.TryParse(request.Date, out var parsedDate))
            expense.Date = parsedDate;
        if (request.IsRecurring.HasValue)
            expense.IsRecurring = request.IsRecurring.Value;

        // Handle receipt upload
        if (receipt != null)
        {
            // Delete old receipt
            _fileUploadService.DeleteReceipt(expense.ReceiptPath);
            expense.ReceiptPath = await _fileUploadService.SaveReceiptAsync(receipt);
        }

        expense.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Expense updated successfully",
            expense = MapToExpenseResponse(expense)
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId.Value);

        if (expense == null)
            return NotFound(new ErrorResponse { Error = "Expense not found" });

        // Delete receipt file
        _fileUploadService.DeleteReceipt(expense.ReceiptPath);

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Ok(new MessageResponse { Message = "Expense deleted successfully" });
    }

    [HttpGet("receipts/{filename}")]
    public IActionResult GetReceipt(string filename)
    {
        var filePath = Path.Combine(_fileUploadService.GetUploadPath(), filename);
        if (!System.IO.File.Exists(filePath))
            return NotFound();

        var mimeType = GetMimeType(filename);
        return PhysicalFile(filePath, mimeType);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static ExpenseResponse MapToExpenseResponse(Expense expense)
    {
        return new ExpenseResponse
        {
            Id = expense.Id,
            UserId = expense.UserId,
            CategoryId = expense.CategoryId,
            Category = expense.Category != null ? new CategoryResponse
            {
                Id = expense.Category.Id,
                Name = expense.Category.Name,
                Icon = expense.Category.Icon,
                Color = expense.Category.Color
            } : null,
            Amount = expense.Amount,
            Description = expense.Description,
            Notes = expense.Notes,
            Date = expense.Date.ToString("yyyy-MM-dd"),
            ReceiptPath = expense.ReceiptPath,
            IsRecurring = expense.IsRecurring,
            CreatedAt = expense.CreatedAt.ToString("o"),
            UpdatedAt = expense.UpdatedAt.ToString("o")
        };
    }

    private static string GetMimeType(string filename)
    {
        var ext = Path.GetExtension(filename).ToLowerInvariant();
        return ext switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };
    }
}
