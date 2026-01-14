using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CFinanceApi.Services;

public interface IJwtService
{
    string GenerateAccessToken(int userId);
    string GenerateRefreshToken(int userId);
    int? ValidateToken(string token);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(int userId)
    {
        return GenerateToken(userId, TimeSpan.FromHours(1));
    }

    public string GenerateRefreshToken(int userId)
    {
        return GenerateToken(userId, TimeSpan.FromDays(30));
    }

    private string GenerateToken(int userId, TimeSpan expiry)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "jwt-secret-key-change-in-production-minimum-32-chars";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("user_id", userId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "CFinanceApi",
            audience: _configuration["Jwt:Audience"] ?? "CFinanceApi",
            claims: claims,
            expires: DateTime.UtcNow.Add(expiry),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public int? ValidateToken(string token)
    {
        try
        {
            var secretKey = _configuration["Jwt:SecretKey"] ?? "jwt-secret-key-change-in-production-minimum-32-chars";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var tokenHandler = new JwtSecurityTokenHandler();
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"] ?? "CFinanceApi",
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"] ?? "CFinanceApi",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = int.Parse(jwtToken.Claims.First(x => x.Type == "user_id").Value);

            return userId;
        }
        catch
        {
            return null;
        }
    }
}
