import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SocialMediaService, PostResponse } from '../../services/social-media.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, HttpClientModule]
})
export class Profile implements OnInit {
  userPosts: PostResponse[] = [];
  newPostText: string = '';
  newPostImageFile: File | null = null;
  editIndex: number | null = null;
  editPostText: string = '';
  profileImageFile: File | null = null;
  currentUserId: number = 1; // Fixed user ID for demo
  username: string = 'Test User';
  profileImage: string = '';

  constructor(
    private socialMediaService: SocialMediaService
  ) {}

  async ngOnInit() {
    this.loadUserPosts();
    this.loadProfileImage();
  }

  loadUserPosts() {
    this.socialMediaService.getUserPosts(this.currentUserId).subscribe({
      next: (posts) => {
        this.userPosts = posts.map(post => ({
          ...post,
          imageUrl: post.imagePath ? `http://localhost:5036${post.imagePath}` : undefined,
          likes: post.likesCount,
          text: post.caption,
          user: {
            id: post.userId,
            username: post.username,
            profileImageUrl: undefined
          },
          createdAt: post.postedAt
        }));
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.userPosts = [];
      }
    });
  }

  logout() {
    // Simple logout for demo
    window.location.reload();
  }

  addPost() {
    if (!this.newPostText.trim() && !this.newPostImageFile) return;
    
    this.socialMediaService.createPost(
      this.newPostText,
      this.newPostImageFile || undefined
    ).subscribe({
      next: (post) => {
        const mappedPost = {
          ...post,
          imageUrl: post.imagePath ? `http://localhost:5036${post.imagePath}` : undefined,
          likes: post.likesCount,
          text: post.caption,
          user: {
            id: post.userId,
            username: post.username,
            profileImageUrl: undefined
          },
          createdAt: post.postedAt
        };
        this.userPosts.unshift(mappedPost);
        this.newPostText = '';
        this.newPostImageFile = null;
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error: any) => {
        console.error('Error creating post:', error);
      }
    });
  }

  onPostImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newPostImageFile = file;
    }
  }

  editPost(index: number) {
    this.editIndex = index;
    this.editPostText = this.userPosts[index].caption;
  }

  saveEditPost(index: number) {
    // For now, we'll just update locally
    // You can implement backend edit functionality later
    this.userPosts[index].caption = this.editPostText;
    this.editIndex = null;
    this.editPostText = '';
  }

  cancelEditPost() {
    this.editIndex = null;
    this.editPostText = '';
  }

  deletePost(index: number) {
    const post = this.userPosts[index];
    this.socialMediaService.deletePost(post.id).subscribe({
      next: () => {
        this.userPosts.splice(index, 1);
      },
      error: (error: any) => {
        console.error('Error deleting post:', error);
      }
    });
  }

  loadProfileImage() {
    this.profileImage = localStorage.getItem('profileImage') || 'https://randomuser.me/api/portraits/men/32.jpg';
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImageFile = file;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        localStorage.setItem('profileImage', this.profileImage);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfileImage() {
    if (this.profileImageFile) {
      // For demo purposes, just update the preview
      console.log('Profile image would be uploaded to backend');
      this.profileImageFile = null;
      // Clear the file input
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]:last-of-type') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }
}
