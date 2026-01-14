using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CFinanceApi.Data;
using CFinanceApi.DTOs.Requests;
using CFinanceApi.DTOs.Responses;
using CFinanceApi.Models;

namespace CFinanceApi.Controllers;

[ApiController]
[Route("api/budgets")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BudgetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBudgets([FromQuery] string period = "monthly")
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId.Value && b.Period == period)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var result = new List<BudgetResponse>();

        foreach (var budget in budgets)
        {
            // Calculate date range based on period
            DateOnly startDate, endDate;
            if (period == "monthly")
            {
                startDate = new DateOnly(today.Year, today.Month, 1);
                endDate = startDate.AddMonths(1);
            }
            else // yearly
            {
                startDate = new DateOnly(today.Year, 1, 1);
                endDate = startDate.AddYears(1);
            }

            // Get total spending for this category
            var totalSpent = await _context.Expenses
                .Where(e => e.UserId == userId.Value
                         && e.CategoryId == budget.CategoryId
                         && e.Date >= startDate
                         && e.Date < endDate)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            var remaining = budget.Amount - totalSpent;
            var percentage = budget.Amount > 0 ? (totalSpent / budget.Amount * 100) : 0;

            result.Add(new BudgetResponse
            {
                Id = budget.Id,
                UserId = budget.UserId,
                CategoryId = budget.CategoryId,
                Category = budget.Category != null ? new CategoryResponse
                {
                    Id = budget.Category.Id,
                    Name = budget.Category.Name,
                    Icon = budget.Category.Icon,
                    Color = budget.Category.Color
                } : null,
                Amount = budget.Amount,
                Period = budget.Period,
                StartDate = budget.StartDate.ToString("yyyy-MM-dd"),
                EndDate = budget.EndDate?.ToString("yyyy-MM-dd"),
                CreatedAt = budget.CreatedAt.ToString("o"),
                Spent = totalSpent,
                Remaining = remaining,
                Percentage = Math.Round(percentage, 2)
            });
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBudget(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var budget = await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (budget == null)
            return NotFound(new ErrorResponse { Error = "Budget not found" });

        return Ok(MapToBudgetResponse(budget));
    }

    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (request.CategoryId <= 0 || request.Amount <= 0)
            return BadRequest(new ErrorResponse { Error = "Category and amount are required" });

        var period = request.Period ?? "monthly";

        // Check if budget already exists
        var existing = await _context.Budgets.AnyAsync(b =>
            b.UserId == userId.Value &&
            b.CategoryId == request.CategoryId &&
            b.Period == period);

        if (existing)
            return BadRequest(new ErrorResponse { Error = "Budget already exists for this category and period" });

        // Parse dates
        var startDate = DateOnly.FromDateTime(DateTime.Today);
        if (DateOnly.TryParse(request.StartDate, out var parsedStartDate))
            startDate = parsedStartDate;

        DateOnly? endDate = null;
        if (DateOnly.TryParse(request.EndDate, out var parsedEndDate))
            endDate = parsedEndDate;

        var budget = new Budget
        {
            UserId = userId.Value,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Period = period,
            StartDate = startDate,
            EndDate = endDate
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        await _context.Entry(budget).Reference(b => b.Category).LoadAsync();

        return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, new
        {
            message = "Budget created successfully",
            budget = MapToBudgetResponse(budget)
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var budget = await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (budget == null)
            return NotFound(new ErrorResponse { Error = "Budget not found" });

        // Update fields
        if (request.Amount.HasValue)
            budget.Amount = request.Amount.Value;
        if (!string.IsNullOrEmpty(request.Period))
            budget.Period = request.Period;
        if (DateOnly.TryParse(request.StartDate, out var startDate))
            budget.StartDate = startDate;
        if (DateOnly.TryParse(request.EndDate, out var endDate))
            budget.EndDate = endDate;

        budget.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Budget updated successfully",
            budget = MapToBudgetResponse(budget)
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId.Value);

        if (budget == null)
            return NotFound(new ErrorResponse { Error = "Budget not found" });

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();

        return Ok(new MessageResponse { Message = "Budget deleted successfully" });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static BudgetResponse MapToBudgetResponse(Budget budget)
    {
        return new BudgetResponse
        {
            Id = budget.Id,
            UserId = budget.UserId,
            CategoryId = budget.CategoryId,
            Category = budget.Category != null ? new CategoryResponse
            {
                Id = budget.Category.Id,
                Name = budget.Category.Name,
                Icon = budget.Category.Icon,
                Color = budget.Category.Color
            } : null,
            Amount = budget.Amount,
            Period = budget.Period,
            StartDate = budget.StartDate.ToString("yyyy-MM-dd"),
            EndDate = budget.EndDate?.ToString("yyyy-MM-dd"),
            CreatedAt = budget.CreatedAt.ToString("o")
        };
    }
}
