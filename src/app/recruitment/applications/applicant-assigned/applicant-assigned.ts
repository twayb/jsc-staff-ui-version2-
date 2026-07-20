import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { Pending } from '../pending/pending';
import { Shortlist } from '../shortlist/shortlist';
import { NotShortlist } from '../not-shortlist/not-shortlist';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { ApplicationDetailRecord } from '../../../core/recruitment/applicant-preview-api.service';

type ApplicantStatus = 'Pending' | 'Shortlisted' | 'Not Shortlisted';
type ApplicantStatusSeverity = 'warn' | 'success' | 'danger';

interface AssignedApplicant {
  applicationId: string;
  name: string;
  nin: string;
  applicationDate: string;
  status: ApplicantStatus;
}

function statusFromShortlisted(shortlisted: ApplicationDetailRecord['shortlisted']): ApplicantStatus {
  if (shortlisted === 'SHORTLISTED') return 'Shortlisted';
  if (shortlisted === 'NOT_SHORTLISTED') return 'Not Shortlisted';
  return 'Pending';
}

function mapAssigned(record: ApplicationDetailRecord): AssignedApplicant {
  return {
    applicationId: record.id,
    name: record.applicant.fullName,
    nin: record.applicant.nin,
    applicationDate: record.createdAt?.slice(0, 10) ?? '',
    status: statusFromShortlisted(record.shortlisted),
  };
}

@Component({
  selector: 'app-applicant-assigned',
  imports: [
    Tag,
    Tooltip,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AppBreadcrumb,
    AppDataTable,
    Pending,
    Shortlist,
    NotShortlist,
  ],
  templateUrl: './applicant-assigned.html',
  styleUrl: './applicant-assigned.css',
})
export class ApplicantAssigned implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);
  private readonly longlistApi = inject(LonglistApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    { label: 'Applicant Assigned' },
  ];

  readonly activeTab = signal('assigned');
  readonly loading = signal(true);
  readonly advertName = signal<string | null>(null);

  readonly applicants = signal<AssignedApplicant[]>([]);

  ngOnInit(): void {
    this.advertApi.getAdvert(Number(this.advertId)).subscribe({
      next: (response) => this.advertName.set(response.data?.advertName ?? null),
      error: () => {},
    });

    this.loading.set(true);
    this.longlistApi
      .getOfficerApplications(Number(this.advertId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applicants.set((response.data?.content ?? []).map(mapAssigned));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Applicants',
            detail: 'Could not load the assigned applicants. Please try again later.',
          });
        },
      });
  }

  applicantStatusSeverity(status: ApplicantStatus): ApplicantStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  onView(applicant: AssignedApplicant): void {
    this.router.navigate([
      '/recruitment/applications/assigned',
      this.advertId,
      'applicant',
      applicant.applicationId,
    ]);
  }
}
