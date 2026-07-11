import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AppHeader } from '../app-header/app-header';
import { AppSidebar } from '../app-sidebar/app-sidebar';
import { AppFooter } from '../app-footer/app-footer';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, AppHeader, AppSidebar, AppFooter, Toast, ConfirmDialog],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
