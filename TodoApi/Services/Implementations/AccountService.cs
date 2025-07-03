using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApi.Models;
using TodoApi.Services.Interfaces;

namespace TodoApi.Services.Implementations
{
    public class AccountService : IAccountService// Service for user account management
    {
        private readonly UserManager<ApplicationUser> _userManager;// User manager for handling user-related operations
        private readonly SignInManager<ApplicationUser> _signInManager;// Sign-in manager for handling user sign-in operations
        // Configuration for JWT token generation
        private readonly IConfiguration _config;

        public AccountService(// Constructor to inject dependencies
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }
    
        public async Task<(bool Succeeded, IEnumerable<string> Errors)> RegisterAsync(RegisterDto dto)// Register a new user
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                Name = dto.Name
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (result.Succeeded)
            {
                // Auto-assign the "User" role after successful registration
                await _userManager.AddToRoleAsync(user, "User");
            }

            return (result.Succeeded, result.Errors.Select(e => e.Description));// Return success status and any errors
        }

        public async Task<(string? Token, string? Name, string? Email, string? ErrorMessage)> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return (null, null, null, "Invalid credentials");
            }

            var token = await GenerateJwtToken(user);
            return (token, user.Name, user.Email, null);
        }

        public async Task<ApplicationUser?> GetCurrentUserAsync(string userId)// Get the current logged-in user details
        {
            return await _userManager.FindByIdAsync(userId);// Find user by ID
        }

        public async Task<(bool Succeeded, IEnumerable<string> Errors)> UpdateProfileAsync(string userId, UpdateUserDto dto)
        {// Update user profile information
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, new[] { "User not found" });

            if (!string.IsNullOrWhiteSpace(dto.Name))// Update user's name if provided
                user.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))// Update user's phone number if provided
                user.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrWhiteSpace(dto.Password))// Update user's password if provided
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);// Generate a password reset token
                var resetResult = await _userManager.ResetPasswordAsync(user, token, dto.Password);// Reset the user's password
                if (!resetResult.Succeeded)
                    return (false, resetResult.Errors.Select(e => e.Description));
            }

            var updateResult = await _userManager.UpdateAsync(user);// Update the user in the database
            return (updateResult.Succeeded, updateResult.Errors.Select(e => e.Description));
        }

        public async Task<string> GenerateJwtToken(ApplicationUser user)// Generate a JWT token for the user
        {
            var roles = await _userManager.GetRolesAsync(user);// Get the roles assigned to the user

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),// Subject claim for the user ID
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),// Email claim
                new Claim("name", user.Name ?? ""),// Name claim
                new Claim(ClaimTypes.NameIdentifier, user.Id)// Name identifier claim for the user ID
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));// Add role claims for the user
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing.")
            ));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);// Create signing credentials using the symmetric key and HMAC SHA256 algorithm

            var token = new JwtSecurityToken(// Create a new JWT token
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);// Write the token to a string
        }

        public Task<IEnumerable<ApplicationUser>> GetAllUsersAsync()// Get all registered users
        {
            return Task.FromResult(_userManager.Users.ToList().AsEnumerable());
        }
        public async Task<ApplicationUser?> GetUserByIdAsync(string userId)// Get a user by ID (Admin only)
        {
            return await _userManager.FindByIdAsync(userId);
        }
    }
}
