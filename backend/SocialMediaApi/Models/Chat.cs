using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocialMediaApi.Models
{
    [Table("Chats")]
    public class Chat
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int SenderId { get; set; }
        
        [Required]
        public int ReceiverId { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        public int? ChatRoomId { get; set; }

        // Navigation properties
        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;
        
        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; } = null!;
        
        [ForeignKey("ChatRoomId")]
        public ChatRoom? ChatRoom { get; set; }
    }
}
