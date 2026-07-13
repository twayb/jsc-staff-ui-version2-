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

  readonly expandedLabels = signal<Set<string>>(
    new Set(
      NAV_ITEMS.filter(
        (item) => item.children?.some((child) => child.route && this.router.url.startsWith(child.route)),
      ).map((item) => item.label),
    ),
  );

  isExpanded(item: NavItem): boolean {
    return this.expandedLabels().has(item.label);
  }

  toggle(item: NavItem): void {
    const expanded = new Set(this.expandedLabels());
    if (expanded.has(item.label)) {
      expanded.delete(item.label);
    } else {
      expanded.add(item.label);
    }
    this.expandedLabels.set(expanded);
  }
}
