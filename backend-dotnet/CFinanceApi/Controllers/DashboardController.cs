using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CFinanceApi.Data;
using CFinanceApi.DTOs.Responses;

namespace CFinanceApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        // Total expenses this month
        var totalExpenses = await _context.Expenses
            .Where(e => e.UserId == userId.Value && e.Date >= startOfMonth && e.Date < startOfNextMonth)
            .SumAsync(e => (decimal?)e.Amount) ?? 0;

        // Total budget for this month
        var totalBudget = await _context.Budgets
            .Where(b => b.UserId == userId.Value && b.Period == "monthly")
            .SumAsync(b => (decimal?)b.Amount) ?? 0;

        // Upcoming bills (next 30 days)
        var in30Days = today.AddDays(30);
        var upcomingBills = await _context.RecurringBills
            .CountAsync(b => b.UserId == userId.Value
                          && b.IsActive
                          && b.NextDueDate >= today
                          && b.NextDueDate <= in30Days);

        // Active savings goals
        var activeSavingsGoals = await _context.SavingsGoals
            .CountAsync(g => g.UserId == userId.Value && !g.IsCompleted);

        // Total saved in savings goals
        var totalSaved = await _context.SavingsGoals
            .Where(g => g.UserId == userId.Value)
            .SumAsync(g => (decimal?)g.CurrentAmount) ?? 0;

        var budgetPercentage = totalBudget > 0 ? (totalExpenses / totalBudget * 100) : 0;

        return Ok(new DashboardStatsResponse
        {
            TotalExpenses = totalExpenses,
            TotalBudget = totalBudget,
            BudgetRemaining = totalBudget - totalExpenses,
            BudgetPercentage = Math.Round(budgetPercentage, 2),
            UpcomingBills = upcomingBills,
            ActiveSavingsGoals = activeSavingsGoals,
            TotalSaved = totalSaved
        });
    }

    [HttpGet("spending-by-category")]
    public async Task<IActionResult> GetSpendingByCategory([FromQuery] string period = "month")
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var startDate = period switch
        {
            "year" => new DateOnly(today.Year, 1, 1),
            "all" => new DateOnly(2000, 1, 1),
            _ => new DateOnly(today.Year, today.Month, 1)
        };

        var spending = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId.Value && e.Date >= startDate)
            .GroupBy(e => new { e.CategoryId, e.Category!.Name, e.Category.Color, e.Category.Icon })
            .Select(g => new SpendingByCategoryResponse
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Color = g.Key.Color,
                Icon = g.Key.Icon,
                Amount = g.Sum(e => e.Amount)
            })
            .ToListAsync();

        return Ok(spending);
    }

    [HttpGet("spending-trend")]
    public async Task<IActionResult> GetSpendingTrend([FromQuery] string period = "6months")
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var months = period == "year" ? 12 : 6;
        var today = DateOnly.FromDateTime(DateTime.Today);
        var result = new List<SpendingTrendResponse>();

        for (int i = months - 1; i >= 0; i--)
        {
            var targetMonth = today.AddMonths(-i);
            var startDate = new DateOnly(targetMonth.Year, targetMonth.Month, 1);
            var endDate = startDate.AddMonths(1);

            var total = await _context.Expenses
                .Where(e => e.UserId == userId.Value && e.Date >= startDate && e.Date < endDate)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            result.Add(new SpendingTrendResponse
            {
                Month = $"{targetMonth.Year}-{targetMonth.Month:D2}",
                Amount = total
            });
        }

        return Ok(result);
    }

    [HttpGet("recent-expenses")]
    public async Task<IActionResult> GetRecentExpenses([FromQuery] int limit = 10)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var expenses = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId.Value)
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Take(limit)
            .Select(e => new ExpenseResponse
            {
                Id = e.Id,
                UserId = e.UserId,
                CategoryId = e.CategoryId,
                Category = e.Category != null ? new CategoryResponse
                {
                    Id = e.Category.Id,
                    Name = e.Category.Name,
                    Icon = e.Category.Icon,
                    Color = e.Category.Color
                } : null,
                Amount = e.Amount,
                Description = e.Description,
                Notes = e.Notes,
                Date = e.Date.ToString("yyyy-MM-dd"),
                ReceiptPath = e.ReceiptPath,
                IsRecurring = e.IsRecurring,
                CreatedAt = e.CreatedAt.ToString("o"),
                UpdatedAt = e.UpdatedAt.ToString("o")
            })
            .ToListAsync();

        return Ok(expenses);
    }

    [HttpGet("budget-overview")]
    public async Task<IActionResult> GetBudgetOverview()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var today = DateOnly.FromDateTime(DateTime.Today);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId.Value && b.Period == "monthly")
            .ToListAsync();

        var result = new List<BudgetResponse>();

        foreach (var budget in budgets)
        {
            var spent = await _context.Expenses
                .Where(e => e.UserId == userId.Value
                         && e.CategoryId == budget.CategoryId
                         && e.Date >= startOfMonth
                         && e.Date < startOfNextMonth)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            var remaining = budget.Amount - spent;
            var percentage = budget.Amount > 0 ? (spent / budget.Amount * 100) : 0;

            var status = percentage >= 100 ? "exceeded"
                       : percentage >= 80 ? "warning"
                       : "good";

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
                Spent = spent,
                Remaining = remaining,
                Percentage = Math.Round(percentage, 2),
                Status = status
            });
        }

        return Ok(result);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
