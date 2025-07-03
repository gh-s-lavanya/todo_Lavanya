using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TodoApi;
using TodoApi.Models;
using TodoApi.Services.Interfaces;
using TodoApi.Services.Implementations;

await MainAsync(args);

static async Task MainAsync(string[] args)
{
    var builder = WebApplication.CreateBuilder(args);

    // Register EF Core + Identity
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite("Data Source=app.db").LogTo(Console.WriteLine, LogLevel.Information));

    builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

    // Configure JWT Authentication
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],// Validate the issuer
            ValidAudience = builder.Configuration["Jwt:Audience"],// Validate the audience
            // Ensure the key is present in the configuration
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                ?? throw new InvalidOperationException("JWT key is missing from configuration."))
        };
    }); 

    builder.Services.AddAuthorization();
    builder.Services.AddControllers();
    builder.Services.AddCors();// Enable CORS

    // Register Custom Services
    builder.Services.AddScoped<ITodoService, TodoService>();
    builder.Services.AddScoped<IAccountService, AccountService>();
    builder.Services.AddHttpContextAccessor();

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>(); // UserManager for Identity
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>(); // RoleManager for Identity

    string[] roles = new[] { "Admin", "User" }; // Define roles

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))// Check if role exists
            await roleManager.CreateAsync(new IdentityRole(role));// Create role if it doesn't exist
    }

    var adminEmail = "admin@gmail.com"; // Admin email
    // Check if admin user exists
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        var admin = new ApplicationUser
        {
            UserName = "admin@gmail.com",
            Email = "admin@gmail.com",
            Name = "Admin"
        };
        var result = await userManager.CreateAsync(admin, "Admin@123");// Create admin user with password
        // If creation succeeded, add to Admin role
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}


    // Middlewares
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseRouting();// Use routing middleware
    app.UseAuthentication();// Use authentication middleware
    app.UseCors(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());// Enable CORS for all origins, methods, and headers

    app.UseAuthorization();// Use authorization middleware
    app.MapControllers();// Map controllers
    await app.RunAsync();// Run the application
}
