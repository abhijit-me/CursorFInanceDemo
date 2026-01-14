using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CFinanceApi.Data;
using CFinanceApi.DTOs.Responses;
using System.Globalization;

namespace CFinanceApi.Controllers;

[ApiController]
[Route("api/monthly-report")]
[Authorize]
public class MonthlyReportController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MonthlyReportController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] int? year, [FromQuery] int? month)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var today = DateTime.Today;
        var reportYear = year ?? today.Year;
        var reportMonth = month ?? today.Month;

        if (reportMonth < 1 || reportMonth > 12)
            return BadRequest(new ErrorResponse { Error = "Invalid month. Must be between 1 and 12" });

        var startDate = new DateOnly(reportYear, reportMonth, 1);
        var endDate = startDate.AddMonths(1);

        // Get spending by category
        var spendingByCategory = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId.Value && e.Date >= startDate && e.Date < endDate)
            .GroupBy(e => new { e.CategoryId, e.Category!.Name, e.Category.Color, e.Category.Icon })
            .Select(g => new SpendingByCategoryResponse
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Color = g.Key.Color,
                Icon = g.Key.Icon,
                Amount = g.Sum(e => e.Amount)
            })
            .OrderByDescending(s => s.Amount)
            .ToListAsync();

        var totalSpending = spendingByCategory.Sum(s => s.Amount);

        // Get top 3 categories with budget info
        var topCategories = new List<TopCategoryResponse>();
        foreach (var category in spendingByCategory.Take(3))
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.UserId == userId.Value
                                       && b.CategoryId == category.CategoryId
                                       && b.Period == "monthly");

            var budgetAmount = budget?.Amount ?? 0;
            var percentage = budgetAmount > 0 ? (category.Amount / budgetAmount * 100) : 0;

            topCategories.Add(new TopCategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Color = category.Color,
                Icon = category.Icon,
                Budget = budgetAmount,
                Spending = category.Amount,
                Percentage = Math.Round(percentage, 2)
            });
        }

        // Get all expenses for the month
        var expenses = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId.Value && e.Date >= startDate && e.Date < endDate)
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseDetailResponse
            {
                Id = e.Id,
                Date = e.Date.ToString("yyyy-MM-dd"),
                Description = e.Description,
                Category = e.Category != null ? new CategoryResponse
                {
                    Id = e.Category.Id,
                    Name = e.Category.Name,
                    Color = e.Category.Color,
                    Icon = e.Category.Icon
                } : null,
                Amount = e.Amount
            })
            .ToListAsync();

        // Get total budget
        var totalBudget = await _context.Budgets
            .Where(b => b.UserId == userId.Value && b.Period == "monthly")
            .SumAsync(b => (decimal?)b.Amount) ?? 0;

        var monthName = new DateTime(reportYear, reportMonth, 1).ToString("MMMM yyyy", CultureInfo.InvariantCulture);

        return Ok(new MonthlyReportResponse
        {
            Year = reportYear,
            Month = reportMonth,
            MonthName = monthName,
            TotalSpending = totalSpending,
            TotalBudget = totalBudget,
            BudgetRemaining = totalBudget - totalSpending,
            SpendingByCategory = spendingByCategory,
            TopCategories = topCategories,
            ExpenseDetails = expenses
        });
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportMonthlyReport([FromQuery] int? year, [FromQuery] int? month)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var today = DateTime.Today;
        var reportYear = year ?? today.Year;
        var reportMonth = month ?? today.Month;

        var startDate = new DateOnly(reportYear, reportMonth, 1);
        var endDate = startDate.AddMonths(1);

        var expenses = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId.Value && e.Date >= startDate && e.Date < endDate)
            .OrderByDescending(e => e.Date)
            .Select(e => new ExportDataRow
            {
                Date = e.Date.ToString("yyyy-MM-dd"),
                Description = e.Description,
                Category = e.Category != null ? e.Category.Name : "Uncategorized",
                Amount = e.Amount
            })
            .ToListAsync();

        var monthName = new DateTime(reportYear, reportMonth, 1).ToString("MMMM yyyy", CultureInfo.InvariantCulture);

        return Ok(new MonthlyReportExportResponse
        {
            MonthName = monthName,
            Data = expenses
        });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
