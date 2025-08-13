// src/app/core/clerk.service.ts
import { Injectable } from '@angular/core';

declare global {
  interface Window {
    Clerk?: any;
    __CLERK_PUBLISHABLE_KEY__?: string; // optional helper
  }
}

@Injectable({ providedIn: 'root' })
export class ClerkService {
  private ready = false;

  /** Wait for window.Clerk to appear, then call Clerk.load() (per Clerk quickstart) */
  async init(timeoutMs = 15000): Promise<void> {
    if (this.ready) return;
    // Wait for the script to attach window.Clerk
    const start = Date.now();
    while (!(window as any).Clerk) {
      if (Date.now() - start > timeoutMs) {
        throw new Error('Clerk script load timed out');
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    // Call Clerk.load() to initialize the SDK (docs show calling Clerk.load after script).
    await (window as any).Clerk.load?.();
    this.ready = true;
  }

  /** Mount Clerk sign-in UI into a container element */
  async mountSignIn(container: HTMLElement, options?: any) {
    await this.init();
    return (window as any).Clerk.mountSignIn?.(container, options);
  }

  /** Mount Clerk sign-up UI into a container element */
  async mountSignUp(container: HTMLElement, options?: any) {
    await this.init();
    return (window as any).Clerk.mountSignUp?.(container, options);
  }

  /** Mount a user-avatar / account button into a container (optional) */
  async mountUserButton(container: HTMLElement) {
    await this.init();
    return (window as any).Clerk.mountUserButton?.(container);
  }

  /** Sign out (calls Clerk.signOut if available) */
  async signOut() {
    await this.init();
    return (window as any).Clerk.signOut?.();
  }

  /** Simple helpers */
  async isSignedIn(): Promise<boolean> {
    await this.init();
    return !!(window as any).Clerk?.isSignedIn;
  }

  async getUser() {
    await this.init();
    return (window as any).Clerk?.user ?? null;
  }
}
