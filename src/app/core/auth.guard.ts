import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ClerkService } from './clerk.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private clerk: ClerkService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      await this.clerk.init();
      const signed = await this.clerk.isSignedIn();
      if (signed) return true;
      this.router.navigate(['/auth']);
      return false;
    } catch (e) {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}
