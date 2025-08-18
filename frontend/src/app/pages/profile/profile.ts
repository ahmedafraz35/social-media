
import { Component, OnInit } from '@angular/core';
import { ClerkService } from '../../core/clerk.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true,
  imports: [RouterLink]
})
export class Profile implements OnInit {
  user: any = null;

  constructor(private clerk: ClerkService) {}

  async ngOnInit() {
    this.user = await this.clerk.getUser();
  }

    async logout() {
    await this.clerk.signOut();
  }
}
