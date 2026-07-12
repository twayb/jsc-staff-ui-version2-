import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AppHeader } from '../app-header/app-header';
import { AppSidebar } from '../app-sidebar/app-sidebar';
import { AppTopNav } from '../app-topnav/app-topnav';
import { AppFooter } from '../app-footer/app-footer';
import { SessionLockService } from '../../core/session-lock/session-lock.service';
import { LayoutService } from '../../core/layout/layout.service';
import { TextSizeService } from '../../core/text-size/text-size.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, AppHeader, AppSidebar, AppTopNav, AppFooter, Toast, ConfirmDialog],
  templateUrl: './main-layout.html',
})
export class MainLayout implements OnInit, OnDestroy {
  private readonly sessionLock = inject(SessionLockService);
  readonly layout = inject(LayoutService);
  readonly textSize = inject(TextSizeService);

  readonly sidebarCollapsed = signal(false);

  ngOnInit(): void {
    this.sessionLock.startWatching();
  }

  ngOnDestroy(): void {
    this.sessionLock.stopWatching();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
