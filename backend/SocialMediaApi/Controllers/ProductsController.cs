using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaApi.Data;
using SocialMediaApi.DTOs;
using SocialMediaApi.Models;

namespace SocialMediaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] CreateProductDto dto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
                if (user == null) 
                    return BadRequest(new { success = false, message = "User not found" });

                string? imagePath = null;
                if (dto.Image != null)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    Directory.CreateDirectory(uploadsFolder);

                    var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(stream);
                    }

                    imagePath = $"/uploads/{fileName}";
                }

                var product = new Product
                {
                    UserId = dto.UserId,
                    Title = dto.Title,
                    Description = dto.Description,
                    Price = dto.Price,
                    ImagePath = imagePath
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok(new ProductDto
                {
                    Id = product.Id,
                    UserId = product.UserId,
                    Title = product.Title,
                    Description = product.Description,
                    Price = product.Price,
                    ImagePath = product.ImagePath,
                    CreatedAt = product.CreatedAt,
                    Username = user.Username
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error creating product", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductDto>>> GetAllProducts()
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.User)
                    .Where(p => p.IsActive)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                var list = products.Select(p => new ProductDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    ImagePath = p.ImagePath,
                    CreatedAt = p.CreatedAt,
                    Username = p.User?.Username ?? string.Empty
                }).ToList();

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching products", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<ProductDto>>> GetUserProducts(int userId)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null) 
                    return NotFound(new { success = false, message = "User not found" });

                var products = await _context.Products
                    .Where(p => p.UserId == userId && p.IsActive)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                var list = products.Select(p => new ProductDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    ImagePath = p.ImagePath,
                    CreatedAt = p.CreatedAt,
                    Username = user.Username
                }).ToList();

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching user products", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
                if (product == null) 
                    return NotFound(new { success = false, message = "Product not found" });

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                
                return Ok(new { success = true, message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error deleting product", error = ex.Message });
            }
        }
    }
}
