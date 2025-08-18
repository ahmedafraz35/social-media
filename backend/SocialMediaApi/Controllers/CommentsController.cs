using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaApi.Data;
using SocialMediaApi.DTOs;
using SocialMediaApi.Models;

namespace SocialMediaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<CommentDto>> CreateComment(CreateCommentDto createCommentDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == createCommentDto.UserId);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == createCommentDto.PostId);

            if (post == null)
            {
                return BadRequest("Post not found");
            }

            var comment = new Comment
            {
                PostId = createCommentDto.PostId,
                UserId = user.Id,
                Text = createCommentDto.Text
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new CommentDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                UserId = comment.UserId,
                Text = comment.Text,
                CommentedAt = comment.CommentedAt,
                Username = user.Username
            });
        }

        [HttpGet("post/{postId}")]
        public async Task<ActionResult<List<CommentDto>>> GetPostComments(int postId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.PostId == postId)
                .OrderBy(c => c.CommentedAt)
                .ToListAsync();

            var commentDtos = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                UserId = c.UserId,
                Text = c.Text,
                CommentedAt = c.CommentedAt,
                Username = c.User.Username
            }).ToList();

            return Ok(commentDtos);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteComment(int id, [FromQuery] int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (comment == null)
            {
                return NotFound();
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
