import { Injectable, signal } from '@angular/core';

export type AuditCategory = 'recruitment' | 'complaints' | 'system-admin';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type HttpMethodSeverity = 'info' | 'success' | 'warn' | 'danger';

export interface AuditEvent {
  user: string;
  ipAddress: string;
  time: string;
  method: HttpMethod;
  resource: string;
  category: AuditCategory;
}

export const CATEGORY_META: Record<AuditCategory, { label: string; subtitle: string }> = {
  recruitment: {
    label: 'Recruitment Audits',
    subtitle: 'Activity log for permits, adverts, applications & selection',
  },
  complaints: {
    label: 'Complaints Audit',
    subtitle: 'Activity log for the complaints module',
  },
  'system-admin': {
    label: 'System Admin Audits',
    subtitle: 'Activity log for users, roles & system administration',
  },
};

export function auditMethodSeverity(method: HttpMethod): HttpMethodSeverity {
  switch (method) {
    case 'GET':
      return 'info';
    case 'POST':
      return 'success';
    case 'PUT':
      return 'warn';
    case 'DELETE':
      return 'danger';
  }
}

const ALL_EVENTS: AuditEvent[] = [
  {
    user: 'Amina Hassan',
    ipAddress: '196.216.53.14',
    time: '2026-07-14 09:12',
    method: 'PUT',
    resource: '/api/recruitment/permits/PR-2026-001/approve',
    category: 'recruitment',
  },
  {
    user: 'John Mwangi',
    ipAddress: '105.160.22.8',
    time: '2026-07-13 16:45',
    method: 'PUT',
    resource: '/api/recruitment/adverts/ADV-2026-002',
    category: 'recruitment',
  },
  {
    user: 'Grace Kileo',
    ipAddress: '41.59.107.33',
    time: '2026-07-13 10:20',
    method: 'POST',
    resource: '/api/recruitment/selection/ADV-2026-003/shortlist',
    category: 'recruitment',
  },
  {
    user: 'Fatma Salim',
    ipAddress: '196.192.34.11',
    time: '2026-07-14 11:05',
    method: 'POST',
    resource: '/api/complaints',
    category: 'complaints',
  },
  {
    user: 'Peter Mushi',
    ipAddress: '154.118.22.6',
    time: '2026-07-12 15:40',
    method: 'PUT',
    resource: '/api/complaints/CMP-2026-009/resolve',
    category: 'complaints',
  },
  {
    user: 'Juma Kessy',
    ipAddress: '197.186.15.42',
    time: '2026-07-11 09:00',
    method: 'PUT',
    resource: '/api/complaints/CMP-2026-011/escalate',
    category: 'complaints',
  },
  {
    user: 'Grace Kileo',
    ipAddress: '41.59.107.33',
    time: '2026-07-13 08:02',
    method: 'POST',
    resource: '/api/auth/authenticate',
    category: 'system-admin',
  },
  {
    user: 'System',
    ipAddress: '127.0.0.1',
    time: '2026-07-12 23:00',
    method: 'POST',
    resource: '/api/system/backup',
    category: 'system-admin',
  },
  {
    user: 'Amina Hassan',
    ipAddress: '196.216.53.14',
    time: '2026-07-14 09:30',
    method: 'PUT',
    resource: '/api/admin/users/grace.kileo/lock',
    category: 'system-admin',
  },
  {
    user: 'HICT Admin',
    ipAddress: '10.10.4.2',
    time: '2026-07-14 10:15',
    method: 'PUT',
    resource: '/api/admin/roles/DSE/permissions',
    category: 'system-admin',
  },
];

@Injectable({ providedIn: 'root' })
export class AuditDataService {
  private readonly _events = signal<AuditEvent[]>(ALL_EVENTS);

  readonly events = this._events.asReadonly();
}
