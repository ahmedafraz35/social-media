import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

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

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Helper method to get current user ID
  private getCurrentUserId(): number {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id || 1; // Fallback to 1 for demo purposes
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

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
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() });
  }

  getUser(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/users/${userId}`, { headers: this.getAuthHeaders() });
  }

  // Post methods
  createPost(caption: string, image?: File): Observable<PostResponse> {
    const formData = new FormData();
    formData.append('userId', this.getCurrentUserId().toString());
    formData.append('caption', caption);
    if (image) {
      formData.append('image', image);
    }
    
    return this.http.post<PostResponse>(`${this.baseUrl}/posts`, formData, { headers: this.getAuthHeaders() });
  }

  getAllPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.baseUrl}/posts`, { headers: this.getAuthHeaders() });
  }

  getUserPosts(userId: number): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.baseUrl}/posts/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  likePost(postId: number): Observable<{ likesCount: number }> {
    return this.http.post<{ likesCount: number }>(`${this.baseUrl}/posts/${postId}/like`, {
      userId: this.getCurrentUserId()
    }, { headers: this.getAuthHeaders() });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}`, { headers: this.getAuthHeaders() });
  }

  // Comment methods
  createComment(postId: number, text: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.baseUrl}/comments`, {
      postId,
      text,
      userId: this.getCurrentUserId()
    }, { headers: this.getAuthHeaders() });
  }

  getPostComments(postId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.baseUrl}/comments/post/${postId}`, { headers: this.getAuthHeaders() });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/comments/${commentId}?userId=${this.getCurrentUserId()}`, { headers: this.getAuthHeaders() });
  }
}
