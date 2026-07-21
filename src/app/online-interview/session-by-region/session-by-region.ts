import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { QuestionBankApiService } from '../../core/question-bank/question-bank-api.service';
import { RegionApiService } from '../../core/masterdata/region-api.service';
import { CountUp } from '../../shared/count-up.directive';
import { titleCase } from '../../core/utils';

type ViewMode = 'table' | 'card';
type SessionStatus = 'Scheduled' | 'Ongoing' | 'Completed';
type SessionStatusSeverity = 'warn' | 'success' | 'secondary';

interface RegionSessionRow {
  regionId: number;
  region: string;
  totalVenues: number;
  totalCandidates: number;
  submittedCandidates: number;
  completion: number;
}

interface SessionSummary {
  advertId: number;
  advertName: string;
  interviewTypeId: number;
  interviewTypeName: string;
  status: SessionStatus;
  totalRegion: number;
  totalVenue: number;
  totalInterviews: number;
  totalSubmitted: number;
}

function deriveStatus(startDateTime: string, endDateTime: string): SessionStatus {
  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  if (now < start) {
    return 'Scheduled';
  }
  if (now > end) {
    return 'Completed';
  }
  return 'Ongoing';
}

@Component({
  selector: 'app-session-by-region',
  imports: [Tag, Button, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './session-by-region.html',
  styleUrl: './session-by-region.css',
})
export class SessionByRegion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);
  private readonly regionApi = inject(RegionApiService);

  readonly interviewId = Number(this.route.snapshot.queryParamMap.get('id'));
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

  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>('table');
  readonly summary = signal<SessionSummary | null>(null);
  readonly regions = signal<RegionSessionRow[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      byRegion: this.questionBankApi.getInterviewSessionByRegion(this.interviewId),
      setup: this.questionBankApi.getInterviewSetupById(this.interviewId),
      regions: this.regionApi.getRegions(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ byRegion, setup, regions }) => {
          if (!byRegion.data || !setup.data) {
            return;
          }
          const regionNamesById = new Map(regions.data?.map((region) => [region.id, region.name]) ?? []);
          const status = deriveStatus(setup.data.startDateTime, setup.data.endDateTime);

          this.summary.set({
            advertId: byRegion.data.advertId,
            advertName: byRegion.data.advertName,
            interviewTypeId: byRegion.data.interviewTypeId,
            interviewTypeName: titleCase(byRegion.data.interviewTypeName),
            status,
            totalRegion: byRegion.data.totalRegion,
            totalVenue: byRegion.data.totalVenue,
            totalInterviews: byRegion.data.totalInterviews,
            totalSubmitted: byRegion.data.totalSubmitted,
          });

          this.regions.set(
            byRegion.data.sessionByRegion.map((record) => ({
              regionId: record.regionId,
              region: regionNamesById.get(record.regionId) ?? `Region ${record.regionId}`,
              totalVenues: record.totalVenus,
              totalCandidates: record.totalInterviewVenues,
              submittedCandidates: record.totalSubmittedVenues,
              completion: record.completion,
            })),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Sessions',
            detail: 'Could not load the regional session breakdown. Please try again later.',
          });
        },
      });
  }

  overallCompletion(): number {
    const summary = this.summary();
    if (!summary || summary.totalInterviews <= 0) {
      return 0;
    }
    return Math.round((summary.totalSubmitted / summary.totalInterviews) * 100);
  }

  statusSeverity(status: SessionStatus): SessionStatusSeverity {
    if (status === 'Ongoing') {
      return 'success';
    }
    if (status === 'Scheduled') {
      return 'warn';
    }
    return 'secondary';
  }

  onView(region: RegionSessionRow): void {
    const summary = this.summary();
    this.router.navigate(['/online-interview/venue-session-by-region'], {
      queryParams: {
        id: this.interviewId,
        title: this.interviewTitle,
        regionId: region.regionId,
        region: region.region,
        advertId: summary?.advertId ?? null,
        interviewTypeId: summary?.interviewTypeId ?? null,
      },
    });
  }
}
