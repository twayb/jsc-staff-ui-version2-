import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { Pending } from '../pending/pending';
import { Shortlist } from '../shortlist/shortlist';
import { NotShortlist } from '../not-shortlist/not-shortlist';
import { ApplicantStatus, LonglistApplicant, LonglistDataService } from '../longlist-data.service';

type ApplicantStatusSeverity = 'warn' | 'success' | 'danger';

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
  private readonly longlistData = inject(LonglistDataService);

  readonly referenceNo = this.route.snapshot.paramMap.get('referenceNo') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    { label: 'Applicant Assigned' },
  ];

  readonly activeTab = signal('assigned');
  readonly loading = signal(true);

  readonly applicants = this.longlistData.applicants;

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicantStatusSeverity(status: ApplicantStatus): ApplicantStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  onView(applicant: LonglistApplicant): void {
    this.router.navigate(['/recruitment/applications/assigned', this.referenceNo, 'applicant', applicant.nin]);
  }
}
