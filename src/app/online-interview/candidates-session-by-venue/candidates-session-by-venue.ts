import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import {
  QuestionBankApiService,
  SessionCandidateRecord,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type ViewMode = 'table' | 'card';

interface CandidateRow {
  name: string;
  interviewNumber: string;
}

interface Kpi {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
}

function mapCandidate(record: SessionCandidateRecord): CandidateRow {
  return {
    name: titleCase(record.applicantName),
    interviewNumber: record.interviewNumber,
  };
}

@Component({
  selector: 'app-candidates-session-by-venue',
  imports: [AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './candidates-session-by-venue.html',
  styleUrl: './candidates-session-by-venue.css',
})
export class CandidatesSessionByVenue implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly venue = this.route.snapshot.queryParamMap.get('venue') ?? '';
  readonly session = this.route.snapshot.queryParamMap.get('session') ?? '';
  readonly venueId = Number(this.route.snapshot.queryParamMap.get('venueId'));
  readonly advertId = Number(this.route.snapshot.queryParamMap.get('advertId'));
  readonly interviewTypeId = Number(this.route.snapshot.queryParamMap.get('interviewTypeId'));
  readonly sessionNumber = Number(this.route.snapshot.queryParamMap.get('sessionNumber'));

  readonly breadcrumbItems: MenuItem[] = this.interviewTitle
    ? [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Interview Session', routerLink: '/online-interview/interview-session' },
        {
          label: this.interviewTitle,
          routerLink: '/online-interview/session-by-region',
          queryParams: { id: this.interviewId, title: this.interviewTitle },
        },
        {
          label: this.region,
          routerLink: '/online-interview/venue-session-by-region',
          queryParams: { id: this.interviewId, title: this.interviewTitle, region: this.region },
        },
        {
          label: this.venue,
          routerLink: '/online-interview/interview-session-by-venue',
          queryParams: { id: this.interviewId, title: this.interviewTitle, region: this.region, venue: this.venue },
        },
        { label: this.session },
      ]
    : [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Interview Session by Venue', routerLink: '/online-interview/interview-session-by-venue' },
        { label: this.session },
      ];

  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>('table');
  readonly candidates = signal<CandidateRow[]>([]);

  // Not Started / In Progress / Finished / Exited Fullscreen are UI placeholders only —
  // the candidates-by-session endpoint doesn't return exam-progress data yet. Wire these
  // up to real values once that endpoint exists.
  readonly kpis = computed<Kpi[]>(() => [
    { label: 'Total', value: this.candidates().length, icon: 'pi-users', bgClass: 'bg-primary/10', fgClass: 'text-primary' },
    { label: 'Not Started', value: 0, icon: 'pi-clock', bgClass: 'bg-row-b', fgClass: 'text-value' },
    { label: 'In Progress', value: 0, icon: 'pi-spinner', bgClass: 'bg-warning-bg', fgClass: 'text-warning' },
    { label: 'Finished', value: 0, icon: 'pi-check-circle', bgClass: 'bg-success-bg', fgClass: 'text-success' },
    { label: 'Exited Fullscreen', value: 0, icon: 'pi-external-link', bgClass: 'bg-danger-bg', fgClass: 'text-danger' },
  ]);

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getCandidatesBySession({
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
        venueId: this.venueId,
        sessionNumber: this.sessionNumber,
      })
      .subscribe({
        next: (response) => {
          this.candidates.set((response.data ?? []).map(mapCandidate));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Candidates',
            detail: 'Could not load candidates for this session. Please try again later.',
          });
        },
      });
  }
}
