using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaApi.Data;
using SocialMediaApi.DTOs;
using SocialMediaApi.Models;

namespace SocialMediaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<PostDto>> CreatePost([FromForm] CreatePostDto createPostDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == createPostDto.UserId);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            string? imagePath = null;
            if (createPostDto.Image != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + Path.GetExtension(createPostDto.Image.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await createPostDto.Image.CopyToAsync(stream);
                }

                imagePath = $"/uploads/{fileName}";
            }

            var post = new Post
            {
                UserId = user.Id,
                Caption = createPostDto.Caption,
                ImagePath = imagePath
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            // Count likes for this post
            var likesCount = await _context.Likes.CountAsync(l => l.PostId == post.Id);

            return Ok(new PostDto
            {
                Id = post.Id,
                UserId = post.UserId,
                Caption = post.Caption,
                ImagePath = post.ImagePath,
                PostedAt = post.PostedAt,
                Username = user.Username,
                LikesCount = likesCount
            });
        }

        [HttpGet]
        public async Task<ActionResult<List<PostDto>>> GetPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .OrderByDescending(p => p.PostedAt)
                .ToListAsync();

            var postDtos = new List<PostDto>();
            
            foreach (var post in posts)
            {
                var likesCount = await _context.Likes.CountAsync(l => l.PostId == post.Id);
                
                postDtos.Add(new PostDto
                {
                    Id = post.Id,
                    UserId = post.UserId,
                    Caption = post.Caption,
                    ImagePath = post.ImagePath,
                    PostedAt = post.PostedAt,
                    Username = post.User.Username,
                    LikesCount = likesCount
                });
            }

            return Ok(postDtos);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<PostDto>>> GetUserPosts(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound();
            }

            var posts = await _context.Posts
                .Include(p => p.User)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.PostedAt)
                .ToListAsync();

            var postDtos = new List<PostDto>();
            
            foreach (var post in posts)
            {
                var likesCount = await _context.Likes.CountAsync(l => l.PostId == post.Id);
                
                postDtos.Add(new PostDto
                {
                    Id = post.Id,
                    UserId = post.UserId,
                    Caption = post.Caption,
                    ImagePath = post.ImagePath,
                    PostedAt = post.PostedAt,
                    Username = post.User.Username,
                    LikesCount = likesCount
                });
            }

            return Ok(postDtos);
        }

        [HttpPost("{id}/like")]
        public async Task<ActionResult> LikePost(int id, [FromBody] LikePostDto likePostDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == likePostDto.UserId);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound();
            }

            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.PostId == id && l.UserId == user.Id);

            if (existingLike != null)
            {
                // Unlike the post
                _context.Likes.Remove(existingLike);
            }
            else
            {
                // Like the post
                var like = new Like
                {
                    PostId = id,
                    UserId = user.Id
                };
                _context.Likes.Add(like);
            }

            await _context.SaveChangesAsync();
            
            var likesCount = await _context.Likes.CountAsync(l => l.PostId == id);
            return Ok(new { likesCount = likesCount });
        }

        [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePost(int id)
        {
            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound();
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
