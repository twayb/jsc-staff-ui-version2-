import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import {
  QuestionBankApiService,
  VenueSessionSlotRecord,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type ViewMode = 'table' | 'card';

interface SessionRow {
  sessionNumber: number;
  totalApplicants: number;
  notStarted: number;
  inProgress: number;
  finished: number;
  accessCode: string | null;
  generatingCode: boolean;
}

interface SessionsSummary {
  advertName: string;
  interviewTypeName: string;
  notStarted: number;
  inProgress: number;
  finished: number;
  totalApplicants: number;
}

function mapSession(record: VenueSessionSlotRecord): SessionRow {
  return {
    sessionNumber: record.sessionNumber,
    totalApplicants: record.totalApplicants,
    notStarted: record.notStarted,
    inProgress: record.inProgress,
    finished: record.finished,
    accessCode: record.accessCode,
    generatingCode: false,
  };
}

@Component({
  selector: 'app-interview-sesssion-by-venue',
  imports: [Button, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './interview-sesssion-by-venue.html',
  styleUrl: './interview-sesssion-by-venue.css',
})
export class InterviewSesssionByVenue implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly venue = this.route.snapshot.queryParamMap.get('venue') ?? '';
  readonly venueId = Number(this.route.snapshot.queryParamMap.get('venueId'));
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
        {
          label: this.region,
          routerLink: '/online-interview/venue-session-by-region',
          queryParams: { id: this.interviewId, title: this.interviewTitle, region: this.region },
        },
        { label: this.venue },
      ]
    : [
        { label: 'Online Interview', routerLink: '/online-interview' },
        { label: 'Venue Session by Region', routerLink: '/online-interview/venue-session-by-region' },
        { label: this.venue },
      ];

  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>('table');
  readonly summary = signal<SessionsSummary | null>(null);
  readonly sessions = signal<SessionRow[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getSessionsByVenue(this.venueId, this.advertId, this.interviewTypeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.data) {
            return;
          }
          this.summary.set({
            advertName: response.data.advertName,
            interviewTypeName: titleCase(response.data.interviewTypeName),
            notStarted: response.data.notStarted,
            inProgress: response.data.inProgress,
            finished: response.data.finished,
            totalApplicants: response.data.totalApplicants,
          });
          this.sessions.set(response.data.sessions.map(mapSession));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Sessions',
            detail: 'Could not load sessions for this venue. Please try again later.',
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

  finishedProgress(session: SessionRow): number {
    if (session.totalApplicants <= 0) {
      return 0;
    }
    return Math.round((session.finished / session.totalApplicants) * 100);
  }

  onGenerateCode(session: SessionRow): void {
    if (session.accessCode || session.generatingCode) {
      return;
    }

    this.sessions.update((rows) =>
      rows.map((row) => (row.sessionNumber === session.sessionNumber ? { ...row, generatingCode: true } : row)),
    );

    this.questionBankApi
      .generateSessionAccessCode({
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
        venueId: this.venueId,
        sessionNumber: session.sessionNumber,
      })
      .subscribe({
        next: (response) => {
          this.sessions.update((rows) =>
            rows.map((row) =>
              row.sessionNumber === session.sessionNumber
                ? { ...row, accessCode: response.data?.accessCode ?? '', generatingCode: false }
                : row,
            ),
          );
          this.messageService.add({
            severity: 'success',
            summary: 'Access Code Generated',
            detail: response.message,
          });
        },
        error: () => {
          this.sessions.update((rows) =>
            rows.map((row) =>
              row.sessionNumber === session.sessionNumber ? { ...row, generatingCode: false } : row,
            ),
          );
          this.messageService.add({
            severity: 'error',
            summary: 'Generate Failed',
            detail: 'Could not generate the access code. Please try again later.',
          });
        },
      });
  }

  onCopyCode(code: string): void {
    this.copyToClipboard(code)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Code Copied',
          detail: 'The session code was copied to your clipboard.',
        });
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Copy Failed',
          detail: 'Could not copy the code. Please copy it manually.',
        });
      });
  }

  private copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        successful ? resolve() : reject(new Error('execCommand copy failed'));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  onView(session: SessionRow): void {
    this.router.navigate(['/online-interview/candidates-session-by-venue'], {
      queryParams: {
        id: this.interviewId,
        title: this.interviewTitle,
        region: this.region,
        venue: this.venue,
        venueId: this.venueId,
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
        sessionNumber: session.sessionNumber,
        session: `Session ${session.sessionNumber}`,
      },
    });
  }
}
