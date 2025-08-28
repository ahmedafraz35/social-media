-- Products table creation script for SQL Server
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
BEGIN
    CREATE TABLE [Products] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [UserId] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(2000) NULL,
        [Price] decimal(18,2) NULL,
        [ImagePath] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [IsActive] bit NOT NULL DEFAULT 1,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );

    CREATE INDEX [IX_Products_UserId] ON [Products] ([UserId]);
    CREATE INDEX [IX_Products_CreatedAt] ON [Products] ([CreatedAt]);
END

PRINT 'Products table created successfully';
