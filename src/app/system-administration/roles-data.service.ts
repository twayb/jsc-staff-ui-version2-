import { Injectable, signal } from '@angular/core';

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

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Recruitment',
    permissions: [
      { key: 'recruitment.permits.view', label: 'View Permits' },
      { key: 'recruitment.permits.manage', label: 'Manage Permits' },
      { key: 'recruitment.adverts.view', label: 'View Adverts' },
      { key: 'recruitment.adverts.manage', label: 'Manage Adverts' },
      { key: 'recruitment.applications.manage', label: 'Manage Applications' },
      { key: 'recruitment.interviews.manage', label: 'Manage Interview Management' },
      { key: 'recruitment.selection.manage', label: 'Manage Selection' },
      { key: 'recruitment.databank.view', label: 'View Databank' },
    ],
  },
  {
    name: 'User Administration',
    permissions: [
      { key: 'admin.users.view', label: 'View Users' },
      { key: 'admin.users.manage', label: 'Manage Users' },
      { key: 'admin.roles.manage', label: 'Manage Roles & Permissions' },
      { key: 'admin.audit.view', label: 'View Audit Trail' },
    ],
  },
  {
    name: 'Employee Management',
    permissions: [
      { key: 'employees.view', label: 'View Employees' },
      { key: 'employees.manage', label: 'Manage Employees' },
    ],
  },
  {
    name: 'Reports',
    permissions: [
      { key: 'reports.view', label: 'View Reports' },
      { key: 'reports.export', label: 'Export Reports' },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) => group.permissions.map((p) => p.key));

@Injectable({ providedIn: 'root' })
export class RolesDataService {
  private readonly _roles = signal<Role[]>([
    {
      name: 'HICT',
      description: 'Head of Information & Communication Technology — full system administration access.',
      usersCount: 1,
      permissionsCount: 0,
    },
    {
      name: 'DSE',
      description: 'Directorate of Secretariat and Establishment — recruitment and HR oversight.',
      usersCount: 1,
      permissionsCount: 0,
    },
    {
      name: 'DSR',
      description: 'Directorate of Standards and Regulation — compliance and audit access.',
      usersCount: 1,
      permissionsCount: 0,
    },
    {
      name: 'Complainant',
      description: 'External user submitting and tracking complaints.',
      usersCount: 0,
      permissionsCount: 0,
    },
    {
      name: 'Staff',
      description: 'Internal staff member with standard operational access.',
      usersCount: 1,
      permissionsCount: 0,
    },
    {
      name: 'Applicant',
      description: 'External applicant with access to their own application records.',
      usersCount: 0,
      permissionsCount: 0,
    },
  ]);

  private readonly _rolePermissions = signal<Record<string, Set<string>>>({
    HICT: new Set(ALL_PERMISSION_KEYS),
    DSE: new Set([
      'recruitment.permits.view',
      'recruitment.permits.manage',
      'recruitment.adverts.view',
      'recruitment.adverts.manage',
      'recruitment.applications.manage',
      'recruitment.interviews.manage',
      'recruitment.selection.manage',
      'admin.users.view',
      'employees.view',
      'employees.manage',
      'reports.view',
    ]),
    DSR: new Set([
      'recruitment.permits.view',
      'recruitment.databank.view',
      'admin.audit.view',
      'reports.view',
      'reports.export',
    ]),
    Complainant: new Set(['recruitment.adverts.view']),
    Staff: new Set(['recruitment.adverts.view', 'employees.view', 'reports.view']),
    Applicant: new Set(['recruitment.adverts.view']),
  });

  readonly roles = this._roles.asReadonly();

  constructor() {
    this._roles.update((list) =>
      list.map((role) => ({ ...role, permissionsCount: this.getGrantedKeys(role.name).size })),
    );
  }

  getRole(name: string): Role | undefined {
    return this._roles().find((role) => role.name === name);
  }

  getGrantedKeys(roleName: string): Set<string> {
    return this._rolePermissions()[roleName] ?? new Set();
  }

  setPermissions(roleName: string, keys: Set<string>): void {
    this._rolePermissions.update((map) => ({ ...map, [roleName]: keys }));
    this._roles.update((list) =>
      list.map((role) => (role.name === roleName ? { ...role, permissionsCount: keys.size } : role)),
    );
  }

  addRole(role: { name: string; description: string }): void {
    this._roles.update((list) => [{ ...role, usersCount: 0, permissionsCount: 0 }, ...list]);
  }

  updateRole(target: Role, changes: { name: string; description: string }): void {
    this._roles.update((list) => list.map((role) => (role === target ? { ...role, ...changes } : role)));

    if (target.name !== changes.name) {
      this._rolePermissions.update((map) => {
        const { [target.name]: keys, ...rest } = map;
        return { ...rest, [changes.name]: keys ?? new Set() };
      });
    }
  }
}
