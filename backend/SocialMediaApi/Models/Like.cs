using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialMediaApi.Models
{
    [Table("Likes")]
    public class Like
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PostId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        public DateTime LikedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Post Post { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
