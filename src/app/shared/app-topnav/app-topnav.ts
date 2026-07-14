import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { NavItem, navItemsForUrl } from '../nav-items';

@Component({
  selector: 'app-topnav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-topnav.html',
})
export class AppTopNav {
  private readonly router = inject(Router);

  readonly navItems = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => navItemsForUrl(event.urlAfterRedirects)),
      startWith(navItemsForUrl(this.router.url)),
    ),
    { initialValue: navItemsForUrl(this.router.url) },
  );

  readonly openLabel = signal<string | null>(null);
  readonly menuPosition = signal({ top: 0, left: 0 });

  isOpen(item: NavItem): boolean {
    return this.openLabel() === item.label;
  }

  toggle(item: NavItem, event: MouseEvent): void {
    if (this.isOpen(item)) {
      this.openLabel.set(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({ top: rect.bottom + 4, left: rect.left });
    this.openLabel.set(item.label);
  }

  close(): void {
    this.openLabel.set(null);
  }
}
