using Microsoft.EntityFrameworkCore;
using SocialMediaApi.Data;

namespace SocialMediaApi.Services
{
    public class DatabaseInitializer
    {
        private readonly AppDbContext _context;

        public DatabaseInitializer(AppDbContext context)
        {
            _context = context;
        }

        public async Task InitializeChatTables()
        {
            try
            {
                // Create Chats table if it doesn't exist
                await _context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Chats' AND xtype='U')
                    BEGIN
                        CREATE TABLE [Chats] (
                            [Id] int IDENTITY(1,1) NOT NULL,
                            [SenderId] int NOT NULL,
                            [ReceiverId] int NOT NULL,
                            [Message] nvarchar(1000) NOT NULL,
                            [SentAt] datetime2 NOT NULL,
                            [IsRead] bit NOT NULL DEFAULT 0,
                            [ChatRoomId] int NULL,
                            CONSTRAINT [PK_Chats] PRIMARY KEY ([Id]),
                            CONSTRAINT [FK_Chats_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([Id]),
                            CONSTRAINT [FK_Chats_Users_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [Users] ([Id]),
                            CONSTRAINT [FK_Chats_ChatRooms_ChatRoomId] FOREIGN KEY ([ChatRoomId]) REFERENCES [ChatRooms] ([Id])
                        );
                    END
                    ELSE
                    BEGIN
                        -- Add ChatRoomId column if it doesn't exist
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[Chats]') AND name = 'ChatRoomId')
                        BEGIN
                            ALTER TABLE [Chats] ADD [ChatRoomId] int NULL;
                            ALTER TABLE [Chats] ADD CONSTRAINT [FK_Chats_ChatRooms_ChatRoomId] FOREIGN KEY ([ChatRoomId]) REFERENCES [ChatRooms] ([Id]);
                        END
                    END
                ");

                // Create ChatRooms table if it doesn't exist
                await _context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatRooms' AND xtype='U')
                    BEGIN
                        CREATE TABLE [ChatRooms] (
                            [Id] int IDENTITY(1,1) NOT NULL,
                            [User1Id] int NOT NULL,
                            [User2Id] int NOT NULL,
                            [CreatedAt] datetime2 NOT NULL,
                            [LastMessageAt] datetime2 NOT NULL,
                            CONSTRAINT [PK_ChatRooms] PRIMARY KEY ([Id]),
                            CONSTRAINT [FK_ChatRooms_Users_User1Id] FOREIGN KEY ([User1Id]) REFERENCES [Users] ([Id]),
                            CONSTRAINT [FK_ChatRooms_Users_User2Id] FOREIGN KEY ([User2Id]) REFERENCES [Users] ([Id])
                        );
                        
                        CREATE UNIQUE INDEX [IX_ChatRooms_User1Id_User2Id] ON [ChatRooms] ([User1Id], [User2Id]);
                    END
                ");

                // Create indexes for better performance
                await _context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Chats_SenderId_ReceiverId')
                    BEGIN
                        CREATE INDEX [IX_Chats_SenderId_ReceiverId] ON [Chats] ([SenderId], [ReceiverId]);
                    END
                ");

                await _context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Chats_SentAt')
                    BEGIN
                        CREATE INDEX [IX_Chats_SentAt] ON [Chats] ([SentAt]);
                    END
                ");

                await _context.Database.ExecuteSqlRawAsync(@"
                    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Chats_ChatRoomId')
                    BEGIN
                        CREATE INDEX [IX_Chats_ChatRoomId] ON [Chats] ([ChatRoomId]);
                    END
                ");

                Console.WriteLine("Chat tables initialized successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing chat tables: {ex.Message}");
            }
        }
    }
}
