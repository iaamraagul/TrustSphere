import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { adminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (routeModule) => routeModule.LoginComponent,
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (routeModule) => routeModule.RegisterComponent,
      ),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (routeModule) => routeModule.DashboardComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then(
            (routeModule) => routeModule.UsersComponent,
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'monitor',
        loadComponent: () =>
          import('./features/monitor/monitor.component').then(
            (routeModule) => routeModule.MonitorComponent,
          ),
      },
      {
        path: 'fraud',
        loadComponent: () =>
          import('./features/fraud/fraud.component').then(
            (routeModule) => routeModule.FraudComponent,
          ),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit.component').then(
            (routeModule) => routeModule.AuditComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (routeModule) => routeModule.SettingsComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
