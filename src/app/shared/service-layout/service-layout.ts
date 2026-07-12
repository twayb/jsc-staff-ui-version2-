import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '../app-header/app-header';
import { AppFooter } from '../app-footer/app-footer';
import { SessionLockService } from '../../core/session-lock/session-lock.service';

@Component({
  selector: 'app-service-layout',
  imports: [RouterOutlet, AppHeader, AppFooter],
  templateUrl: './service-layout.html',
})
export class ServiceLayout implements OnInit, OnDestroy {
  private readonly sessionLock = inject(SessionLockService);

  ngOnInit(): void {
    this.sessionLock.startWatching();
  }

  ngOnDestroy(): void {
    this.sessionLock.stopWatching();
  }
}
