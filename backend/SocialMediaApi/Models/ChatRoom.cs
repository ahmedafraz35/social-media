using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialMediaApi.Models
{
    [Table("ChatRooms")]
    public class ChatRoom
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int User1Id { get; set; }
        
        [Required]
        public int User2Id { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("User1Id")]
        public User User1 { get; set; } = null!;
        
        [ForeignKey("User2Id")]
        public User User2 { get; set; } = null!;
        
        public List<Chat> Messages { get; set; } = new List<Chat>();
    }
}
