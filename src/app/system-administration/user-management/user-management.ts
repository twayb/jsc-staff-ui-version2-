import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { StaffRecord, UserManagementService } from '../../core/auth/user-management.service';
import { titleCase } from '../../core/utils';

type UserStatus = 'Active' | 'Not Active';
type UserStatusSeverity = 'success' | 'danger';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  status: UserStatus;
}

function mapStaffUser(raw: StaffRecord): SystemUser {
  return {
    id: raw.id,
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.mobileNumber ?? '',
    userType: raw.type ?? '',
    status: raw.isLocked ? 'Not Active' : 'Active',
  };
}

@Component({
  selector: 'app-user-management',
  imports: [
    ReactiveFormsModule,
    Tag,
    Menu,
    Dialog,
    Button,
    InputText,
    Select,
    AppBreadcrumb,
    AppDataTable,
    AppSkeleton,
    CountUp,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly userManagementService = inject(UserManagementService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'System Administration', routerLink: '/system-administration' },
    { label: 'User Management' },
  ];

  readonly loading = signal(true);
  readonly users = signal<SystemUser[]>([]);

  ngOnInit(): void {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.loading.set(true);
    this.userManagementService
      .getStaffUsers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.users.set((response.data ?? []).map((user) => mapStaffUser(user))),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Users',
            detail: 'Could not load the user list. Please try again later.',
          });
        },
      });
  }

  readonly totalUsers = computed(() => this.users().length);
  readonly activeUsers = computed(() => this.users().filter((u) => u.status === 'Active').length);
  readonly notActiveUsers = computed(() => this.users().filter((u) => u.status === 'Not Active').length);

  // `type` is the coarse user category the backend returns (confirmed: "COMPLAINANT");
  // it's distinct from the RBAC role assigned in Roles Management (HICT/DSE/DSR/etc.).
  readonly roleOptions = [
    { label: 'Staff', value: 'STAFF' },
    { label: 'Complainant', value: 'COMPLAINANT' },
    { label: 'Applicant', value: 'APPLICANT' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingUser: SystemUser | null = null;
  readonly submitting = signal(false);

  showViewDialog = false;
  viewingUser: SystemUser | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    userType: ['', Validators.required],
  });

  statusSeverity(status: UserStatus): UserStatusSeverity {
    return status === 'Active' ? 'success' : 'danger';
  }

  formatUserType(userType: string): string {
    return userType ? titleCase(userType) : '';
  }

  formatName(name: string): string {
    return name ? titleCase(name) : '';
  }

  openActionMenu(event: Event, user: SystemUser, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(user) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(user) },
      { separator: true },
      user.status === 'Active'
        ? { label: 'Lock Account', icon: 'pi pi-lock', command: () => this.onLock(user) }
        : { label: 'Unlock Account', icon: 'pi pi-lock-open', command: () => this.onUnlock(user) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingUser = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onView(user: SystemUser): void {
    this.viewingUser = user;
    this.showViewDialog = true;
  }

  onEdit(user: SystemUser): void {
    this.dialogMode = 'edit';
    this.editingUser = user;
    this.form.reset();
    this.form.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
    });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.submitting.set(true);

    if (this.dialogMode === 'edit' && this.editingUser) {
      const target = this.editingUser;
      this.userManagementService
        .updateUser({ id: target.id, name: raw.name, email: raw.email, mobileNumber: raw.phone, type: raw.userType })
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.users.update((list) => list.map((u) => (u === target ? { ...u, ...raw } : u)));
            this.messageService.add({
              severity: 'success',
              summary: 'User Updated',
              detail: `"${raw.name}" was updated successfully.`,
            });
            this.showFormDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Update Failed',
              detail: 'Something went wrong. Please try again later.',
            });
          },
        });
    } else {
      this.userManagementService
        .saveUser({ name: raw.name, email: raw.email, mobileNumber: raw.phone, type: raw.userType })
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: (response) => {
            this.users.update((list) => [mapStaffUser({ ...response.data, ...raw }), ...list]);
            this.messageService.add({
              severity: 'success',
              summary: 'User Added',
              detail: `"${raw.name}" was added successfully.`,
            });
            this.showFormDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Add Failed',
              detail: 'Something went wrong. Please try again later.',
            });
          },
        });
    }
  }

  onLock(user: SystemUser): void {
    this.confirmationService.confirm({
      header: 'Lock Account',
      message: `Are you sure you want to lock the account for "${user.name}"?`,
      icon: 'pi pi-lock',
      acceptButtonProps: { label: 'Lock', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.userManagementService.lockAccount(user.id).subscribe({
          next: () => {
            this.users.update((list) => list.map((u) => (u === user ? { ...u, status: 'Not Active' } : u)));
            this.messageService.add({
              severity: 'success',
              summary: 'Account Locked',
              detail: `"${user.name}" was locked successfully.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lock Failed',
              detail: 'Something went wrong. Please try again later.',
            });
          },
        });
      },
    });
  }

  onUnlock(user: SystemUser): void {
    this.confirmationService.confirm({
      header: 'Unlock Account',
      message: `Are you sure you want to unlock the account for "${user.name}"?`,
      icon: 'pi pi-lock-open',
      acceptButtonProps: { label: 'Unlock' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.userManagementService.unlockAccount(user.id).subscribe({
          next: () => {
            this.users.update((list) => list.map((u) => (u === user ? { ...u, status: 'Active' } : u)));
            this.messageService.add({
              severity: 'success',
              summary: 'Account Unlocked',
              detail: `"${user.name}" was unlocked successfully.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Unlock Failed',
              detail: 'Something went wrong. Please try again later.',
            });
          },
        });
      },
    });
  }
}
