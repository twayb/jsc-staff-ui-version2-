export interface NavItem {
  label: string;
  icon: string;
  route: string | null;
  children?: NavItem[];
}

const RECRUITMENT_NAV_ITEMS: NavItem[] = [
  { label: 'Services', icon: 'pi-th-large', route: '/services' },
  { label: 'Dashboard', icon: 'pi-user-plus', route: '/recruitment' },
  { label: 'Permits', icon: 'pi-id-card', route: '/recruitment/permits' },
  { label: 'Adverts', icon: 'pi-megaphone', route: '/recruitment/adverts' },
  { label: 'Applications', icon: 'pi-inbox', route: '/recruitment/applications' },
  { label: 'Interview Management', icon: 'pi-comments', route: '/recruitment/interview-management' },
  { label: 'Selection', icon: 'pi-verified', route: '/recruitment/selection' },
  { label: 'Databank', icon: 'pi-database', route: '/recruitment/databank' },
  {
    label: 'Scheme of Service',
    icon: 'pi-list-check',
    route: null,
    children: [
      { label: 'Cadre', icon: 'pi-briefcase', route: '/recruitment/scheme-of-service/cadre' },
      { label: 'Categories', icon: 'pi-tags', route: '/recruitment/scheme-of-service/categories' },
    ],
  },
  { label: 'Applicants', icon: 'pi-users', route: '/recruitment/applicants' },
  {
    label: 'Setup',
    icon: 'pi-cog',
    route: null,
    children: [
      { label: 'Academic Levels', icon: 'pi-graduation-cap', route: '/recruitment/setup/academic-levels' },
      { label: 'Attachment Types', icon: 'pi-paperclip', route: '/recruitment/setup/attachment-types' },
      { label: 'Computer Skills', icon: 'pi-desktop', route: '/recruitment/setup/computer-skills' },
      { label: 'Countries', icon: 'pi-globe', route: '/recruitment/setup/countries' },
      { label: 'Disability', icon: 'pi-heart', route: '/recruitment/setup/disability' },
      { label: 'Institutions', icon: 'pi-building', route: '/recruitment/setup/institutions' },
      { label: 'Interview Types', icon: 'pi-sliders-h', route: '/recruitment/setup/interview-types' },
      { label: 'Interview Venues', icon: 'pi-map-marker', route: '/recruitment/setup/interview-venues' },
      { label: 'Languages', icon: 'pi-language', route: '/recruitment/setup/languages' },
      { label: 'Profession', icon: 'pi-id-card', route: '/recruitment/setup/profession' },
      { label: 'Programs', icon: 'pi-list', route: '/recruitment/setup/programs' },
      { label: 'Salary Scale', icon: 'pi-wallet', route: '/recruitment/setup/salary-scale' },
      { label: 'Shortlist Remarks', icon: 'pi-comment', route: '/recruitment/setup/shortlist-remarks' },
    ],
  },
];

const SYSTEM_ADMINISTRATION_NAV_ITEMS: NavItem[] = [
  { label: 'Services', icon: 'pi-th-large', route: '/services' },
  { label: 'Dashboard', icon: 'pi-home', route: '/system-administration' },
  { label: 'User Management', icon: 'pi-user', route: '/system-administration/users' },
  { label: 'Roles Management', icon: 'pi-shield', route: '/system-administration/roles' },
  { label: 'Employee Management', icon: 'pi-id-card', route: '/system-administration/employees' },
  {
    label: 'Audit Trail',
    icon: 'pi-history',
    route: null,
    children: [
      { label: 'Recruitment Audits', icon: 'pi-user-plus', route: '/system-administration/audit-trail/recruitment' },
      { label: 'Complaints Audit', icon: 'pi-flag', route: '/system-administration/audit-trail/complaints' },
      { label: 'System Admin Audits', icon: 'pi-cog', route: '/system-administration/audit-trail/system-admin' },
    ],
  },
];

const QUESTION_BANK_NAV_ITEMS: NavItem[] = [
  { label: 'Services', icon: 'pi-th-large', route: '/services' },
  { label: 'Dashboard', icon: 'pi-home', route: '/question-bank' },
  { label: 'Add Question', icon: 'pi-plus-circle', route: '/question-bank/add-question' },
  { label: 'Question List', icon: 'pi-list', route: '/question-bank/questions' },
  {
    label: 'Setup',
    icon: 'pi-cog',
    route: null,
    children: [
      { label: 'Question Categories', icon: 'pi-tags', route: '/question-bank/setup/question-categories' },
      { label: 'Question Types', icon: 'pi-list-check', route: '/question-bank/setup/question-types' },
    ],
  },
];

const NAV_ITEMS_BY_SERVICE: Record<string, NavItem[]> = {
  recruitment: RECRUITMENT_NAV_ITEMS,
  'system-administration': SYSTEM_ADMINISTRATION_NAV_ITEMS,
  'question-bank': QUESTION_BANK_NAV_ITEMS,
};

export const DEFAULT_NAV_ITEMS = RECRUITMENT_NAV_ITEMS;

export function navItemsForUrl(url: string): NavItem[] {
  const service = url.split('/').filter(Boolean)[0] ?? '';
  return NAV_ITEMS_BY_SERVICE[service] ?? DEFAULT_NAV_ITEMS;
}
