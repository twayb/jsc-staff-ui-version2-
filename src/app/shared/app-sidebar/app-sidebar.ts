import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string | null;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
})
export class AppSidebar {
  @Input() collapsed = false;

  readonly appVersion = 'v2.0.0';

  readonly navItems: NavItem[] = [
    { label: 'Services', icon: 'pi-th-large', route: '/services' },
    { label: 'Dashboard', icon: 'pi-user-plus', route: '/recruitment' },
    { label: 'Permits', icon: 'pi-id-card', route: '/recruitment/permits' },
  ];
}
