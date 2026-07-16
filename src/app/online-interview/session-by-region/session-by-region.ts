import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import {
  InterviewSetStatus,
  InterviewSetStatusSeverity,
  OnlineInterviewDataService,
  RegionSession,
} from '../online-interview-data.service';

type ViewMode = 'table' | 'card';
type StatusFilter = 'all' | 'ongoing' | 'pending' | 'completed';

const STATUS_FILTER_MAP: Record<Exclude<StatusFilter, 'all'>, InterviewSetStatus> = {
  ongoing: 'Ongoing',
  pending: 'Scheduled',
  completed: 'Completed',
};

@Component({
  selector: 'app-session-by-region',
  imports: [Tag, Button, AppBreadcrumb, AppDataTable, AppSkeleton],
  templateUrl: './session-by-region.html',
  styleUrl: './session-by-region.css',
})
export class SessionByRegion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems: MenuItem[] = this.interviewTitle
    ? [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Interview Session', routerLink: '/online-interview/interview-session' },
        { label: this.interviewTitle },
      ]
    : [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Session by Region' },
      ];

  readonly subtitle = this.interviewTitle
    ? `Regional breakdown for "${this.interviewTitle}"`
    : 'Live and scheduled online interview sessions grouped by region';

  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>('table');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
  ];

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  get regions(): RegionSession[] {
    return this.interviewData.regionSessions;
  }

  filteredRegions(): RegionSession[] {
    const filter = this.statusFilter();
    if (filter === 'all') {
      return this.regions;
    }
    return this.regions.filter((region) => region.status === STATUS_FILTER_MAP[filter]);
  }

  filterCount(filter: StatusFilter): number {
    if (filter === 'all') {
      return this.regions.length;
    }
    return this.regions.filter((region) => region.status === STATUS_FILTER_MAP[filter]).length;
  }

  submittedProgress(region: RegionSession): number {
    if (region.totalCandidates <= 0) {
      return 0;
    }
    return Math.round((region.submitted / region.totalCandidates) * 100);
  }

  statusSeverity(status: InterviewSetStatus): InterviewSetStatusSeverity {
    return this.interviewData.interviewStatusSeverity(status);
  }

  onView(region: RegionSession): void {
    this.router.navigate(['/online-interview/venue-session-by-region'], {
      queryParams: { id: this.interviewId, title: this.interviewTitle, region: region.region },
    });
  }
}
