import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import {
  InterviewSessionSummaryRecord,
  QuestionBankApiService,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type ViewMode = 'table' | 'card';
type StatusFilter = 'all' | 'ongoing' | 'pending' | 'completed';
type SessionStatus = 'Scheduled' | 'Ongoing' | 'Completed';
type SessionStatusSeverity = 'warn' | 'success' | 'secondary';
type InterviewTypeSeverity = 'success' | 'info' | 'secondary';

const VIEW_MODE_STORAGE_KEY = 'online-interview-session-view-mode';

function readStoredViewMode(): ViewMode {
  const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === 'table' || stored === 'card' ? stored : 'card';
}

const STATUS_FILTER_MAP: Record<Exclude<StatusFilter, 'all'>, SessionStatus> = {
  ongoing: 'Ongoing',
  pending: 'Scheduled',
  completed: 'Completed',
};

interface SessionRow {
  id: number;
  title: string;
  cadre: string;
  interviewType: string;
  status: SessionStatus;
  totalCandidates: number;
  submittedCandidates: number;
  scheduledDate: string;
  scheduledTime: string;
  endDate: string;
  endTime: string;
  durationMinutes: number;
}

function splitDateTime(value: string): { date: string; time: string } {
  const [date, time] = value.split('T');
  return { date: date ?? '', time: time?.slice(0, 5) ?? '' };
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

function mapSession(record: InterviewSessionSummaryRecord): SessionRow {
  const start = splitDateTime(record.startDateTime);
  const end = splitDateTime(record.endDateTime);
  const interviewType = titleCase(record.interviewType);
  return {
    id: record.id,
    title: `${record.advertName} — ${interviewType}`,
    cadre: record.advertName,
    interviewType,
    status: deriveStatus(record.startDateTime, record.endDateTime),
    totalCandidates: record.totalCandidate,
    submittedCandidates: record.submittedCandidate,
    scheduledDate: start.date,
    scheduledTime: start.time,
    endDate: end.date,
    endTime: end.time,
    durationMinutes: record.durationHours * 60 + record.durationMinutes,
  };
}

@Component({
  selector: 'app-interview-session',
  imports: [Tag, Button, AppBreadcrumb, AppDataTable, AppSkeleton],
  templateUrl: './interview-session.html',
  styleUrl: './interview-session.css',
})
export class InterviewSession implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview Session' },
  ];

  readonly loading = signal(true);
  readonly viewMode = signal<ViewMode>(readStoredViewMode());
  readonly statusFilter = signal<StatusFilter>('all');
  readonly sessions = signal<SessionRow[]>([]);

  readonly statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
  ];

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getInterviewSetupListByApplicantTotal()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.sessions.set((response.data ?? []).map(mapSession));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Sessions',
            detail: 'Could not load the interview sessions. Please try again later.',
          });
        },
      });
  }

  filteredInterviews(): SessionRow[] {
    const filter = this.statusFilter();
    if (filter === 'all') {
      return this.sessions();
    }
    return this.sessions().filter((session) => session.status === STATUS_FILTER_MAP[filter]);
  }

  filterCount(filter: StatusFilter): number {
    if (filter === 'all') {
      return this.sessions().length;
    }
    return this.sessions().filter((session) => session.status === STATUS_FILTER_MAP[filter]).length;
  }

  submittedProgress(session: SessionRow): number {
    if (session.totalCandidates <= 0) {
      return 0;
    }
    return Math.round((session.submittedCandidates / session.totalCandidates) * 100);
  }

  interviewTypeSeverity(interviewType: string): InterviewTypeSeverity {
    const upper = interviewType.toUpperCase();
    if (upper.includes('WRITTEN')) {
      return 'info';
    }
    if (upper.includes('ORAL')) {
      return 'success';
    }
    return 'secondary';
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

  formatDuration(minutes: number): string {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  onView(session: SessionRow): void {
    this.router.navigate(['/online-interview/session-by-region'], {
      queryParams: { id: session.id, title: session.title },
    });
  }
}
