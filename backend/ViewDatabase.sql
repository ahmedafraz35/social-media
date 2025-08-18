-- ========================================
-- COMPLETE SQL QUERIES TO VIEW YOUR SOCIAL MEDIA DATABASE
-- ========================================

-- 1. CONNECT TO YOUR DATABASE
USE SocialMediaDB;

-- 2. LIST ALL DATABASES (to confirm SocialMediaDB exists)
SELECT name AS DatabaseName 
FROM sys.databases 
WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
ORDER BY name;

-- 3. LIST ALL TABLES IN YOUR DATABASE
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- 4. GET TABLE STRUCTURE AND COLUMN DETAILS
SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE,
    c.COLUMN_DEFAULT,
    c.CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;

-- 5. COUNT RECORDS IN ALL TABLES
SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM Users
UNION ALL
SELECT 'Posts' AS TableName, COUNT(*) AS RecordCount FROM Posts
UNION ALL
SELECT 'Comments' AS TableName, COUNT(*) AS RecordCount FROM Comments
UNION ALL
SELECT 'Likes' AS TableName, COUNT(*) AS RecordCount FROM Likes;

-- 6. VIEW ALL DATA FROM EACH TABLE

-- USERS TABLE
SELECT 'USERS TABLE DATA' AS Info;
SELECT 
    Id,
    ClerkUserId,
    Username,
    Email,
    FirstName,
    LastName,
    ProfileImageUrl,
    CreatedAt,
    UpdatedAt
FROM Users;

-- POSTS TABLE
SELECT 'POSTS TABLE DATA' AS Info;
SELECT 
    Id,
    UserId,
    Caption,
    ImageUrl,
    LikesCount,
    CreatedAt,
    UpdatedAt
FROM Posts
ORDER BY CreatedAt DESC;

-- COMMENTS TABLE
SELECT 'COMMENTS TABLE DATA' AS Info;
SELECT 
    c.Id,
    c.PostId,
    c.UserId,
    c.Text,
    c.CreatedAt,
    u.Username AS CommentedBy,
    p.Caption AS PostCaption
FROM Comments c
LEFT JOIN Users u ON c.UserId = u.Id
LEFT JOIN Posts p ON c.PostId = p.Id
ORDER BY c.CreatedAt DESC;

-- LIKES TABLE
SELECT 'LIKES TABLE DATA' AS Info;
SELECT 
    l.Id,
    l.PostId,
    l.UserId,
    l.CreatedAt,
    u.Username AS LikedBy,
    p.Caption AS PostCaption
FROM Likes l
LEFT JOIN Users u ON l.UserId = u.Id
LEFT JOIN Posts p ON l.PostId = p.Id
ORDER BY l.CreatedAt DESC;

-- 7. DETAILED VIEW WITH RELATIONSHIPS
SELECT 'POSTS WITH USER AND LIKE COUNT' AS Info;
SELECT 
    p.Id AS PostId,
    p.Caption,
    u.Username AS PostedBy,
    p.LikesCount,
    p.CreatedAt AS PostedAt,
    p.ImageUrl
FROM Posts p
INNER JOIN Users u ON p.UserId = u.Id
ORDER BY p.CreatedAt DESC;

-- 8. VIEW FOREIGN KEY RELATIONSHIPS
SELECT 
    OBJECT_NAME(f.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME (f.referenced_object_id) AS ReferencedTableName,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc ON f.OBJECT_ID = fc.constraint_object_id
ORDER BY TableName;

-- 9. CHECK DATABASE SIZE
SELECT 
    DB_NAME() AS DatabaseName,
    SUM(size * 8.0 / 1024) AS DatabaseSizeMB
FROM sys.database_files;

-- 10. SIMPLE QUERY TO VERIFY EVERYTHING IS WORKING
SELECT 'DATABASE VERIFICATION COMPLETE' AS Status,
       (SELECT COUNT(*) FROM Users) AS Users,
       (SELECT COUNT(*) FROM Posts) AS Posts,
       (SELECT COUNT(*) FROM Comments) AS Comments,
       (SELECT COUNT(*) FROM Likes) AS Likes;
