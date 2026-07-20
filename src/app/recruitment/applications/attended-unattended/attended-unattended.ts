import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { titleCase } from '../../../core/utils';
import { LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { ApplicationDetailRecord } from '../../../core/recruitment/applicant-preview-api.service';
import { UserManagementService } from '../../../core/auth/user-management.service';

type AttendanceStatus = 'Shortlisted' | 'Not Shortlisted' | 'Pending';
type AttendanceStatusSeverity = 'success' | 'danger' | 'warn';

interface AttendanceApplicant {
  applicationId: string;
  name: string;
  gender: string;
  address: string;
  status: AttendanceStatus;
}

function statusFromShortlisted(shortlisted: ApplicationDetailRecord['shortlisted']): AttendanceStatus {
  if (shortlisted === 'SHORTLISTED') return 'Shortlisted';
  if (shortlisted === 'NOT_SHORTLISTED') return 'Not Shortlisted';
  return 'Pending';
}

function mapAttendanceRow(record: ApplicationDetailRecord): AttendanceApplicant {
  return {
    applicationId: record.id,
    name: record.applicant.fullName,
    gender: titleCase(record.applicant.gender),
    address: record.applicant.address,
    status: statusFromShortlisted(record.shortlisted),
  };
}

@Component({
  selector: 'app-attended-unattended',
  imports: [Tag, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel, AppBreadcrumb, AppDataTable],
  templateUrl: './attended-unattended.html',
  styleUrl: './attended-unattended.css',
})
export class AttendedUnattended implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly longlistApi = inject(LonglistApiService);
  private readonly userManagementApi = inject(UserManagementService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly panel = this.route.snapshot.paramMap.get('panel') ?? '';

  readonly staffName = signal(this.panel);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    { label: 'Longlist', routerLink: ['/recruitment/applications/longlist', this.advertId] },
    { label: 'Attend' },
  ];

  readonly activeTab = signal('attended');
  readonly loading = signal(true);

  readonly attended = signal<AttendanceApplicant[]>([]);
  readonly unattended = signal<AttendanceApplicant[]>([]);

  ngOnInit(): void {
    if (this.panel) {
      // GET /users/{id} currently 500s server-side (ambiguous with the /users/{roleName} route),
      // so look the name up from the staff list instead — same source the distribution table uses.
      this.userManagementApi.getStaffUsersByType('STAFF').subscribe({
        next: (response) => {
          const match = (response.data ?? []).find((user) => user.id === this.panel);
          if (match) {
            this.staffName.set(match.name);
          }
        },
      });
    }

    this.loading.set(true);
    const advertId = Number(this.advertId);
    forkJoin({
      attended: this.longlistApi.getOfficerAttended(advertId, this.panel),
      unattended: this.longlistApi.getOfficerApplicationsPending(advertId),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ attended, unattended }) => {
          this.attended.set((attended.data?.content ?? []).map(mapAttendanceRow));
          this.unattended.set((unattended.data?.content ?? []).map(mapAttendanceRow));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load',
            detail: 'Could not load the attended/unattended applicants. Please try again later.',
          });
        },
      });
  }

  attendanceStatusSeverity(status: AttendanceStatus): AttendanceStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  onView(applicant: AttendanceApplicant): void {
    this.router.navigate(['/recruitment/applications/longlist', this.advertId, 'applicant', applicant.applicationId]);
  }
}
