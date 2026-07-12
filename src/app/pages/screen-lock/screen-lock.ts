import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SessionLockService } from '../../core/session-lock/session-lock.service';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';

@Component({
  selector: 'app-screen-lock',
  imports: [ReactiveFormsModule, Password, Button, IconField, InputIcon, Toast, AuthLayout],
  templateUrl: './screen-lock.html',
  styleUrl: './screen-lock.css',
})
export class ScreenLock implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sessionLock = inject(SessionLockService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly userName = 'Staff Member';

  readonly form = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  readonly unlocking = signal(false);

  ngOnInit(): void {
    if (this.sessionLock.lockReason() === 'idle') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Session Expired',
        detail: 'Your session has expired due to inactivity. Please enter your password to continue.',
      });
    }
  }

  onUnlock(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.unlocking.set(true);

    // TODO: verify password against the real auth service once the backend is wired up
    setTimeout(() => {
      this.unlocking.set(false);
      this.form.reset();
      this.sessionLock.unlock();
    }, 500);
  }

  signInAsDifferentUser(): void {
    this.router.navigateByUrl('/login');
  }
}
