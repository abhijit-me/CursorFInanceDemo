using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CFinanceApi.Data;
using CFinanceApi.DTOs.Requests;
using CFinanceApi.DTOs.Responses;
using CFinanceApi.Models;

namespace CFinanceApi.Controllers;

[ApiController]
[Route("api/recurring-bills")]
[Authorize]
public class RecurringBillsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RecurringBillsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecurringBills([FromQuery] string? is_active)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var query = _context.RecurringBills
            .Include(b => b.Category)
            .Where(b => b.UserId == userId.Value);

        if (!string.IsNullOrEmpty(is_active))
        {
            var activeFilter = is_active.ToLower() == "true";
            query = query.Where(b => b.IsActive == activeFilter);
        }

        var bills = await query
            .OrderBy(b => b.NextDueDate)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var result = bills.Select(b =>
        {
            var daysUntilDue = b.NextDueDate.DayNumber - today.DayNumber;
            return new RecurringBillResponse
            {
                Id = b.Id,
                UserId = b.UserId,
                CategoryId = b.CategoryId,
                Category = b.Category != null ? new CategoryResponse
                {
                    Id = b.Category.Id,
                    Name = b.Category.Name,
                    Icon = b.Category.Icon,
                    Color = b.Category.Color
                } : null,
                Name = b.Name,
                Amount = b.Amount,
                Frequency = b.Frequency,
                NextDueDate = b.NextDueDate.ToString("yyyy-MM-dd"),
                ReminderDays = b.ReminderDays,
                IsActive = b.IsActive,
                Notes = b.Notes,
                CreatedAt = b.CreatedAt.ToString("o"),
                DaysUntilDue = daysUntilDue,
                IsOverdue = daysUntilDue < 0,
                NeedsReminder = daysUntilDue >= 0 && daysUntilDue <= b.ReminderDays
            };
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRecurringBill(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var bill = await _context.RecurringBills
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (bill == null)
            return NotFound(new ErrorResponse { Error = "Recurring bill not found" });

        return Ok(MapToRecurringBillResponse(bill));
    }

    [HttpPost]
    public async Task<IActionResult> CreateRecurringBill([FromBody] CreateRecurringBillRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrEmpty(request.Name) || request.Amount <= 0 || request.CategoryId <= 0)
            return BadRequest(new ErrorResponse { Error = "Name, amount, and category are required" });

        // Parse next due date
        var nextDueDate = DateOnly.FromDateTime(DateTime.Today);
        if (DateOnly.TryParse(request.NextDueDate, out var parsedDate))
            nextDueDate = parsedDate;

        var bill = new RecurringBill
        {
            UserId = userId.Value,
            CategoryId = request.CategoryId,
            Name = request.Name,
            Amount = request.Amount,
            Frequency = request.Frequency ?? "monthly",
            NextDueDate = nextDueDate,
            ReminderDays = request.ReminderDays,
            IsActive = request.IsActive,
            Notes = request.Notes ?? ""
        };

        _context.RecurringBills.Add(bill);
        await _context.SaveChangesAsync();

        await _context.Entry(bill).Reference(b => b.Category).LoadAsync();

        return CreatedAtAction(nameof(GetRecurringBill), new { id = bill.Id }, new
        {
            message = "Recurring bill created successfully",
            bill = MapToRecurringBillResponse(bill)
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecurringBill(int id, [FromBody] UpdateRecurringBillRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var bill = await _context.RecurringBills
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (bill == null)
            return NotFound(new ErrorResponse { Error = "Recurring bill not found" });

        // Update fields
        if (!string.IsNullOrEmpty(request.Name))
            bill.Name = request.Name;
        if (request.Amount.HasValue)
            bill.Amount = request.Amount.Value;
        if (request.CategoryId.HasValue)
            bill.CategoryId = request.CategoryId.Value;
        if (!string.IsNullOrEmpty(request.Frequency))
            bill.Frequency = request.Frequency;
        if (DateOnly.TryParse(request.NextDueDate, out var nextDueDate))
            bill.NextDueDate = nextDueDate;
        if (request.ReminderDays.HasValue)
            bill.ReminderDays = request.ReminderDays.Value;
        if (request.IsActive.HasValue)
            bill.IsActive = request.IsActive.Value;
        if (request.Notes != null)
            bill.Notes = request.Notes;

        bill.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Recurring bill updated successfully",
            bill = MapToRecurringBillResponse(bill)
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecurringBill(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var bill = await _context.RecurringBills
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (bill == null)
            return NotFound(new ErrorResponse { Error = "Recurring bill not found" });

        _context.RecurringBills.Remove(bill);
        await _context.SaveChangesAsync();

        return Ok(new MessageResponse { Message = "Recurring bill deleted successfully" });
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> MarkBillPaid(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var bill = await _context.RecurringBills
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (bill == null)
            return NotFound(new ErrorResponse { Error = "Recurring bill not found" });

        // Calculate next due date based on frequency
        bill.NextDueDate = bill.Frequency switch
        {
            "weekly" => bill.NextDueDate.AddDays(7),
            "yearly" => bill.NextDueDate.AddYears(1),
            _ => bill.NextDueDate.AddMonths(1) // monthly is default
        };

        bill.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Bill marked as paid",
            bill = MapToRecurringBillResponse(bill)
        });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static RecurringBillResponse MapToRecurringBillResponse(RecurringBill bill)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var daysUntilDue = bill.NextDueDate.DayNumber - today.DayNumber;

        return new RecurringBillResponse
        {
            Id = bill.Id,
            UserId = bill.UserId,
            CategoryId = bill.CategoryId,
            Category = bill.Category != null ? new CategoryResponse
            {
                Id = bill.Category.Id,
                Name = bill.Category.Name,
                Icon = bill.Category.Icon,
                Color = bill.Category.Color
            } : null,
            Name = bill.Name,
            Amount = bill.Amount,
            Frequency = bill.Frequency,
            NextDueDate = bill.NextDueDate.ToString("yyyy-MM-dd"),
            ReminderDays = bill.ReminderDays,
            IsActive = bill.IsActive,
            Notes = bill.Notes,
            CreatedAt = bill.CreatedAt.ToString("o"),
            DaysUntilDue = daysUntilDue,
            IsOverdue = daysUntilDue < 0,
            NeedsReminder = daysUntilDue >= 0 && daysUntilDue <= bill.ReminderDays
        };
    }
}
