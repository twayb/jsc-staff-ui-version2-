export interface NavItem {
  label: string;
  icon: string;
  route: string | null;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
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
