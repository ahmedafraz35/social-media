using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialMediaApi.Models
{
    [Table("Comments")]
    public class Comment
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PostId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public string Text { get; set; } = string.Empty;
        
        public DateTime CommentedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Post Post { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
