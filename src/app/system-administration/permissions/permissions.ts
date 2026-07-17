import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { PermissionGroup, RolesDataService } from '../roles-data.service';

@Component({
  selector: 'app-permissions',
  imports: [
    FormsModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    Checkbox,
    Button,
    AppBreadcrumb,
    AppSkeleton,
  ],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class Permissions {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly rolesData = inject(RolesDataService);

  readonly roleName = this.route.snapshot.paramMap.get('role') ?? '';
  readonly loading = this.rolesData.loading;
  readonly role = computed(() => this.rolesData.getRole(this.roleName));
  readonly groups = this.rolesData.permissionGroups;

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'System Administration', routerLink: '/system-administration' },
    { label: 'Roles Management', routerLink: '/system-administration/roles' },
    { label: this.roleName + ' Permissions' },
  ];

  readonly checkedKeys = signal<Set<string>>(new Set());
  private seededKeys = false;

  readonly totalPermissions = computed(() => this.groups().reduce((sum, group) => sum + group.permissions.length, 0));
  readonly totalChecked = computed(() => this.checkedKeys().size);

  constructor() {
    effect(() => {
      if (!this.loading() && !this.seededKeys) {
        this.checkedKeys.set(new Set(this.rolesData.getGrantedKeys(this.roleName)));
        this.seededKeys = true;
      }
    });
  }

  isChecked(key: string): boolean {
    return this.checkedKeys().has(key);
  }

  togglePermission(key: string, checked: boolean): void {
    this.checkedKeys.update((set) => {
      const next = new Set(set);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  groupCheckedCount(group: PermissionGroup): number {
    return group.permissions.filter((p) => this.isChecked(p.key)).length;
  }

  isGroupAllChecked(group: PermissionGroup): boolean {
    return group.permissions.every((p) => this.isChecked(p.key));
  }

  isGroupIndeterminate(group: PermissionGroup): boolean {
    const count = this.groupCheckedCount(group);
    return count > 0 && count < group.permissions.length;
  }

  toggleGroup(group: PermissionGroup, checked: boolean): void {
    this.checkedKeys.update((set) => {
      const next = new Set(set);
      for (const permission of group.permissions) {
        if (checked) {
          next.add(permission.key);
        } else {
          next.delete(permission.key);
        }
      }
      return next;
    });
  }

  readonly saving = signal(false);

  onSave(): void {
    this.saving.set(true);
    this.rolesData
      .setPermissions(this.roleName, this.checkedKeys())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Permissions Updated',
            detail: `Permissions for "${this.roleName}" were updated successfully.`,
          });
          this.router.navigate(['/system-administration/roles']);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: 'Something went wrong. Please try again later.',
          });
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/system-administration/roles']);
  }
}
