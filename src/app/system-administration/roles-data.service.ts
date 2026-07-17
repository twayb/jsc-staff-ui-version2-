import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { RolesApiService } from '../core/auth/roles-api.service';

export interface Role {
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

// The roles/permissions endpoints haven't been verified against the real backend yet
// (unlike auth, which was tested live) — these mappers fall back across the likely
// key names so the screens degrade gracefully instead of breaking on a mismatch.
function permissionKey(raw: Record<string, unknown>): string {
  return (raw['key'] as string) ?? (raw['code'] as string) ?? (raw['name'] as string) ?? '';
}

function permissionLabel(raw: Record<string, unknown>): string {
  return (raw['label'] as string) ?? (raw['description'] as string) ?? permissionKey(raw);
}

function extractGrantedKeys(raw: Record<string, unknown>): Set<string> {
  const embedded =
    (raw['permissions'] as unknown[]) ??
    (raw['permissionKeys'] as unknown[]) ??
    (raw['grantedPermissions'] as unknown[]) ??
    [];

  return new Set(
    embedded.map((item) => (typeof item === 'string' ? item : permissionKey(item as Record<string, unknown>))),
  );
}

function mapRole(raw: Record<string, unknown>): Role {
  const grantedKeys = extractGrantedKeys(raw);
  return {
    name: (raw['name'] as string) ?? (raw['roleName'] as string) ?? '',
    description: (raw['description'] as string) ?? '',
    usersCount: (raw['usersCount'] as number) ?? (raw['userCount'] as number) ?? 0,
    permissionsCount: (raw['permissionsCount'] as number) ?? grantedKeys.size,
  };
}

function mapPermissionGroups(raw: Record<string, unknown>[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();

  for (const item of raw) {
    const groupName = (item['group'] as string) ?? (item['category'] as string) ?? 'Permissions';
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

  private readonly _roles = signal<Role[]>([]);
  private readonly _rolePermissions = signal<Record<string, Set<string>>>({});
  private readonly _permissionGroups = signal<PermissionGroup[]>([]);

  private readonly _rolesLoading = signal(true);
  private readonly _permissionsLoading = signal(true);

  readonly roles = this._roles.asReadonly();
  readonly permissionGroups = this._permissionGroups.asReadonly();
  readonly loading = computed(() => this._rolesLoading() || this._permissionsLoading());

  constructor() {
    this.rolesApi
      .getAllRoles()
      .pipe(finalize(() => this._rolesLoading.set(false)))
      .subscribe({
        next: (raw) => {
          const rows = (raw ?? []) as Record<string, unknown>[];
          this._roles.set(rows.map(mapRole));
          this._rolePermissions.set(
            Object.fromEntries(
              rows.map((row) => [(row['name'] as string) ?? (row['roleName'] as string) ?? '', extractGrantedKeys(row)]),
            ),
          );
        },
        error: () => {},
      });

    this.rolesApi
      .getPermissions()
      .pipe(finalize(() => this._permissionsLoading.set(false)))
      .subscribe({
        next: (raw) => this._permissionGroups.set(mapPermissionGroups((raw ?? []) as Record<string, unknown>[])),
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
        this._roles.update((list) => [{ ...role, usersCount: 0, permissionsCount: 0 }, ...list]);
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
