import { Component, Input } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-breadcrumb',
  imports: [Breadcrumb],
  templateUrl: './app-breadcrumb.html',
})
export class AppBreadcrumb {
  @Input() items: MenuItem[] = [];
  @Input() home: MenuItem = { icon: 'pi pi-home', routerLink: '/services' };
}
