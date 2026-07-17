import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuditLogEntry } from '../core/audit/audit-log.types';
import { RecruitmentAuditApiService } from '../core/audit/recruitment-audit-api.service';
import { ComplaintsAuditApiService } from '../core/audit/complaints-audit-api.service';
import { SysadminAuditApiService } from '../core/audit/sysadmin-audit-api.service';

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

function mapAuditLog(raw: AuditLogEntry, category: AuditCategory): AuditEvent {
  return {
    user: raw.username,
    ipAddress: raw.ipAddress,
    time: raw.timestamp.replace('T', ' ').slice(0, 16),
    method: (raw.method as HttpMethod) ?? 'GET',
    resource: raw.resource,
    category,
  };
}

@Injectable({ providedIn: 'root' })
export class AuditDataService {
  private readonly recruitmentAuditApi = inject(RecruitmentAuditApiService);
  private readonly complaintsAuditApi = inject(ComplaintsAuditApiService);
  private readonly sysadminAuditApi = inject(SysadminAuditApiService);

  private readonly _events = signal<AuditEvent[]>([]);
  private readonly _recruitmentLoading = signal(true);
  private readonly _complaintsLoading = signal(true);
  private readonly _sysadminLoading = signal(true);

  readonly events = this._events.asReadonly();
  readonly loading = computed(
    () => this._recruitmentLoading() || this._complaintsLoading() || this._sysadminLoading(),
  );

  constructor() {
    this.recruitmentAuditApi
      .getAuditLogs()
      .pipe(finalize(() => this._recruitmentLoading.set(false)))
      .subscribe({
        next: (response) => {
          const entries = (response.data?.content ?? []).map((entry) => mapAuditLog(entry, 'recruitment'));
          this._events.update((list) => [...entries, ...list]);
        },
        error: () => {},
      });

    this.complaintsAuditApi
      .getAuditLogs()
      .pipe(finalize(() => this._complaintsLoading.set(false)))
      .subscribe({
        next: (response) => {
          const entries = (response.data?.content ?? []).map((entry) => mapAuditLog(entry, 'complaints'));
          this._events.update((list) => [...entries, ...list]);
        },
        error: () => {},
      });

    this.sysadminAuditApi
      .getAuditLogs()
      .pipe(finalize(() => this._sysadminLoading.set(false)))
      .subscribe({
        next: (response) => {
          const entries = (response.data?.content ?? []).map((entry) => mapAuditLog(entry, 'system-admin'));
          this._events.update((list) => [...entries, ...list]);
        },
        error: () => {},
      });
  }
}
