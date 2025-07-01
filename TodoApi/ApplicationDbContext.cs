using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

/// <summary>
/// Represents the Entity Framework database context for the TodoApi application.
/// Inherits from <see cref="IdentityDbContext{TUser}"/> to provide ASP.NET Core Identity support.
/// </summary>
/// <remarks>
/// This context manages the application's database connection and provides access to the <see cref="TodoItem"/> entities.
/// </remarks>
namespace TodoApi
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<TodoItem> TodoItems { get; set; }
    }
}
