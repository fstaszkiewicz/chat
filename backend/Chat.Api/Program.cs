using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Chat.Api.Data;
using Chat.Api.DTOs;
using Chat.Api.Hubs;
using Chat.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

var connString = config.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=chatdb;Username=chat;Password=chatpw";

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connString));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(opt =>
    {
        opt.Password.RequireNonAlphanumeric = false;
        opt.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var jwtKey = config["Jwt:Key"] ?? "DevSecretKeyChangeInProduction123!";
var jwtIssuer = config["Jwt:Issuer"] ?? "chat-app";
var jwtAudience = config["Jwt:Audience"] ?? "chat-app";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o =>
{
    o.TokenValidationParameters = new()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ClockSkew = TimeSpan.Zero
    };
    o.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            var accessToken = ctx.Request.Query["access_token"];
            var path = ctx.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
            {
                ctx.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddSignalR();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
    {
        p.WithOrigins(config["FrontendUrl"] ?? "http://localhost:5173")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/auth/register", async (RegisterRequest req, UserManager<ApplicationUser> userManager) =>
{
    var user = new ApplicationUser { UserName = req.UserName, Email = req.Email };
    var result = await userManager.CreateAsync(user, req.Password);
    if (!result.Succeeded) return Results.BadRequest(result.Errors);
    return Results.Ok();
});

app.MapPost("/api/auth/login", async (LoginRequest req, UserManager<ApplicationUser> userManager) =>
{
    ApplicationUser? user = await userManager.FindByNameAsync(req.UserNameOrEmail)
        ?? await userManager.FindByEmailAsync(req.UserNameOrEmail);
    if (user is null) return Results.Unauthorized();
    if (!await userManager.CheckPasswordAsync(user, req.Password)) return Results.Unauthorized();

    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id),
        new(JwtRegisteredClaimNames.UniqueName, user.UserName!),
        new("uid", user.Id)
    };

    var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(12),
        signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
    return Results.Ok(new AuthResponse(tokenString, user.UserName!, user.Id));
});

app.MapGet("/api/messages", async (AppDbContext db) =>
{
    var messages = await db.ChatMessages
        .OrderByDescending(m => m.SentAt)
        .Take(50)
        .OrderBy(m => m.SentAt)
        .Select(m => new ChatMessageDto(m.Id, m.UserName, m.Content, m.SentAt))
        .ToListAsync();
    return Results.Ok(messages);
});

app.MapHub<ChatHub>("/hubs/chat");

app.Run();