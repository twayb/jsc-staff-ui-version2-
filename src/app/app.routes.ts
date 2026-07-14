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
        path: 'recruitment/applications/:origin/:referenceNo/applicant/:nin/cv',
        loadComponent: () =>
          import('./recruitment/applications/cv-preview/cv-preview').then((m) => m.CvPreview),
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
      {
        path: 'recruitment/selection',
        loadComponent: () =>
          import('./recruitment/selection/selection-by-cadre/selection-by-cadre').then((m) => m.SelectionByCadre),
      },
      {
        path: 'recruitment/selection/:referenceNo',
        loadComponent: () =>
          import('./recruitment/selection/selection-list/selection-list').then((m) => m.SelectionList),
      },
      {
        path: 'recruitment/databank',
        loadComponent: () =>
          import('./recruitment/Databank/databank-by-cadre/databank-by-cadre').then((m) => m.DatabankByCadre),
      },
      {
        path: 'recruitment/databank/:referenceNo',
        loadComponent: () =>
          import('./recruitment/Databank/databank-list/databank-list').then((m) => m.DatabankList),
      },
      {
        path: 'recruitment/scheme-of-service/cadre',
        loadComponent: () =>
          import('./recruitment/Scheme-of-service/cadre/cadre').then((m) => m.Cadre),
      },
      {
        path: 'recruitment/scheme-of-service/categories',
        loadComponent: () =>
          import('./recruitment/Scheme-of-service/cadre-categories/cadre-categories').then((m) => m.CadreCategories),
      },
      {
        path: 'recruitment/applicants',
        loadComponent: () =>
          import('./recruitment/Applicants/applicant-list/applicant-list').then((m) => m.ApplicantList),
      },
      {
        path: 'recruitment/applicants/:nin',
        loadComponent: () =>
          import('./recruitment/Applicants/applicant-details/applicant-details').then((m) => m.ApplicantDetails),
      },
      {
        path: 'recruitment/setup/academic-levels',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/academic-levels/academic-levels').then((m) => m.AcademicLevels),
      },
      {
        path: 'recruitment/setup/attachment-types',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/attachment-types/attachment-types').then((m) => m.AttachmentTypes),
      },
      {
        path: 'recruitment/setup/computer-skills',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/computer-skills/computer-skills').then((m) => m.ComputerSkills),
      },
      {
        path: 'recruitment/setup/countries',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/countries/countries').then((m) => m.Countries),
      },
      {
        path: 'recruitment/setup/disability',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/disability/disability').then((m) => m.Disability),
      },
      {
        path: 'recruitment/setup/institutions',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/institution/institution').then((m) => m.Institution),
      },
      {
        path: 'recruitment/setup/interview-types',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/interview-types/interview-types').then((m) => m.InterviewTypes),
      },
      {
        path: 'recruitment/setup/interview-venues',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/interview-venues/interview-venues').then((m) => m.InterviewVenues),
      },
      {
        path: 'recruitment/setup/languages',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/languages/languages').then((m) => m.Languages),
      },
      {
        path: 'recruitment/setup/profession',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/profession/profession').then((m) => m.Profession),
      },
      {
        path: 'recruitment/setup/programs',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/programs/programs').then((m) => m.Programs),
      },
      {
        path: 'recruitment/setup/salary-scale',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/salary-scale/salary-scale').then((m) => m.SalaryScale),
      },
      {
        path: 'recruitment/setup/shortlist-remarks',
        loadComponent: () =>
          import('./recruitment/recruitment-setup/shortlist-remarks/shortlist-remarks').then(
            (m) => m.ShortlistRemarks,
          ),
      },
      {
        path: 'system-administration',
        loadComponent: () =>
          import('./system-administration/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'system-administration/users',
        loadComponent: () =>
          import('./system-administration/user-management/user-management').then((m) => m.UserManagement),
      },
      {
        path: 'system-administration/roles',
        loadComponent: () =>
          import('./system-administration/roles-management/roles-management').then((m) => m.RolesManagement),
      },
      {
        path: 'system-administration/roles/:role/permissions',
        loadComponent: () =>
          import('./system-administration/permissions/permissions').then((m) => m.Permissions),
      },
      {
        path: 'system-administration/employees',
        loadComponent: () =>
          import('./system-administration/employee-management/employee-management').then(
            (m) => m.EmployeeManagement,
          ),
      },
      {
        path: 'system-administration/audit-trail/:category',
        loadComponent: () =>
          import('./system-administration/audit-trail/audit-trail').then((m) => m.AuditTrail),
      },
      {
        path: 'question-bank',
        loadComponent: () =>
          import('./question-bank/question-bank-dashboard/question-bank-dashboard').then(
            (m) => m.QuestionBankDashboard,
          ),
      },
      {
        path: 'question-bank/add-question',
        loadComponent: () =>
          import('./question-bank/add-question/add-question').then((m) => m.AddQuestion),
      },
      {
        path: 'question-bank/questions',
        loadComponent: () =>
          import('./question-bank/question-list/question-list').then((m) => m.QuestionList),
      },
      {
        path: 'question-bank/setup',
        loadComponent: () => import('./question-bank/setup/setup').then((m) => m.Setup),
      },
    ],
  },
];
