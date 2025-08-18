import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostResponse {
  id: number;
  userId: number;
  caption: string;
  imagePath?: string;
  postedAt: string;
  username: string;
  likesCount: number;
  // Legacy support for old template
  text?: string;
  likes?: number;
  imageUrl?: string;
  showCommentBox?: boolean;
  createdAt?: string; // Added for template compatibility
  user: {
    id: number;
    username: string;
    profileImageUrl?: string;
  };
  comments?: CommentResponse[];
}

export interface CommentResponse {
  id: number;
  postId: number;
  userId: number;
  text: string;
  commentedAt: string;
  username: string;
  // Added for template compatibility
  user: {
    id: number;
    username: string;
    profileImageUrl?: string;
  };
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private baseUrl = 'http://localhost:5036/api'; // Update this to match your .NET API URL
  private currentUserId = 1; // For demo purposes, using a fixed user ID

  constructor(private http: HttpClient) {}

  // Helper method to construct full image URLs
  private getFullImageUrl(imagePath?: string): string | undefined {
    if (!imagePath) return undefined;
    return `http://localhost:5036${imagePath}`;
  }

  // User methods
  registerUser(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/users/register`, userData);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`);
  }

  getUser(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/users/${userId}`);
  }

  getCurrentUserId(): number {
    return this.currentUserId;
  }

  // Post methods
  createPost(caption: string, image?: File): Observable<PostResponse> {
    const formData = new FormData();
    formData.append('userId', this.currentUserId.toString());
    formData.append('caption', caption);
    if (image) {
      formData.append('image', image);
    }
    
    return this.http.post<PostResponse>(`${this.baseUrl}/posts`, formData);
  }

  getAllPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.baseUrl}/posts`);
  }

  getUserPosts(userId: number): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.baseUrl}/posts/user/${userId}`);
  }

  likePost(postId: number): Observable<{ likesCount: number }> {
    return this.http.post<{ likesCount: number }>(`${this.baseUrl}/posts/${postId}/like`, {
      userId: this.currentUserId
    });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}?userId=${this.currentUserId}`);
  }

  // Comment methods
  createComment(postId: number, text: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.baseUrl}/comments`, {
      postId,
      text,
      userId: this.currentUserId
    });
  }

  getPostComments(postId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.baseUrl}/comments/post/${postId}`);
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/comments/${commentId}?userId=${this.currentUserId}`);
  }
}
