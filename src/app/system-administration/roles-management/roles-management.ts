import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Skeleton } from 'primeng/skeleton';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { CountUp } from '../../shared/count-up.directive';
import { Role, RolesDataService } from '../roles-data.service';

@Component({
  selector: 'app-roles-management',
  imports: [
    ReactiveFormsModule,
    Menu,
    Dialog,
    Button,
    InputText,
    Textarea,
    Skeleton,
    AppBreadcrumb,
    AppDataTable,
    CountUp,
  ],
  templateUrl: './roles-management.html',
  styleUrl: './roles-management.css',
})
export class RolesManagement {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly rolesData = inject(RolesDataService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'System Administration', routerLink: '/system-administration' },
    { label: 'Roles Management' },
  ];

  readonly loading = this.rolesData.loading;

  readonly roles = this.rolesData.roles;

  get totalRoles(): number {
    return this.roles().length;
  }

  get totalAssignedUsers(): number {
    return this.roles().reduce((sum, r) => sum + r.usersCount, 0);
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingRole: Role | null = null;

  showViewDialog = false;
  viewingRole: Role | null = null;
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  openActionMenu(event: Event, role: Role, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(role) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(role) },
      { label: 'Permissions', icon: 'pi pi-key', command: () => this.onPermissions(role) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingRole = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onView(role: Role): void {
    this.viewingRole = role;
    this.showViewDialog = true;
  }

  onEdit(role: Role): void {
    this.dialogMode = 'edit';
    this.editingRole = role;
    this.form.reset();
    this.form.patchValue({ name: role.name, description: role.description });
    this.showFormDialog = true;
  }

  onPermissions(role: Role): void {
    this.router.navigate(['/system-administration/roles', role.name, 'permissions']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.submitting.set(true);

    const request$ =
      this.dialogMode === 'edit' && this.editingRole
        ? this.rolesData.updateRole(this.editingRole, raw)
        : this.rolesData.addRole(raw);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Role Updated' : 'Role Added',
          detail: `"${raw.name}" was ${this.dialogMode === 'edit' ? 'updated' : 'added'} successfully.`,
        });
        this.showFormDialog = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.dialogMode === 'edit' ? 'Update Failed' : 'Add Failed',
          detail: error?.error?.message ?? 'Something went wrong. Please try again later.',
        });
      },
    });
  }
}
