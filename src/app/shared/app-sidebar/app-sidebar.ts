import { Component, Input, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS, NavItem } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
})
export class AppSidebar {
  private readonly router = inject(Router);

  @Input() collapsed = false;

  readonly appVersion = 'v2.0.0';

  readonly navItems = NAV_ITEMS;

  readonly expandedLabel = signal<string | null>(
    NAV_ITEMS.find((item) => item.children?.some((child) => child.route && this.router.url.startsWith(child.route)))
      ?.label ?? null,
  );

  isExpanded(item: NavItem): boolean {
    return this.expandedLabel() === item.label;
  }

  toggle(item: NavItem): void {
    this.expandedLabel.set(this.isExpanded(item) ? null : item.label);
  }
}
