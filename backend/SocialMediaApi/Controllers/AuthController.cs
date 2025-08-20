using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaApi.Data;
using SocialMediaApi.Models;
using SocialMediaApi.DTOs;
using System.Security.Cryptography;
using System.Text;

namespace SocialMediaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupDto signupDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == signupDto.Email || u.Username == signupDto.Username);

                if (existingUser != null)
                {
                    return BadRequest(new { success = false, message = "User with this email or username already exists" });
                }

                // Hash password
                string passwordHash = HashPassword(signupDto.Password);

                // Create new user
                var user = new User
                {
                    Username = signupDto.Username,
                    Email = signupDto.Email,
                    PasswordHash = passwordHash
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "User created successfully",
                    user = new {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred during signup" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Find user by email
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                {
                    return BadRequest(new { success = false, message = "Invalid email or password" });
                }

                // Verify password
                if (!VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return BadRequest(new { success = false, message = "Invalid email or password" });
                }

                return Ok(new { 
                    success = true, 
                    message = "Login successful",
                    user = new {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        profileImage = user.ProfileImage
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred during login" });
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == hash;
        }
    }
}
