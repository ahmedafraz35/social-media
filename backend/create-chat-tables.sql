-- Create Chat Tables Script
-- Run this in SQL Server Management Studio or execute via .NET

-- Create Chats table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Chats' AND xtype='U')
BEGIN
    CREATE TABLE [Chats] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [SenderId] int NOT NULL,
        [ReceiverId] int NOT NULL,
        [Message] nvarchar(1000) NOT NULL,
        [SentAt] datetime2 NOT NULL,
        [IsRead] bit NOT NULL DEFAULT 0,
        CONSTRAINT [PK_Chats] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Chats_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([Id]),
        CONSTRAINT [FK_Chats_Users_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [Users] ([Id])
    );
END

-- Create ChatRooms table
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
    
    -- Create unique index to prevent duplicate chat rooms
    CREATE UNIQUE INDEX [IX_ChatRooms_User1Id_User2Id] ON [ChatRooms] ([User1Id], [User2Id]);
END

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Chats_SenderId_ReceiverId')
BEGIN
    CREATE INDEX [IX_Chats_SenderId_ReceiverId] ON [Chats] ([SenderId], [ReceiverId]);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Chats_SentAt')
BEGIN
    CREATE INDEX [IX_Chats_SentAt] ON [Chats] ([SentAt]);
END

PRINT 'Chat tables created successfully!';
