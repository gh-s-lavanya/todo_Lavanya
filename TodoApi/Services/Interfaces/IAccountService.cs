using TodoApi.Models;

namespace TodoApi.Services.Interfaces
{
    public interface IAccountService
    {
        Task<(bool Succeeded, IEnumerable<string> Errors)> RegisterAsync(RegisterDto dto);
        Task<(string? Token, string? Name, string? Email, string? ErrorMessage)> LoginAsync(LoginDto dto);
        Task<ApplicationUser?> GetCurrentUserAsync(string userId);
        Task<(bool Succeeded, IEnumerable<string> Errors)> UpdateProfileAsync(string userId, UpdateUserDto dto);
        string GenerateJwtToken(ApplicationUser user);
    }
}
