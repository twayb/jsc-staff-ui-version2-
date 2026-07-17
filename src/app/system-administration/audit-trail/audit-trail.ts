import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { AuditCategory, AuditDataService, AuditEvent, CATEGORY_META, auditMethodSeverity } from '../audit-data.service';

@Component({
  selector: 'app-audit-trail',
  imports: [AppBreadcrumb, AppDataTable, Tag, Dialog, Button],
  templateUrl: './audit-trail.html',
  styleUrl: './audit-trail.css',
})
export class AuditTrail {
  private readonly route = inject(ActivatedRoute);
  private readonly auditData = inject(AuditDataService);

  readonly category = toSignal(
    this.route.paramMap.pipe(map((params) => (params.get('category') as AuditCategory) ?? 'recruitment')),
    { initialValue: (this.route.snapshot.paramMap.get('category') as AuditCategory) ?? 'recruitment' },
  );

  readonly meta = computed(() => CATEGORY_META[this.category()]);

  readonly breadcrumbItems = computed<MenuItem[]>(() => [
    { label: 'System Administration', routerLink: '/system-administration' },
    { label: this.meta().label },
  ]);

  readonly loading = this.auditData.loading;

  readonly events = computed(() =>
    this.auditData.events().filter((event) => event.category === this.category()),
  );

  showViewDialog = false;
  viewingEvent: AuditEvent | null = null;

  onView(event: AuditEvent): void {
    this.viewingEvent = event;
    this.showViewDialog = true;
  }

  readonly methodSeverity = auditMethodSeverity;
}
