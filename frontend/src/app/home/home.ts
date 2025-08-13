import { Component } from '@angular/core';
import { ClerkService } from '../core/clerk.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  constructor(private clerkService: ClerkService) {}

  async logout() {
    await this.clerkService.signOut();
  }
}
