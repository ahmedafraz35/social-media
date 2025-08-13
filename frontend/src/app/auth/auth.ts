import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ClerkService } from '../core/clerk.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements AfterViewInit, OnDestroy {
  @ViewChild('signIn', { static: false }) signInRef!: ElementRef<HTMLElement>;
  @ViewChild('signUp', { static: false }) signUpRef!: ElementRef<HTMLElement>;
  showSignUpPanel = false;

  constructor(private clerk: ClerkService) {}

  async ngAfterViewInit() {
    try {
      // init + mount the SignIn UI into the signIn div
      await this.clerk.init();
      if (this.signInRef) {
        await this.clerk.mountSignIn(this.signInRef.nativeElement, {
          afterSignInUrl: window.location.origin + '/home'
        });
      }
    } catch (err) {
      console.error('Clerk init failed:', err);
    }
  }

  async showSignUp() {
    this.showSignUpPanel = true;
    if (this.signUpRef) {
      await this.clerk.mountSignUp(this.signUpRef.nativeElement, {
        afterSignUpUrl: window.location.origin + '/home'
      });
    }
  }

  async logout() {
    await this.clerk.signOut();
    // you can redirect or update UI after sign out
    window.location.href = '/auth';
  }

  ngOnDestroy() {
    // Clerk mount APIs often manage their own lifecycle;
    // if you want to unmount explicitly, check the Clerk instance return values (optional).
  }
}
