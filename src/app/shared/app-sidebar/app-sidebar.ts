import { Component, Input, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { NavItem, navItemsForUrl } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
})
export class AppSidebar {
  private readonly router = inject(Router);

  @Input() collapsed = false;

  readonly appVersion = 'v2.0.0';

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly navItems = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => navItemsForUrl(event.urlAfterRedirects)),
      startWith(navItemsForUrl(this.router.url)),
    ),
    { initialValue: navItemsForUrl(this.router.url) },
  );

  readonly expandedLabel = signal<string | null>(null);

  constructor() {
    effect(() => {
      const url = this.currentUrl();
      const items = this.navItems();
      this.expandedLabel.set(
        items.find((item) => item.children?.some((child) => child.route && url.startsWith(child.route)))?.label ??
          null,
      );
    });
  }

  isExpanded(item: NavItem): boolean {
    return this.expandedLabel() === item.label;
  }

  toggle(item: NavItem): void {
    this.expandedLabel.set(this.isExpanded(item) ? null : item.label);
  }
}
