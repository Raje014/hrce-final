import { Routes } from '@angular/router';
import { mobileOnlyGuard } from './guards/mobile-only.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then( m => m.AboutPage)
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.page').then( m => m.ContactPage)
  },
  {
    path: 'official-dashboard',
    loadComponent: () => import('./official-dashboard/official-dashboard.page').then( m => m.OfficialDashboardPage)
  },
  {
    path: 'registerform',
    loadComponent: () => import('./registerform/registerform.page').then( m => m.RegisterformPage)
  },
  {
    path: 'sub-users',
    loadComponent: () => import('./sub-users/sub-users.page').then( m => m.SubUsersPage)
  },
  {
    path: 'temple-location',
    canActivate: [mobileOnlyGuard],
    loadComponent: () => import('./temple-location/temple-location.page').then( m => m.TempleLocationPage)
  },
  {
    path: 'temple-status',
    loadComponent: () => import('./temple-status/temple-status.page').then( m => m.TempleStatusPage)
  },
];
