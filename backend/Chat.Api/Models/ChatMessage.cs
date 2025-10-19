namespace Chat.Api.Models;

public class ChatMessage
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public string UserName { get; set; } = default!;
    public string Content { get; set; } = default!;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}