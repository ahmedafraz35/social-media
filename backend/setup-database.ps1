# PowerShell script to set up the Social Media API database

Write-Host "Setting up Social Media API Database..." -ForegroundColor Green

# Navigate to the project directory
Set-Location "C:\Users\MuhammadAtif14\Documents\social-media\backend\SocialMediaApi"

# Install Entity Framework Core tools if not already installed
Write-Host "Installing Entity Framework Core tools..." -ForegroundColor Yellow
dotnet tool install --global dotnet-ef

# Add initial migration
Write-Host "Creating initial database migration..." -ForegroundColor Yellow
dotnet ef migrations add InitialCreate

# Update database
Write-Host "Updating database..." -ForegroundColor Yellow
dotnet ef database update

Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "You can now run the API using: dotnet run" -ForegroundColor Cyan
