import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { RolesApiService } from '../core/auth/roles-api.service';
import { UserManagementService } from '../core/auth/user-management.service';

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissionsCount: number;
}

export interface Permission {
  key: string;
  label: string;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

// GET /uaa/roles embeds each role's full permission objects ({ code, name, serviceName, ... }),
// keyed by `code` and grouped by `serviceName`. The API has no per-role user count.
function permissionKey(raw: Record<string, unknown>): string {
  return (raw['code'] as string) ?? '';
}

function permissionLabel(raw: Record<string, unknown>): string {
  return (raw['name'] as string) ?? permissionKey(raw);
}

function extractGrantedKeys(raw: Record<string, unknown>): Set<string> {
  const embedded = (raw['permissions'] as Record<string, unknown>[]) ?? [];
  return new Set(embedded.map((item) => permissionKey(item)));
}

function mapRole(raw: Record<string, unknown>): Role {
  const grantedKeys = extractGrantedKeys(raw);
  return {
    id: (raw['id'] as string) ?? '',
    name: (raw['roleName'] as string) ?? '',
    description: (raw['description'] as string) ?? '',
    usersCount: 0,
    permissionsCount: grantedKeys.size,
  };
}

function countUsersByRole(users: { roles?: { roleName: string }[] }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const user of users) {
    for (const role of user.roles ?? []) {
      counts[role.roleName] = (counts[role.roleName] ?? 0) + 1;
    }
  }
  return counts;
}

function mapPermissionGroups(raw: Record<string, unknown>[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();

  for (const item of raw) {
    const groupName = (item['serviceName'] as string) ?? 'Permissions';
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push({ key: permissionKey(item), label: permissionLabel(item) });
  }

  return Array.from(groups.entries()).map(([name, permissions]) => ({ name, permissions }));
}

@Injectable({ providedIn: 'root' })
export class RolesDataService {
  private readonly rolesApi = inject(RolesApiService);
  private readonly userManagementApi = inject(UserManagementService);

  private readonly _roles = signal<Role[]>([]);
  private readonly _rolePermissions = signal<Record<string, Set<string>>>({});
  private readonly _permissionGroups = signal<PermissionGroup[]>([]);

  private readonly _rolesLoading = signal(true);
  private readonly _permissionsLoading = signal(true);
  private readonly _usersLoading = signal(true);

  // Populated whenever the users list resolves; applied to _roles on arrival from either source,
  // since /uaa/roles and /uaa/users load independently and either can resolve first.
  private userCountsByRole: Record<string, number> = {};

  readonly roles = this._roles.asReadonly();
  readonly permissionGroups = this._permissionGroups.asReadonly();
  readonly loading = computed(() => this._rolesLoading() || this._permissionsLoading() || this._usersLoading());

  constructor() {
    this.rolesApi
      .getAllRoles()
      .pipe(finalize(() => this._rolesLoading.set(false)))
      .subscribe({
        next: (response) => {
          const rows = (response.data ?? []) as Record<string, unknown>[];
          this._roles.set(
            rows.map((row) => {
              const role = mapRole(row);
              return { ...role, usersCount: this.userCountsByRole[role.name] ?? 0 };
            }),
          );
          this._rolePermissions.set(
            Object.fromEntries(rows.map((row) => [(row['roleName'] as string) ?? '', extractGrantedKeys(row)])),
          );
        },
        error: () => {},
      });

    this.rolesApi
      .getPermissions()
      .pipe(finalize(() => this._permissionsLoading.set(false)))
      .subscribe({
        next: (response) => this._permissionGroups.set(mapPermissionGroups((response.data ?? []) as Record<string, unknown>[])),
        error: () => {},
      });

    this.userManagementApi
      .getStaffUsers()
      .pipe(finalize(() => this._usersLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.userCountsByRole = countUsersByRole(response.data ?? []);
          this._roles.update((list) =>
            list.map((role) => ({ ...role, usersCount: this.userCountsByRole[role.name] ?? 0 })),
          );
        },
        error: () => {},
      });
  }

  getRole(name: string): Role | undefined {
    return this._roles().find((role) => role.name === name);
  }

  getGrantedKeys(roleName: string): Set<string> {
    return this._rolePermissions()[roleName] ?? new Set();
  }

  setPermissions(roleName: string, keys: Set<string>): Observable<unknown> {
    return this.rolesApi.updateRoleWithPermissions({ role: roleName, permissions: Array.from(keys) }).pipe(
      tap(() => {
        this._rolePermissions.update((map) => ({ ...map, [roleName]: keys }));
        this._roles.update((list) =>
          list.map((role) => (role.name === roleName ? { ...role, permissionsCount: keys.size } : role)),
        );
      }),
    );
  }

  addRole(role: { name: string; description: string }): Observable<unknown> {
    return this.rolesApi.saveRole(role).pipe(
      tap(() => {
        this._roles.update((list) => [{ ...role, id: '', usersCount: 0, permissionsCount: 0 }, ...list]);
      }),
    );
  }

  updateRole(target: Role, changes: { name: string; description: string }): Observable<unknown> {
    return this.rolesApi.updateRole({ originalName: target.name, ...changes }).pipe(
      tap(() => {
        this._roles.update((list) => list.map((role) => (role === target ? { ...role, ...changes } : role)));

        if (target.name !== changes.name) {
          this._rolePermissions.update((map) => {
            const { [target.name]: keys, ...rest } = map;
            return { ...rest, [changes.name]: keys ?? new Set() };
          });
        }
      }),
    );
  }
}
