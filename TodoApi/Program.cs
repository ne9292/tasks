using Microsoft.EntityFrameworkCore;
using TodoApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// הגדרת מפתח סודי (חייב להיות לפחות 32 תווים!)
var secretKey = "ThisIsAVerySecretKey123456789012";
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "my-api",
            ValidAudience = "my-api",
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddDbContext<ToDoDbContext>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors(); 
app.UseAuthentication();
app.UseAuthorization();

// --- נתיבי API ---

app.MapPost("/register", async (User user, ToDoDbContext db) => {
    if (await db.Users.AnyAsync(u => u.Username == user.Username))
        return Results.BadRequest("Username exists.");
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/users/{user.Id}", user);
});

app.MapPost("/login", (User user, ToDoDbContext db) => {
    var loginUser = db.Users.FirstOrDefault(u => u.Username == user.Username && u.Password == user.Password);
    if (loginUser == null) return Results.Unauthorized();
    var jwt = CreateJWT(loginUser);
    return Results.Ok(new { token = jwt });
});

app.MapGet("/items", async (ToDoDbContext db, ClaimsPrincipal user) => {
    var userId = int.Parse(user.FindFirst("id")?.Value ?? "0");
    return Results.Ok(await db.Items.Where(i => i.UserId == userId).ToListAsync());
}).RequireAuthorization();

app.MapPost("/items", async (ToDoDbContext db, Item item, ClaimsPrincipal user) => {
    item.UserId = int.Parse(user.FindFirst("id")?.Value ?? "0");
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/items/{item.Id}", item);
}).RequireAuthorization();

app.MapPut("/items/{id}", async (int id, Item inputItem, ToDoDbContext db) => {
    var todo = await db.Items.FindAsync(id);
    if (todo is null) return Results.NotFound();
    todo.IsComplete = inputItem.IsComplete;
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.MapDelete("/items/{id}", async (int id, ToDoDbContext db) => {
    var todo = await db.Items.FindAsync(id);
    if (todo is null) return Results.NotFound();
    db.Items.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

string CreateJWT(User user) {
    var claims = new[] { new Claim("id", user.Id.ToString()), new Claim("name", user.Username) };
    var credentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken("my-api", "my-api", claims, expires: DateTime.Now.AddDays(7), signingCredentials: credentials);
    return new JwtSecurityTokenHandler().WriteToken(token);
}

if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.Run();