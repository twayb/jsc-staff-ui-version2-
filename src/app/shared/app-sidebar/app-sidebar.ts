import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
})
export class AppSidebar {
  @Input() collapsed = false;

  readonly appVersion = 'v2.0.0';

  readonly navItems = NAV_ITEMS;
}
