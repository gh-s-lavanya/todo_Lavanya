using Microsoft.AspNetCore.Identity;

/// <summary>
/// Represents an application user with additional custom properties.
/// Inherits from <see cref="IdentityUser"/>.
/// </summary>
/// Gets or sets the name of the user.
/// This is an optional custom field.

namespace TodoApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? Name { get; set; }  // Optional custom field
    }
}
