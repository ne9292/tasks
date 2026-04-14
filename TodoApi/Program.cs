using Microsoft.EntityFrameworkCore;
using TodoApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// הגדרת מפתח סודי (חייב להיות לפחות 32 תווים!)
var secretKey = "ThisIsAVerySecretKey12345678901234567890";
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

// --- 1. הגדרת CORS (חובה כדי שהקליינט יוכל להתחבר) ---
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// --- 2. הגדרת אימות (JWT) ---
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

// --- 3. Middleware (הסדר כאן קריטי!) ---
app.UseSwagger(); 
app.UseSwaggerUI();

app.UseCors(); // חייב לבוא לפני Authentication
app.UseAuthentication();
app.UseAuthorization();

// נתיב השורש - מעביר אוטומטית ל-Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

// --- 4. נתיבי API ---

// הרשמה
app.MapPost("/api/register", async (User user, ToDoDbContext db) => {
    if (await db.Users.AnyAsync(u => u.Username == user.Username))
        return Results.BadRequest("Username exists.");
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/api/users/{user.Id}", user);
});

// התחברות
app.MapPost("/api/login", (User user, ToDoDbContext db) => {
    var loginUser = db.Users.FirstOrDefault(u => u.Username == user.Username && u.Password == user.Password);
    if (loginUser == null) return Results.Unauthorized();
    
    var jwt = CreateJWT(loginUser, keyBytes);
    return Results.Ok(new { token = jwt });
});

// קבלת משימות (רק של המשתמש המחובר)
app.MapGet("/api/items", async (ToDoDbContext db, ClaimsPrincipal user) => {
    var userIdClaim = user.FindFirst("id")?.Value;
    if (userIdClaim == null) return Results.Unauthorized();
    var userId = int.Parse(userIdClaim);
    return Results.Ok(await db.Items.Where(i => i.UserId == userId).ToListAsync());
}).RequireAuthorization();

// הוספת משימה
app.MapPost("/api/items", async (ToDoDbContext db, Item item, ClaimsPrincipal user) => {
    var userIdClaim = user.FindFirst("id")?.Value;
    if (userIdClaim == null) return Results.Unauthorized();
    
    item.UserId = int.Parse(userIdClaim);
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/items/{item.Id}", item);
}).RequireAuthorization();

// עדכון משימה
app.MapPut("/api/items/{id}", async (int id, Item inputItem, ToDoDbContext db) => {
    var todo = await db.Items.FindAsync(id);
    if (todo is null) return Results.NotFound();
    
    todo.Name = inputItem.Name;
    todo.IsComplete = inputItem.IsComplete;
    
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// מחיקת משימה
app.MapDelete("/api/items/{id}", async (int id, ToDoDbContext db) => {
    var todo = await db.Items.FindAsync(id);
    if (todo is null) return Results.NotFound();
    
    db.Items.Remove(todo);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// פונקציה ליצירת JWT
string CreateJWT(User user, byte[] key) {
    var claims = new[] { 
        new Claim("id", user.Id.ToString()), 
        new Claim("name", user.Username) 
    };
    var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken("my-api", "my-api", claims, expires: DateTime.Now.AddDays(7), signingCredentials: credentials);
    return new JwtSecurityTokenHandler().WriteToken(token);
}

app.Run();