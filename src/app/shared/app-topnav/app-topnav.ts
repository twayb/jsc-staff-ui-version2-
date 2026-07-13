import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS, NavItem } from '../nav-items';

@Component({
  selector: 'app-topnav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-topnav.html',
})
export class AppTopNav {
  readonly navItems = NAV_ITEMS;

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
