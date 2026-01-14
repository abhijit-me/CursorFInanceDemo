namespace CFinanceApi.DTOs.Responses;

public class AuthResponse
{
    public string Message { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserResponse? User { get; set; }
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
}

public class UserResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? CreatedAt { get; set; }
}
