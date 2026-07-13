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
    icon: 'pi-sitemap',
    route: null,
    children: [
      { label: 'Cadre', icon: 'pi-briefcase', route: '/recruitment/scheme-of-service/cadre' },
      { label: 'Categories', icon: 'pi-tags', route: '/recruitment/scheme-of-service/categories' },
    ],
  },
];
