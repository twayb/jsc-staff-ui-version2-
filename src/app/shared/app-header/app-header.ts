import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../core/theme/theme.service';
import { SessionLockService } from '../../core/session-lock/session-lock.service';
import { LayoutService } from '../../core/layout/layout.service';
import { TextSizeService } from '../../core/text-size/text-size.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [Avatar, Menu, Tooltip],
  templateUrl: './app-header.html',
})
export class AppHeader {
  @Input() showLogo = true;
  @Input() showSidebarToggle = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  readonly theme = inject(ThemeService);
  readonly layout = inject(LayoutService);
  readonly textSize = inject(TextSizeService);
  private readonly router = inject(Router);
  private readonly sessionLock = inject(SessionLockService);
  private readonly authService = inject(AuthService);

  readonly userName = computed(() => this.authService.user()?.name ?? this.authService.user()?.fullName ?? 'Staff Member');
  readonly userTitle = 'ICT Officer';

  readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.userTitle,
      disabled: true,
    },
    { separator: true },
    {
      label: 'Lock Screen',
      icon: 'pi pi-lock',
      command: () => this.sessionLock.lockNow(),
    },
    {
      label: 'Change Password',
      icon: 'pi pi-key',
      command: () => this.router.navigateByUrl('/password-change'),
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ]);

  logout(): void {
    this.authService.logout();
  }
}
