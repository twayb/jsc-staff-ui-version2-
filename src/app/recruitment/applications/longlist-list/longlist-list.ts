import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { LonglistDistribution } from '../longlist-distribution/longlist-distribution';
import { Shortlist } from '../shortlist/shortlist';
import { NotShortlist } from '../not-shortlist/not-shortlist';

type ApplicantStatus = 'Pending' | 'Shortlisted' | 'Not Shortlisted';
type ApplicantStatusSeverity = 'warn' | 'success' | 'danger';

interface LonglistedApplicant {
  name: string;
  nin: string;
  applicationDate: string;
  status: ApplicantStatus;
}

@Component({
  selector: 'app-longlist-list',
  imports: [
    Tag,
    Dialog,
    Button,
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
export class LonglistList implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly referenceNo = this.route.snapshot.paramMap.get('referenceNo') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    { label: 'Longlist' },
  ];

  readonly activeTab = signal('longlist');
  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicants: LonglistedApplicant[] = [
    { name: 'Amina Hassan', nin: '19990531111020000125', applicationDate: '2026-01-15', status: 'Pending' },
    { name: 'John Mwangi', nin: '19900023456780000234', applicationDate: '2026-01-16', status: 'Shortlisted' },
    { name: 'Grace Kileo', nin: '19881034567890000345', applicationDate: '2026-01-18', status: 'Not Shortlisted' },
    { name: 'Peter Mushi', nin: '19921045678900000456', applicationDate: '2026-01-20', status: 'Pending' },
    { name: 'Fatma Salim', nin: '19870056789010000567', applicationDate: '2026-01-22', status: 'Pending' },
  ];

  showViewDialog = false;
  viewingApplicant: LonglistedApplicant | null = null;

  applicantStatusSeverity(status: ApplicantStatus): ApplicantStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  onView(applicant: LonglistedApplicant): void {
    this.viewingApplicant = applicant;
    this.showViewDialog = true;
  }
}
