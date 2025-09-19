using Microsoft.AspNetCore.Identity;

namespace Chat.Api.Models;

public class ApplicationUser : IdentityUser
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}