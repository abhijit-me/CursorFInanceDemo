using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CFinanceApi.Data;
using CFinanceApi.DTOs.Requests;
using CFinanceApi.DTOs.Responses;
using CFinanceApi.Models;

namespace CFinanceApi.Controllers;

[ApiController]
[Route("api/savings-goals")]
[Authorize]
public class SavingsGoalsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SavingsGoalsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSavingsGoals([FromQuery] string? is_completed)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var query = _context.SavingsGoals
            .Where(g => g.UserId == userId.Value);

        if (!string.IsNullOrEmpty(is_completed))
        {
            var completedFilter = is_completed.ToLower() == "true";
            query = query.Where(g => g.IsCompleted == completedFilter);
        }

        var goals = await query
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();

        return Ok(goals.Select(MapToSavingsGoalResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSavingsGoal(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var goal = await _context.SavingsGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId.Value);

        if (goal == null)
            return NotFound(new ErrorResponse { Error = "Savings goal not found" });

        return Ok(MapToSavingsGoalResponse(goal));
    }

    [HttpPost]
    public async Task<IActionResult> CreateSavingsGoal([FromBody] CreateSavingsGoalRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrEmpty(request.Name) || request.TargetAmount <= 0)
            return BadRequest(new ErrorResponse { Error = "Name and target amount are required" });

        // Parse target date
        DateOnly? targetDate = null;
        if (DateOnly.TryParse(request.TargetDate, out var parsedDate))
            targetDate = parsedDate;

        var goal = new SavingsGoal
        {
            UserId = userId.Value,
            Name = request.Name,
            TargetAmount = request.TargetAmount,
            CurrentAmount = request.CurrentAmount,
            TargetDate = targetDate,
            Icon = request.Icon,
            Color = request.Color
        };

        // Check if already completed
        if (goal.CurrentAmount >= goal.TargetAmount)
            goal.IsCompleted = true;

        _context.SavingsGoals.Add(goal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSavingsGoal), new { id = goal.Id }, new
        {
            message = "Savings goal created successfully",
            goal = MapToSavingsGoalResponse(goal)
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSavingsGoal(int id, [FromBody] UpdateSavingsGoalRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var goal = await _context.SavingsGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId.Value);

        if (goal == null)
            return NotFound(new ErrorResponse { Error = "Savings goal not found" });

        // Update fields
        if (!string.IsNullOrEmpty(request.Name))
            goal.Name = request.Name;
        if (request.TargetAmount.HasValue)
            goal.TargetAmount = request.TargetAmount.Value;
        if (request.CurrentAmount.HasValue)
            goal.CurrentAmount = request.CurrentAmount.Value;
        if (DateOnly.TryParse(request.TargetDate, out var targetDate))
            goal.TargetDate = targetDate;
        if (!string.IsNullOrEmpty(request.Icon))
            goal.Icon = request.Icon;
        if (!string.IsNullOrEmpty(request.Color))
            goal.Color = request.Color;
        if (request.IsCompleted.HasValue)
            goal.IsCompleted = request.IsCompleted.Value;

        // Auto-mark as completed if target reached
        if (goal.CurrentAmount >= goal.TargetAmount)
            goal.IsCompleted = true;

        goal.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Savings goal updated successfully",
            goal = MapToSavingsGoalResponse(goal)
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSavingsGoal(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var goal = await _context.SavingsGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId.Value);

        if (goal == null)
            return NotFound(new ErrorResponse { Error = "Savings goal not found" });

        _context.SavingsGoals.Remove(goal);
        await _context.SaveChangesAsync();

        return Ok(new MessageResponse { Message = "Savings goal deleted successfully" });
    }

    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> ContributeToGoal(int id, [FromBody] ContributeRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var goal = await _context.SavingsGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId.Value);

        if (goal == null)
            return NotFound(new ErrorResponse { Error = "Savings goal not found" });

        if (request.Amount <= 0)
            return BadRequest(new ErrorResponse { Error = "Amount is required" });

        goal.CurrentAmount += request.Amount;

        // Auto-mark as completed if target reached
        if (goal.CurrentAmount >= goal.TargetAmount)
            goal.IsCompleted = true;

        goal.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Contribution added successfully",
            goal = MapToSavingsGoalResponse(goal)
        });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static SavingsGoalResponse MapToSavingsGoalResponse(SavingsGoal goal)
    {
        var progress = goal.TargetAmount > 0
            ? Math.Round(goal.CurrentAmount / goal.TargetAmount * 100, 2)
            : 0;

        return new SavingsGoalResponse
        {
            Id = goal.Id,
            UserId = goal.UserId,
            Name = goal.Name,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            Progress = progress,
            TargetDate = goal.TargetDate?.ToString("yyyy-MM-dd"),
            Icon = goal.Icon,
            Color = goal.Color,
            IsCompleted = goal.IsCompleted,
            CreatedAt = goal.CreatedAt.ToString("o")
        };
    }
}
