using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SocialMediaApi.Data;
using SocialMediaApi.Models;
using System.Collections.Concurrent;

namespace SocialMediaApi.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        private static readonly ConcurrentDictionary<string, int> _userConnections = new();

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        public async Task JoinChat(int userId)
        {
            _userConnections[Context.ConnectionId] = userId;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public async Task SendMessage(int receiverId, string message)
        {
            var senderId = _userConnections.GetValueOrDefault(Context.ConnectionId);
            if (senderId == 0) return;

            // Find or create chat room first
            var chatRoom = await FindOrCreateChatRoom(senderId, receiverId);

            // Save message to database
            var chat = new Chat
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message,
                SentAt = DateTime.UtcNow,
                IsRead = false,
                ChatRoomId = chatRoom.Id
            };

            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();

            // Get sender info
            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null) return;

            // Send message to receiver
            await Clients.Group($"User_{receiverId}").SendAsync("ReceiveMessage", new
            {
                id = chat.Id,
                senderId = senderId,
                senderName = sender.Username,
                message = message,
                sentAt = chat.SentAt,
                isRead = false
            });

            // Send confirmation to sender
            await Clients.Caller.SendAsync("MessageSent", new
            {
                id = chat.Id,
                receiverId = receiverId,
                message = message,
                sentAt = chat.SentAt
            });
        }

        public async Task MarkMessagesAsRead(int senderId)
        {
            var receiverId = _userConnections.GetValueOrDefault(Context.ConnectionId);
            if (receiverId == 0) return;

            var unreadMessages = await _context.Chats
                .Where(c => c.SenderId == senderId && c.ReceiverId == receiverId && !c.IsRead)
                .ToListAsync();

            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }

            if (unreadMessages.Any())
            {
                await _context.SaveChangesAsync();
                
                // Notify sender that messages were read
                await Clients.Group($"User_{senderId}").SendAsync("MessagesRead", receiverId);
            }
        }

        private async Task<ChatRoom> FindOrCreateChatRoom(int user1Id, int user2Id)
        {
            var existingRoom = await _context.ChatRooms
                .FirstOrDefaultAsync(cr => 
                    (cr.User1Id == user1Id && cr.User2Id == user2Id) ||
                    (cr.User1Id == user2Id && cr.User2Id == user1Id));

            if (existingRoom != null)
            {
                existingRoom.LastMessageAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return existingRoom;
            }
            else
            {
                var newRoom = new ChatRoom
                {
                    User1Id = Math.Min(user1Id, user2Id),
                    User2Id = Math.Max(user1Id, user2Id),
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };
                _context.ChatRooms.Add(newRoom);
                await _context.SaveChangesAsync();
                return newRoom;
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _userConnections.TryRemove(Context.ConnectionId, out _);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
