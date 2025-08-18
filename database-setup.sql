-- Social Media Database Setup for SQL Server
-- Run this script in SQL Server Management Studio

-- Create Database (if it doesn't exist)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SocialMediaDB')
BEGIN
    CREATE DATABASE SocialMediaDB
END
GO

USE SocialMediaDB
GO

-- Create Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ClerkUserId NVARCHAR(100) UNIQUE NOT NULL, -- Clerk user ID for authentication
        Username NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(100),
        LastName NVARCHAR(100),
        ProfileImageUrl NVARCHAR(500),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    )
END
GO

-- Create Posts Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Posts' AND xtype='U')
BEGIN
    CREATE TABLE Posts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Caption NVARCHAR(MAX),
        ImageUrl NVARCHAR(500),
        LikesCount INT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    )
END
GO

-- Create Comments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' AND xtype='U')
BEGIN
    CREATE TABLE Comments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PostId INT NOT NULL,
        UserId INT NOT NULL,
        Text NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (PostId) REFERENCES Posts(Id) ON DELETE CASCADE,
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION
    )
END
GO

-- Create Likes Table (to track who liked which post)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Likes' AND xtype='U')
BEGIN
    CREATE TABLE Likes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PostId INT NOT NULL,
        UserId INT NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (PostId) REFERENCES Posts(Id) ON DELETE CASCADE,
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        UNIQUE(PostId, UserId) -- Prevent duplicate likes
    )
END
GO

-- Insert sample data (optional - remove if you don't want sample data)
-- Sample User
IF NOT EXISTS (SELECT * FROM Users WHERE ClerkUserId = 'sample_clerk_id')
BEGIN
    INSERT INTO Users (ClerkUserId, Username, Email, FirstName, LastName, ProfileImageUrl)
    VALUES ('sample_clerk_id', 'john_doe', 'john@example.com', 'John', 'Doe', 'https://randomuser.me/api/portraits/men/32.jpg')
END
GO

PRINT 'Database setup completed successfully!'
