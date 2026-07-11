import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [Avatar, Menu],
  templateUrl: './app-header.html',
})
export class AppHeader {
  @Input() showLogo = true;
  @Input() showSidebarToggle = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly userName = 'Staff Member';
  readonly userTitle = 'ICT Officer';

  readonly userMenuItems: MenuItem[] = [
    {
      label: this.userTitle,
      disabled: true,
    },
    { separator: true },
    {
      label: 'Change Password',
      icon: 'pi pi-lock',
      command: () => this.router.navigateByUrl('/password-change'),
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  logout(): void {
    this.router.navigateByUrl('/login');
  }
}
