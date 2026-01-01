using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Data;
using MovieTicketingAPI.Models;
using System.Security.Cryptography;
using System.Text;

namespace MovieTicketingAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        // POST: api/auth/signup
        [HttpPost("signup")]
        public async Task<ActionResult<UserResponse>> Signup([FromBody] AuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var existingUser = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existingUser != null)
            {
                return BadRequest(new { message = "User already exists" });
            }

            var user = new User
            {
                Name = "",
                Email = request.Email.ToLower(),
                PasswordHash = HashPassword(request.Password),
                PreferredLocation = "",
                PreferredLanguage = ""
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new UserResponse { Id = user.Id, Email = user.Email });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UserResponse>> Login([FromBody] AuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            return Ok(new UserResponse { Id = user.Id, Email = user.Email });
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }

    public class AuthRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class UserResponse
    {
        public int Id { get; set; }
        public string Email { get; set; } = "";
    }
}
