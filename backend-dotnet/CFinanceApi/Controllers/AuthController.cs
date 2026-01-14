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
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(ApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Validate required fields
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Username))
        {
            return BadRequest(new ErrorResponse { Error = "Email, username, and password are required" });
        }

        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new ErrorResponse { Error = "Email already registered" });
        }

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest(new ErrorResponse { Error = "Username already taken" });
        }

        // Create new user
        var user = new User
        {
            Email = request.Email,
            Username = request.Username,
            FirstName = request.FirstName ?? "",
            LastName = request.LastName ?? "",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Create tokens
        var accessToken = _jwtService.GenerateAccessToken(user.Id);
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        return CreatedAtAction(nameof(GetCurrentUser), new AuthResponse
        {
            Message = "User registered successfully",
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToUserResponse(user)
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new ErrorResponse { Error = "Email and password are required" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new ErrorResponse { Error = "Invalid email or password" });
        }

        // Create tokens
        var accessToken = _jwtService.GenerateAccessToken(user.Id);
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        return Ok(new AuthResponse
        {
            Message = "Login successful",
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToUserResponse(user)
        });
    }

    [HttpPost("refresh")]
    [Authorize]
    public IActionResult Refresh()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ErrorResponse { Error = "Invalid token" });
        }

        var accessToken = _jwtService.GenerateAccessToken(userId.Value);

        return Ok(new TokenResponse { AccessToken = accessToken });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ErrorResponse { Error = "Invalid token" });
        }

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null)
        {
            return NotFound(new ErrorResponse { Error = "User not found" });
        }

        return Ok(MapToUserResponse(user));
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new ErrorResponse { Error = "Invalid token" });
        }

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null)
        {
            return NotFound(new ErrorResponse { Error = "User not found" });
        }

        // Update allowed fields
        if (request.FirstName != null)
            user.FirstName = request.FirstName;
        if (request.LastName != null)
            user.LastName = request.LastName;
        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            // Check if email is already taken
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new ErrorResponse { Error = "Email already in use" });
            }
            user.Email = request.Email;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User updated successfully",
            user = MapToUserResponse(user)
        });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }

    // TEMPORARY: Fix password hash for demo user
    [HttpPost("fix-demo-password")]
    public async Task<IActionResult> FixDemoPassword()
    {
        var demoUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "demo@financeapp.com");
        if (demoUser == null)
        {
            return NotFound(new { error = "Demo user not found" });
        }

        // Update password hash to BCrypt for "demo123"
        demoUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123");
        await _context.SaveChangesAsync();

        return Ok(new { message = "Demo user password updated to use BCrypt", email = demoUser.Email });
    }

    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt.ToString("o")
        };
    }
}
