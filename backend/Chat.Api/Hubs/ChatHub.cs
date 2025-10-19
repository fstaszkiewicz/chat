using Chat.Api.Data;
using Chat.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Chat.Api.Hubs;

[Authorize]
public class ChatHub(AppDbContext db) : Hub
{
    public async Task SendMessage(string message)
    {
        var userName = Context.User?.Identity?.Name ?? "Anon";
        var userId = Context.User?.Claims.FirstOrDefault(c => c.Type == "uid")?.Value ?? "0";

        var entity = new ChatMessage
        {
            Content = message,
            UserId = userId,
            UserName = userName,
            SentAt = DateTime.UtcNow
        };

        db.ChatMessages.Add(entity);
        await db.SaveChangesAsync();

        await Clients.All.SendAsync("ReceiveMessage", new
        {
            entity.Id,
            entity.UserName,
            entity.Content,
            entity.SentAt
        });
    }
}