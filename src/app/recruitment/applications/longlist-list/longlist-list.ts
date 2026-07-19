import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { LonglistDistribution } from '../longlist-distribution/longlist-distribution';
import { Shortlist } from '../shortlist/shortlist';
import { NotShortlist } from '../not-shortlist/not-shortlist';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { ApplicationRecord, LonglistApiService } from '../../../core/recruitment/longlist-api.service';

type ApplicantStatus = 'Pending' | 'Shortlisted' | 'Not Shortlisted';
type ApplicantStatusSeverity = 'warn' | 'success' | 'danger';

interface LonglistApplicantRow {
  applicationId: string;
  name: string;
  nin: string;
  applicationDate: string;
  status: ApplicantStatus;
}

function statusFromShortlisted(shortlisted: ApplicationRecord['shortlisted']): ApplicantStatus {
  if (shortlisted === 'SHORTLISTED') return 'Shortlisted';
  if (shortlisted === 'NOT_SHORTLISTED') return 'Not Shortlisted';
  return 'Pending';
}

function mapApplicant(raw: ApplicationRecord): LonglistApplicantRow {
  return {
    applicationId: raw.applicationId,
    name: raw.applicantName,
    nin: raw.nin,
    applicationDate: raw.applicationDate.slice(0, 10),
    status: statusFromShortlisted(raw.shortlisted),
  };
}

@Component({
  selector: 'app-longlist-list',
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
    LonglistDistribution,
    Shortlist,
    NotShortlist,
  ],
  templateUrl: './longlist-list.html',
  styleUrl: './longlist-list.css',
})
export class LonglistList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly advertApi = inject(AdvertApiService);
  private readonly longlistApi = inject(LonglistApiService);
  private readonly messageService = inject(MessageService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    { label: 'Longlist' },
  ];

  readonly activeTab = signal('longlist');
  readonly loading = signal(true);
  readonly advertName = signal<string | null>(null);

  applicants: LonglistApplicantRow[] = [];

  constructor() {
    const advertId = Number(this.advertId);

    this.advertApi.getAdvert(advertId).subscribe({
      next: (response) => this.advertName.set(response.data?.advertName ?? null),
      error: () => {},
    });

    this.loading.set(true);
    this.longlistApi
      .getLonglist(advertId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applicants = (response.data?.content ?? []).map(mapApplicant);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Longlist',
            detail: 'Could not load the longlisted applicants. Please try again later.',
          });
        },
      });
  }

  applicantStatusSeverity(status: ApplicantStatus): ApplicantStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  onView(applicant: LonglistApplicantRow): void {
    this.router.navigate(['/recruitment/applications/longlist', this.advertId, 'applicant', applicant.applicationId]);
  }
}
