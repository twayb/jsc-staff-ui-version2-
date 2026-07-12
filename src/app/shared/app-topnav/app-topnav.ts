import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-topnav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-topnav.html',
})
export class AppTopNav {
  readonly navItems = NAV_ITEMS;
}
