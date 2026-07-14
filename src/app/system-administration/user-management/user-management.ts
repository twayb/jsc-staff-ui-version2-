import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';

type UserStatus = 'Active' | 'Not Active';
type UserStatusSeverity = 'success' | 'danger';

interface SystemUser {
  name: string;
  email: string;
  phone: string;
  userType: string;
  status: UserStatus;
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

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'System Administration', routerLink: '/system-administration' },
    { label: 'User Management' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  users: SystemUser[] = [
    { name: 'Amina Hassan', email: 'amina.hassan@jsc.go.tz', phone: '+255 712 345 678', userType: 'HICT', status: 'Active' },
    { name: 'John Mwangi', email: 'john.mwangi@jsc.go.tz', phone: '+255 713 456 789', userType: 'DSE', status: 'Active' },
    { name: 'Grace Kileo', email: 'grace.kileo@jsc.go.tz', phone: '+255 714 567 890', userType: 'Staff', status: 'Not Active' },
    { name: 'Peter Mushi', email: 'peter.mushi@jsc.go.tz', phone: '+255 719 012 345', userType: 'DSR', status: 'Active' },
  ];

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((u) => u.status === 'Active').length;
  }

  get notActiveUsers(): number {
    return this.users.filter((u) => u.status === 'Not Active').length;
  }

  readonly roleOptions = [
    { label: 'HICT', value: 'HICT' },
    { label: 'DSE', value: 'DSE' },
    { label: 'DSR', value: 'DSR' },
    { label: 'Complainant', value: 'Complainant' },
    { label: 'Staff', value: 'Staff' },
    { label: 'Applicant', value: 'Applicant' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingUser: SystemUser | null = null;

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

    if (this.dialogMode === 'edit' && this.editingUser) {
      const target = this.editingUser;
      this.users = this.users.map((u) => (u === target ? { ...u, ...raw } : u));
      this.messageService.add({
        severity: 'success',
        summary: 'User Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.users = [{ ...raw, status: 'Active' }, ...this.users];
      this.messageService.add({
        severity: 'success',
        summary: 'User Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onLock(user: SystemUser): void {
    this.confirmationService.confirm({
      header: 'Lock Account',
      message: `Are you sure you want to lock the account for "${user.name}"?`,
      icon: 'pi pi-lock',
      acceptButtonProps: { label: 'Lock', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.users = this.users.map((u) => (u === user ? { ...u, status: 'Not Active' } : u));
        this.messageService.add({
          severity: 'success',
          summary: 'Account Locked',
          detail: `"${user.name}" was locked successfully.`,
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
        this.users = this.users.map((u) => (u === user ? { ...u, status: 'Active' } : u));
        this.messageService.add({
          severity: 'success',
          summary: 'Account Unlocked',
          detail: `"${user.name}" was unlocked successfully.`,
        });
      },
    });
  }
}
