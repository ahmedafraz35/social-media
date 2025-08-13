import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { Home } from './home/home';  // Make sure this exists or create it
import { AuthGuard } from './core/auth.guard';


export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];

