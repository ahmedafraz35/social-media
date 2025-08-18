# Social Media Application - Backend Setup

This is a complete .NET Web API backend for your Angular social media application with SQL Server database integration.

## Prerequisites

- Visual Studio 2022
- SQL Server Management Studio 20
- .NET 8.0 SDK
- Entity Framework Core Tools

## Project Structure

```
backend/
├── SocialMediaApi/
│   ├── Controllers/
│   │   ├── UsersController.cs
│   │   ├── PostsController.cs
│   │   └── CommentsController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Post.cs
│   │   ├── Comment.cs
│   │   └── Like.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── DTOs/
│   │   └── ApiDtos.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── SocialMediaApi.csproj
└── setup-database.ps1
```

## Database Setup

### Option 1: Using PowerShell Script
1. Open PowerShell as Administrator
2. Navigate to the backend directory
3. Run: `.\setup-database.ps1`

### Option 2: Manual Setup
1. Open terminal in the `SocialMediaApi` directory
2. Install EF Core tools: `dotnet tool install --global dotnet-ef`
3. Add migration: `dotnet ef migrations add InitialCreate`
4. Update database: `dotnet ef database update`

## Configuration

The `appsettings.json` is already configured with:
- SQL Server connection string (LocalDB)
- CORS settings for Angular development server
- Static file serving for uploaded images

## Database Schema

### Tables Created:
- **Users**: Stores user information from Clerk authentication
- **Posts**: User posts with captions and optional images
- **Comments**: Comments on posts
- **Likes**: Post likes (with user tracking)

### Relationships:
- User → Posts (One-to-Many)
- User → Comments (One-to-Many)
- User → Likes (One-to-Many)
- Post → Comments (One-to-Many)
- Post → Likes (One-to-Many)

## API Endpoints

### Users
- `POST /api/users/register` - Register Clerk user in database
- `GET /api/users/{clerkUserId}` - Get user details
- `POST /api/users/update-profile-image` - Upload profile image

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/user/{clerkUserId}` - Get user's posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/{id}` - Delete post

### Comments
- `GET /api/comments/post/{postId}` - Get post comments
- `POST /api/comments` - Create comment

### Likes
- `POST /api/posts/{postId}/like` - Like/unlike post

## Running the Application

1. Open the solution in Visual Studio 2022
2. Set `SocialMediaApi` as startup project
3. Ensure SQL Server is running
4. Press F5 or run `dotnet run`
5. API will be available at `https://localhost:7092`

## File Upload

- Profile images and post images are stored in `wwwroot/uploads/`
- Static files are served at `/uploads/` endpoint
- Supported formats: jpg, jpeg, png, gif

## Integration with Angular

Your Angular frontend has been updated to use this backend API:
- `SocialMediaService` handles all HTTP requests
- Components updated to work with backend data
- Fallback to localStorage if backend is unavailable

## Next Steps

1. Run the database setup
2. Start the .NET API
3. Start your Angular development server
4. Test the full-stack integration

## Troubleshooting

- If database connection fails, check SQL Server service is running
- If CORS errors occur, verify Angular runs on `http://localhost:4200`
- For file upload issues, ensure `wwwroot/uploads` directory exists

## Security Notes

- Clerk integration maps external user IDs to internal database IDs
- CORS is configured for development - update for production
- File upload validation is basic - enhance for production use
