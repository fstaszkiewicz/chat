namespace Chat.Api.DTOs;

public record RegisterRequest(string UserName, string Email, string Password);
public record LoginRequest(string UserNameOrEmail, string Password);
public record AuthResponse(string Token, string UserName, string UserId);
public record ChatMessageDto(int Id, string UserName, string Content, DateTime SentAt);