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
    path: 'screen-lock',
    loadComponent: () => import('./pages/screen-lock/screen-lock').then((m) => m.ScreenLock),
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
      {
        path: 'recruitment/adverts',
        loadComponent: () => import('./recruitment/adverts/adverts').then((m) => m.Adverts),
      },
      {
        path: 'recruitment/applications',
        loadComponent: () =>
          import('./recruitment/applications/application-list/application-list').then((m) => m.ApplicationList),
      },
      {
        path: 'recruitment/applications/longlist/:referenceNo',
        loadComponent: () =>
          import('./recruitment/applications/longlist-list/longlist-list').then((m) => m.LonglistList),
      },
      {
        path: 'recruitment/applications/longlist/:referenceNo/attended-unattended/:panel',
        loadComponent: () =>
          import('./recruitment/applications/attended-unattended/attended-unattended').then(
            (m) => m.AttendedUnattended,
          ),
      },
      {
        path: 'recruitment/applications/assigned/:referenceNo',
        loadComponent: () =>
          import('./recruitment/applications/applicant-assigned/applicant-assigned').then(
            (m) => m.ApplicantAssigned,
          ),
      },
      {
        path: 'recruitment/applications/:origin/:referenceNo/applicant/:nin',
        loadComponent: () =>
          import('./recruitment/applications/applicant-preview/applicant-preview').then((m) => m.ApplicantPreview),
      },
      {
        path: 'recruitment/interview-management',
        loadComponent: () =>
          import('./recruitment/interview-managment/interview-list-by-cadre/interview-list-by-cadre').then(
            (m) => m.InterviewListByCadre,
          ),
      },
      {
        path: 'recruitment/interview-management/:permitNo',
        loadComponent: () =>
          import('./recruitment/interview-managment/interview-list/interview-list').then((m) => m.InterviewList),
      },
      {
        path: 'recruitment/interview-management/:permitNo/distribute-by-region',
        loadComponent: () =>
          import('./recruitment/interview-managment/distribute-by-region/distribute-by-region').then(
            (m) => m.DistributeByRegion,
          ),
      },
      {
        path: 'recruitment/interview-management/:permitNo/venue-by-region',
        loadComponent: () =>
          import('./recruitment/interview-managment/venue-by-region/venue-by-region').then((m) => m.VenueByRegion),
      },
      {
        path: 'recruitment/interview-management/:permitNo/candidate-by-venue',
        loadComponent: () =>
          import('./recruitment/interview-managment/candidate-by-venue/candidate-by-venue').then(
            (m) => m.CandidateByVenue,
          ),
      },
      {
        path: 'recruitment/interview-management/:permitNo/results',
        loadComponent: () => import('./recruitment/interview-managment/result/result').then((m) => m.Result),
      },
      {
        path: 'recruitment/interview-management/:permitNo/panel',
        loadComponent: () => import('./recruitment/interview-managment/panel/panel').then((m) => m.Panel),
      },
      {
        path: 'recruitment/interview-management/:permitNo/panelists',
        loadComponent: () =>
          import('./recruitment/interview-managment/panelists/panelists').then((m) => m.Panelists),
      },
    ],
  },
];
