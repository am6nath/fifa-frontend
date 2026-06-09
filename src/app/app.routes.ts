import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./features/public/teams/teams').then(m => m.TeamsComponent)
  },
  {
    path: 'results/:id',
    loadComponent: () => import('./features/public/statistics/statistics').then(m => m.StatisticsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/public/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  // Auth paths
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/verify-otp',
    loadComponent: () => import('./features/auth/verify-otp/verify-otp').then(m => m.VerifyOtpComponent)
  },
  // Voting path
  {
    path: 'vote/:id',
    loadComponent: () => import('./features/voting/cast-vote/cast-vote').then(m => m.CastVoteComponent),
    canActivate: [authGuard]
  },
  // Admin paths
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/teams',
    loadComponent: () => import('./features/admin/team-manager/team-manager').then(m => m.TeamManagerComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/sessions',
    loadComponent: () => import('./features/admin/session-manager/session-manager').then(m => m.SessionManagerComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/user-manager/user-manager').then(m => m.UserManagerComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/logs',
    loadComponent: () => import('./features/admin/audit-logs/audit-logs').then(m => m.AuditLogsComponent),
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
