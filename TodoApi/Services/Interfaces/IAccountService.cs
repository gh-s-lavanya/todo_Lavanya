using TodoApi.Models;


namespace TodoApi.Services.Interfaces
{
    public interface IAccountService
    {
        Task<(bool Succeeded, IEnumerable<string> Errors)> RegisterAsync(RegisterDto dto);// Register a new user
        Task<(string? Token, string? Name, string? Email, string? ErrorMessage)> LoginAsync(LoginDto dto);// Login an existing user
        Task<ApplicationUser?> GetCurrentUserAsync(string userId);// Get the current logged-in user details
        Task<(bool Succeeded, IEnumerable<string> Errors)> UpdateProfileAsync(string userId, UpdateUserDto dto);// Update the current user's profile
        Task<string> GenerateJwtToken(ApplicationUser user);// Generate a JWT token for the user
        Task<IEnumerable<ApplicationUser>> GetAllUsersAsync();// Get all registered users
        Task<ApplicationUser?> GetUserByIdAsync(string userId);// Get a user by their ID

    }
}
