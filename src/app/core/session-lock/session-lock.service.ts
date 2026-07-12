import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;

export type LockReason = 'idle' | 'manual';

@Injectable({ providedIn: 'root' })
export class SessionLockService {
  private readonly router = inject(Router);

  readonly locked = signal(false);
  readonly lockReason = signal<LockReason | null>(null);

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private watching = false;
  private returnUrl = '/services';

  private readonly resetTimer = (): void => {
    if (!this.watching || this.locked()) {
      return;
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(() => this.lockNow('idle'), IDLE_TIMEOUT_MS);
  };

  startWatching(): void {
    if (this.watching) {
      return;
    }
    this.watching = true;
    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, this.resetTimer, { passive: true });
    }
    this.resetTimer();
  }

  stopWatching(): void {
    this.watching = false;
    for (const event of ACTIVITY_EVENTS) {
      document.removeEventListener(event, this.resetTimer);
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  lockNow(reason: LockReason = 'manual'): void {
    if (this.locked()) {
      return;
    }
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    const currentUrl = this.router.url;
    if (currentUrl && currentUrl !== '/screen-lock') {
      this.returnUrl = currentUrl;
    }
    this.lockReason.set(reason);
    this.locked.set(true);
    this.router.navigateByUrl('/screen-lock');
  }

  unlock(): void {
    this.locked.set(false);
    this.lockReason.set(null);
    this.router.navigateByUrl(this.returnUrl);
    this.resetTimer();
  }
}
