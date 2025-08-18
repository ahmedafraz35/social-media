namespace SocialMediaApi.DTOs
{
    public class CreatePostDto
    {
        public int UserId { get; set; }
        public string Caption { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }

    public class PostDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Caption { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public DateTime PostedAt { get; set; }
        public string Username { get; set; } = string.Empty;
        public int LikesCount { get; set; }
    }

    public class PostResponseDto
    {
        public int Id { get; set; }
        public string Caption { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int LikesCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto User { get; set; } = null!;
        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CommentedAt { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class CreateCommentDto
    {
        public int PostId { get; set; }
        public int UserId { get; set; }
        public string Text { get; set; } = string.Empty;
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LikePostDto
    {
        public int UserId { get; set; }
    }
}
