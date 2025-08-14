import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { Home } from './home/home';  // Make sure this exists or create it
import { AuthGuard } from './core/auth.guard';
import { Chat } from './pages/chat/chat';
import { Profile } from './pages/profile/profile';


export const routes: Routes = [
  { path: 'auth', 
    component: AuthComponent },
  { path: 'home', 
    component: Home, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'chat',
    component: Chat, canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: Profile, canActivate: [AuthGuard]
  }
];

