import { Component } from '@angular/core';
import { ClerkService } from '../core/clerk.service';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  dropdownOpen = false;

  constructor(private clerkService: ClerkService) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  async logout() {
    await this.clerkService.signOut();
  }
}
