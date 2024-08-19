using BlogVaultApi.Models;
using BlogVaultApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlogVaultApi.Services;

namespace BlogVaultAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController: ControllerBase
    {
        private readonly BlogContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsersController(BlogContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("CreateUser")]
        public async Task<IActionResult> CreateUser([FromBody] UserDTO userDto)
        {
            if (string.IsNullOrWhiteSpace(userDto.Name))
            {
                return BadRequest("Name is required.");
            }

            if (string.IsNullOrWhiteSpace(userDto.Username))
            {
                return BadRequest("Username is required.");
            }

            if (string.IsNullOrWhiteSpace(userDto.Password))
            {
                return BadRequest("Password is required.");
            }

            // Check if the username already exists
            if (await _context.Users.AnyAsync(u => u.Username == userDto.Username))
            {
                return BadRequest("Username is already taken.");
            }

            // Create a new User entity
            var newUser = new User
            {
                UserId = new Guid(),
                Name = userDto.Name,
                Username = userDto.Username,
                Password = SHAService.ComputeSha256Hash(userDto.Password) // Consider hashing the password before storing it
            };

            // Add the user to the database
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok("User account created successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Username or Password cannot be empty.");
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == request.Username);

            var storedPassword = SHAService.ComputeSha256Hash(request.Password);

            if (user == null || user.Password != storedPassword)
            {
                return Unauthorized("Invalid username or password.");
            }

            _httpContextAccessor?.HttpContext?.Session.SetString("UserId", user.UserId.ToString());
            Console.WriteLine(user.UserId.ToString());
            Console.WriteLine(_httpContextAccessor?.HttpContext?.Session.GetString("UserId"));
            //_httpContextAccessor?.HttpContext?.Session.SetString("Username", user.Username);
            
            return Ok(new { message = "Login successful", userId = user.UserId });
        }

        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            // Clear all session data
            _httpContextAccessor?.HttpContext?.Session.Clear();

            // Optionally, you can redirect to the login page
            return Ok("Logged out successfully.");
        }

        [HttpGet("CheckSession")]
        public IActionResult CheckSession()
        {
            // Check if the session contains the "UserId" key
            if (_httpContextAccessor?.HttpContext?.Session.GetString("UserId") != null)
            {
                return Ok(new { sessionValid = true, message = "User is logged in." });
            }
            else
            {
                return Ok(new { sessionValid = false, message = "User is not logged in." });
            }
        }

    }
}
