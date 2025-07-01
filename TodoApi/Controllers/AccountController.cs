using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoApi.Models;
using Microsoft.AspNetCore.Authorization;
using TodoApi.Services.Interfaces;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(ILogger<AccountController> logger, IAccountService accountService)
        {
            _logger = logger;
            _accountService = accountService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var (succeeded, errors) = await _accountService.RegisterAsync(dto);
            if (succeeded) return Ok(new { message = "User registered successfully" });
            return BadRequest(errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state: {@ModelState}", ModelState);
                return BadRequest("Invalid input");
            }

            var (token, name, email, error) = await _accountService.LoginAsync(dto);
            if (error != null)
            {
                _logger.LogWarning("Login failed: {Error}", error);
                return BadRequest(error);
            }

            return Ok(new
            {
                accessToken = token,
                refreshToken = "dummy-refresh-token",
                name,
                email
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _accountService.GetCurrentUserAsync(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Name,
                user.PhoneNumber
            });
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateUserDto model)
        {
            var userId = User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var (succeeded, errors) = await _accountService.UpdateProfileAsync(userId, model);
            if (!succeeded) return BadRequest(errors);

            return Ok(new { message = "Profile updated successfully" });
        }
    }

}
