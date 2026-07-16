import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { AuthService } from '../../core/auth/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-password-change',
  imports: [ReactiveFormsModule, RouterLink, Button, Password, IconField, InputIcon, AuthLayout],
  templateUrl: './password-change.html',
  styleUrl: './password-change.css',
})
export class PasswordChange {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  // A token in the URL means this is a forgot-password/expired-password reset link;
  // otherwise it's an already-authenticated user changing their password from the header menu.
  readonly hasToken = !!this.token;

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  readonly submitting = signal(false);
  readonly submitted = signal(false);

  constructor() {
    if (!this.hasToken) {
      this.form.controls.currentPassword.addValidators(Validators.required);
      this.form.controls.currentPassword.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { currentPassword, password } = this.form.getRawValue();

    const request$ = this.hasToken
      ? this.authService.resetPassword(password, this.token)
      : this.authService.changePassword({ oldPassword: currentPassword, newPassword: password });

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => this.submitted.set(true),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Something went wrong. Please try again later.',
        });
      },
    });
  }
}
