import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SocialMediaService, PostResponse } from '../../services/social-media.service';
import { AuthService } from '../../auth/auth.service';
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
  currentUserId: number = 1;
  username: string = '';
  profileImage: string = '';

  constructor(
    private socialMediaService: SocialMediaService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Get current user from AuthService
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
      this.username = currentUser.username;
      this.profileImage = currentUser.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg';
    }
    this.loadUserPosts();
    this.loadProfileImage();
  }

  loadUserPosts() {
    this.socialMediaService.getUserPosts(this.currentUserId).subscribe({
      next: (posts) => {
        // Directly map posts, backend should only return user's posts
        this.userPosts = posts.map(post => ({
          ...post,
          imageUrl: post.imagePath,
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
          imageUrl: post.imagePath,
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

  isDeletingPost: boolean = false;
  deleteError: string = '';
  async deletePost(index: number) {
    this.isDeletingPost = true;
    this.deleteError = '';
    const post = this.userPosts[index];
    try {
      await this.socialMediaService.deletePost(post.id).toPromise();
      this.userPosts.splice(index, 1);
      // Notify home page to remove post if using shared service or event emitter
      if (window && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: post.id } }));
      }
    } catch (error: any) {
      this.deleteError = 'Error deleting post. Please try again.';
      console.error('Error deleting post:', error);
    } finally {
      this.isDeletingPost = false;
    }
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
