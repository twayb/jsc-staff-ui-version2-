export interface NavItem {
  label: string;
  icon: string;
  route: string | null;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Services', icon: 'pi-th-large', route: '/services' },
  { label: 'Dashboard', icon: 'pi-user-plus', route: '/recruitment' },
  { label: 'Permits', icon: 'pi-id-card', route: '/recruitment/permits' },
  { label: 'Adverts', icon: 'pi-megaphone', route: '/recruitment/adverts' },
  { label: 'Applications', icon: 'pi-inbox', route: '/recruitment/applications' },
];
