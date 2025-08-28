import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SocialMediaService, PostResponse, ProductDto } from '../../services/social-media.service';
import { StoryService, Story } from '../../services/story.service';
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
  newStoryImageFile: File | null = null;
  newStoryCaption: string = '';
  newProductTitle: string = '';
  newProductDescription: string = '';
  newProductPrice?: number;
  newProductImageFile: File | null = null;
  userProducts: ProductDto[] = [];
  editIndex: number | null = null;
  editPostText: string = '';
  profileImageFile: File | null = null;
  currentUserId: number = 1; // Fixed user ID for demo
  username: string = 'Test User';
  profileImage: string = '';
  email: string = '';
  password?: string;
  showPassword: boolean = false;
  userStories: Story[] = [];

  constructor(
    private socialMediaService: SocialMediaService,
    private storyService: StoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Load current user details from AuthService if available
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.currentUserId = currentUser.id || this.currentUserId;
        this.username = currentUser.username || this.username;
        this.profileImage = currentUser.profileImage || this.profileImage;
        this.email = currentUser.email || '';
        if (currentUser.password) this.password = currentUser.password; // only if intentionally stored
      }
    } catch (e) {
      console.warn('Could not load current user from AuthService', e);
    }

    this.loadUserPosts();
    this.loadProfileImage();
    this.loadUserStories();
    this.loadUserProducts();
  }

  loadUserStories() {
    try {
      this.userStories = this.storyService.getStoriesByUser(this.currentUserId);
    } catch (e) {
      console.error('Error loading user stories', e);
      this.userStories = [];
    }
  }

  deleteStory(storyId: string) {
    const confirmed = window.confirm('Delete this story? This cannot be undone.');
    if (!confirmed) return;
    const ok = this.storyService.deleteStoryById(storyId);
    if (ok) {
      // Refresh local list
      this.loadUserStories();
      // notify Home to reload stories
      if (window && (window as any).dispatchEvent) {
        window.dispatchEvent(new CustomEvent('storiesUpdated', { detail: { deletedId: storyId } }));
      }
    }
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

  onStoryImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newStoryImageFile = file;
    }
  }

  addStory() {
    if (!this.newStoryImageFile) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const dataUrl = e.target.result as string;
      const story: Story = {
        id: `story_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
        userId: this.currentUserId,
        username: this.username,
        profileImage: this.profileImage,
        imageUrl: dataUrl,
        createdAt: new Date().toISOString()
      };
      this.storyService.addStory(story);
      // Dispatch a window event so Home can refresh stories
      if (window && (window as any).dispatchEvent) {
        const ev = new CustomEvent('storiesUpdated', { detail: { story } });
        window.dispatchEvent(ev);
      }

      // clear form
      this.newStoryCaption = '';
      this.newStoryImageFile = null;
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    };
    reader.readAsDataURL(this.newStoryImageFile!);
  }

  loadUserProducts() {
    this.socialMediaService.getUserProducts(this.currentUserId).subscribe({
      next: (products) => {
        this.userProducts = products.map(p => ({
          ...p,
          imagePath: p.imagePath ? `http://localhost:5036${p.imagePath}` : undefined
        }));
      },
      error: (error) => {
        console.error('Error loading user products:', error);
        this.userProducts = [];
      }
    });
  }

  onProductImageChange(event: any) {
    const file = event.target.files[0];
    if (file) this.newProductImageFile = file;
  }

  addProduct() {
    if (!this.newProductTitle.trim()) {
      console.log('Product title is required');
      return;
    }

    console.log('Creating product:', {
      title: this.newProductTitle,
      description: this.newProductDescription,
      price: this.newProductPrice,
      hasImage: !!this.newProductImageFile
    });

    this.socialMediaService.createProduct(
      this.newProductTitle,
      this.newProductDescription,
      this.newProductPrice,
      this.newProductImageFile || undefined
    ).subscribe({
      next: (product) => {
        console.log('Product created successfully:', product);
        this.loadUserProducts();
        this.newProductTitle = '';
        this.newProductDescription = '';
        this.newProductPrice = undefined;
        this.newProductImageFile = null;
        
        if (window && (window as any).dispatchEvent) {
          window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { product } }));
        }
      },
      error: (error) => {
        console.error('Error creating product:', error);
      }
    });
  }

  startDeal(product: ProductDto) {
    this.router.navigate(['/chat'], { queryParams: { with: product.userId } });
  }

  deleteUserProduct(productId: number) {
    const confirmed = window.confirm('Delete this product? This cannot be undone.');
    if (!confirmed) return;

    this.socialMediaService.deleteProduct(productId).subscribe({
      next: () => {
        this.loadUserProducts();
        if (window && (window as any).dispatchEvent) {
          window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { deletedId: productId } }));
        }
      },
      error: (error) => {
        console.error('Error deleting product:', error);
      }
    });
  }
}
