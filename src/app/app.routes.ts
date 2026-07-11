import { Routes } from '@angular/router';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'password-change',
    loadComponent: () => import('./pages/password-change/password-change').then((m) => m.PasswordChange),
  },
  {
    path: '',
    loadComponent: () => import('./shared/service-layout/service-layout').then((m) => m.ServiceLayout),
    children: [
      {
        path: 'services',
        loadComponent: () => import('./service-section/service-section').then((m) => m.ServiceSection),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./shared/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'recruitment',
        loadComponent: () =>
          import('./recruitment/recruitment-dashboard/recruitment-dashboard').then((m) => m.RecruitmentDashboard),
      },
      {
        path: 'recruitment/permits',
        loadComponent: () => import('./recruitment/permits/permits').then((m) => m.Permits),
      },
    ],
  },
];
