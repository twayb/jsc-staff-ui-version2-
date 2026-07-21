import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import {
  QuestionBankApiService,
  VenueSessionRecord,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type ViewMode = 'table' | 'card';

interface VenueRow {
  venueId: number;
  name: string;
  totalCandidates: number;
  notStarted: number;
  inProgress: number;
  finished: number;
}

interface VenueSessionSummary {
  advertName: string;
  interviewTypeName: string;
  totalApplicants: number;
  notStarted: number;
  inProgress: number;
  finished: number;
}

function mapVenue(record: VenueSessionRecord): VenueRow {
  return {
    venueId: record.venueId,
    name: record.venueName,
    totalCandidates: record.totalApplicants,
    notStarted: record.notStarted,
    inProgress: record.inProgress,
    finished: record.finished,
  };
}

@Component({
  selector: 'app-venue-session-by-region',
  imports: [Button, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './venue-session-by-region.html',
  styleUrl: './venue-session-by-region.css',
})
export class VenueSessionByRegion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';
  readonly regionId = Number(this.route.snapshot.queryParamMap.get('regionId'));
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly advertId = Number(this.route.snapshot.queryParamMap.get('advertId'));
  readonly interviewTypeId = Number(this.route.snapshot.queryParamMap.get('interviewTypeId'));

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

  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>('table');
  readonly summary = signal<VenueSessionSummary | null>(null);
  readonly venues = signal<VenueRow[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getSessionVenues(this.regionId, this.advertId, this.interviewTypeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.data) {
            return;
          }
          this.summary.set({
            advertName: response.data.advertName,
            interviewTypeName: titleCase(response.data.interviewTypeName),
            totalApplicants: response.data.totalApplicants,
            notStarted: response.data.notStarted,
            inProgress: response.data.inProgress,
            finished: response.data.finished,
          });
          this.venues.set(response.data.interviewVenues.map(mapVenue));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Venues',
            detail: 'Could not load venues for this region. Please try again later.',
          });
        },
      });
  }

  overallCompletion(): number {
    const summary = this.summary();
    if (!summary || summary.totalApplicants <= 0) {
      return 0;
    }
    return Math.round((summary.finished / summary.totalApplicants) * 100);
  }

  finishedProgress(venue: VenueRow): number {
    if (venue.totalCandidates <= 0) {
      return 0;
    }
    return Math.round((venue.finished / venue.totalCandidates) * 100);
  }

  onView(venue: VenueRow): void {
    this.router.navigate(['/online-interview/interview-session-by-venue'], {
      queryParams: {
        id: this.interviewId,
        title: this.interviewTitle,
        venueId: venue.venueId,
        venue: venue.name,
        region: this.region,
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
      },
    });
  }
}
