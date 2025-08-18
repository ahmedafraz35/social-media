-- SQL Server Management Studio Connection Script
-- Use this to connect to the correct database

-- Connection Details:
-- Server: (localdb)\mssqllocaldb
-- Database: SocialMediaDB

USE SocialMediaDB;

-- Check all tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- View all data
SELECT 'USERS DATA' as TableName;
SELECT * FROM Users;

SELECT 'POSTS DATA' as TableName;
SELECT * FROM Posts;

SELECT 'COMMENTS DATA' as TableName;
SELECT * FROM Comments;

SELECT 'LIKES DATA' as TableName;
SELECT * FROM Likes;

-- Count records
SELECT 
    'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL
SELECT 
    'Posts' as TableName, COUNT(*) as RecordCount FROM Posts
UNION ALL
SELECT 
    'Comments' as TableName, COUNT(*) as RecordCount FROM Comments
UNION ALL
SELECT 
    'Likes' as TableName, COUNT(*) as RecordCount FROM Likes;
