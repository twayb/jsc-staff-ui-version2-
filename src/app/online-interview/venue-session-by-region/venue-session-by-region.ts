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
  VenueSession,
} from '../online-interview-data.service';

type ViewMode = 'table' | 'card';
type StatusFilter = 'all' | 'ongoing' | 'pending' | 'completed';
type VenueStatus = 'Ongoing' | 'Scheduled' | 'Completed';

const STATUS_FILTER_MAP: Record<Exclude<StatusFilter, 'all'>, VenueStatus> = {
  ongoing: 'Ongoing',
  pending: 'Scheduled',
  completed: 'Completed',
};

@Component({
  selector: 'app-venue-session-by-region',
  imports: [Tag, Button, AppBreadcrumb, AppDataTable, AppSkeleton],
  templateUrl: './venue-session-by-region.html',
  styleUrl: './venue-session-by-region.css',
})
export class VenueSessionByRegion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';

  readonly breadcrumbItems: MenuItem[] = this.interviewTitle
    ? [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Interview Session', routerLink: '/online-interview/interview-session' },
        {
          label: this.interviewTitle,
          routerLink: '/online-interview/session-by-region',
          queryParams: { id: this.interviewId, title: this.interviewTitle },
        },
        { label: this.region },
      ]
    : [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Session by Region', routerLink: '/online-interview/session-by-region' },
        { label: this.region },
      ];

  readonly subtitle = this.region
    ? `Venues in ${this.region}${this.interviewTitle ? ' — ' + this.interviewTitle : ''}`
    : 'Live and scheduled online interview sessions grouped by venue';

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

  get venues(): VenueSession[] {
    return this.interviewData.venueSessions;
  }

  venueStatus(venue: VenueSession): VenueStatus {
    if (venue.totalApplicants > 0 && venue.finished >= venue.totalApplicants) {
      return 'Completed';
    }
    if (venue.inProgress > 0 || venue.finished > 0) {
      return 'Ongoing';
    }
    return 'Scheduled';
  }

  venueStatusSeverity(venue: VenueSession): InterviewSetStatusSeverity {
    return this.interviewData.interviewStatusSeverity(this.venueStatus(venue) as InterviewSetStatus);
  }

  filteredVenues(): VenueSession[] {
    const filter = this.statusFilter();
    if (filter === 'all') {
      return this.venues;
    }
    return this.venues.filter((venue) => this.venueStatus(venue) === STATUS_FILTER_MAP[filter]);
  }

  filterCount(filter: StatusFilter): number {
    if (filter === 'all') {
      return this.venues.length;
    }
    return this.venues.filter((venue) => this.venueStatus(venue) === STATUS_FILTER_MAP[filter]).length;
  }

  finishedProgress(venue: VenueSession): number {
    if (venue.totalApplicants <= 0) {
      return 0;
    }
    return Math.round((venue.finished / venue.totalApplicants) * 100);
  }

  onView(venue: VenueSession): void {
    this.router.navigate(['/online-interview/interview-session-by-venue'], {
      queryParams: {
        id: this.interviewId,
        title: this.interviewTitle,
        region: this.region,
        venue: venue.venue,
      },
    });
  }
}
