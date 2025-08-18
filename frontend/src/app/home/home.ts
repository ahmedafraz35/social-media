import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialMediaService, PostResponse, CommentResponse } from '../services/social-media.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIf, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  dropdownOpen = false;
  posts: PostResponse[] = [];
  profileImage: string = '';
  newPostText: string = '';
  newPostImageFile: File | null = null;
  commentTexts: { [key: number]: string } = {};
  currentUserId: number = 1; // Fixed user ID for demo

  constructor(
    private socialMediaService: SocialMediaService
  ) {}

  async ngOnInit() {
    this.loadPosts();
    this.loadProfileImage();
  }

  loadPosts() {
    this.socialMediaService.getAllPosts().subscribe({
      next: (posts: PostResponse[]) => {
        this.posts = posts.map(post => ({
          ...post,
          showCommentBox: false,
          // Map API response to template expectations
          imageUrl: post.imagePath ? `http://localhost:5036${post.imagePath}` : undefined,
          likes: post.likesCount,
          text: post.caption,
          user: {
            id: post.userId,
            username: post.username,
            profileImageUrl: undefined
          },
          comments: [],
          createdAt: post.postedAt
        }));
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.posts = [];
      }
    });
  }

  loadProfileImage() {
    this.profileImage = localStorage.getItem('profileImage') || 'https://randomuser.me/api/portraits/men/32.jpg';
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    // Simple logout for demo
    window.location.reload();
  }

  onPostImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newPostImageFile = file;
    }
  }

  uploadPost() {
    if (!this.newPostText.trim() && !this.newPostImageFile) return;
    
    this.socialMediaService.createPost(
      this.newPostText,
      this.newPostImageFile || undefined
    ).subscribe({
      next: (post) => {
        // Map API response to template expectations
        const mappedPost = {
          ...post,
          showCommentBox: false,
          imageUrl: post.imagePath ? `http://localhost:5036${post.imagePath}` : undefined,
          likes: post.likesCount,
          text: post.caption,
          user: {
            id: post.userId,
            username: post.username,
            profileImageUrl: undefined
          },
          comments: [],
          createdAt: post.postedAt
        };
        this.posts.unshift(mappedPost);
        this.newPostText = '';
        this.newPostImageFile = null;
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        console.error('Error creating post:', error);
      }
    });
  }

  likePost(post: any) {
    this.socialMediaService.likePost(post.id).subscribe({
      next: (response) => {
        post.likes = response.likesCount;
        post.likesCount = response.likesCount;
      },
      error: (error: any) => {
        console.error('Error liking post:', error);
        // Fallback to local increment
        post.likes = (post.likes || 0) + 1;
      }
    });
  }

  toggleCommentBox(post: any) {
    post.showCommentBox = !post.showCommentBox;
    
    // Load comments if showing comment box and comments not loaded yet
    if (post.showCommentBox && (!post.comments || post.comments.length === 0)) {
      this.loadPostComments(post.id);
    }
  }

  loadPostComments(postId: number) {
    this.socialMediaService.getPostComments(postId).subscribe({
      next: (comments: CommentResponse[]) => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments = comments.map(comment => ({
            ...comment,
            user: {
              id: comment.userId,
              username: comment.username,
              profileImageUrl: undefined
            }
          }));
        }
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
      }
    });
  }

  uploadComment(post: any) {
    const commentText = this.commentTexts[post.id];
    if (!commentText?.trim()) return;
    
    this.socialMediaService.createComment(post.id, commentText).subscribe({
      next: (comment: CommentResponse) => {
        if (!post.comments) {
          post.comments = [];
        }
        const mappedComment = {
          ...comment,
          user: {
            id: comment.userId,
            username: comment.username,
            profileImageUrl: undefined
          }
        };
        post.comments.push(mappedComment);
        this.commentTexts[post.id] = '';
      },
      error: (error: any) => {
        console.error('Error creating comment:', error);
      }
    });
  }
}
