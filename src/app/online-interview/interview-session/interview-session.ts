import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import {
  CandidateSession,
  InterviewSet,
  InterviewSetStatus,
  InterviewSetStatusSeverity,
  InterviewTypeSeverity,
  OnlineInterviewDataService,
} from '../online-interview-data.service';

type ViewMode = 'table' | 'card';
type StatusFilter = 'all' | 'ongoing' | 'pending' | 'completed';

const STATUS_FILTER_MAP: Record<Exclude<StatusFilter, 'all'>, InterviewSetStatus> = {
  ongoing: 'Ongoing',
  pending: 'Scheduled',
  completed: 'Completed',
};

@Component({
  selector: 'app-interview-session',
  imports: [Tag, Dialog, Button, AppBreadcrumb, AppDataTable, AppSkeleton],
  templateUrl: './interview-session.html',
  styleUrl: './interview-session.css',
})
export class InterviewSession implements OnInit {
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview Session' },
  ];

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

  get interviews(): InterviewSet[] {
    return this.interviewData.interviewSets;
  }

  filteredInterviews(): InterviewSet[] {
    const filter = this.statusFilter();
    if (filter === 'all') {
      return this.interviews;
    }
    return this.interviews.filter((interview) => interview.status === STATUS_FILTER_MAP[filter]);
  }

  filterCount(filter: StatusFilter): number {
    if (filter === 'all') {
      return this.interviews.length;
    }
    return this.interviews.filter((interview) => interview.status === STATUS_FILTER_MAP[filter]).length;
  }

  submittedCount(interview: InterviewSet): number {
    return this.interviewData.candidateSessions.filter(
      (session) => session.interviewTitle === interview.title && session.submittedAt !== null,
    ).length;
  }

  submittedProgress(interview: InterviewSet): number {
    if (interview.candidatesInvited <= 0) {
      return 0;
    }
    return Math.round((this.submittedCount(interview) / interview.candidatesInvited) * 100);
  }

  canEnd(interview: InterviewSet): boolean {
    return interview.status === 'Scheduled' || interview.status === 'Ongoing';
  }

  interviewTypeSeverity(interviewType: string): InterviewTypeSeverity {
    return this.interviewData.interviewTypeSeverity(interviewType);
  }

  statusSeverity(status: InterviewSetStatus): InterviewSetStatusSeverity {
    return this.interviewData.interviewStatusSeverity(status);
  }

  formatDuration(minutes: number): string {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  onView(interview: InterviewSet): void {
    this.router.navigate(['/online-interview/session-by-region'], {
      queryParams: { id: interview.id, title: interview.title },
    });
  }

  onEnd(interview: InterviewSet): void {
    this.confirmationService.confirm({
      header: 'End Session',
      message: `Are you sure you want to end the session for "${interview.title}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'End Session', severity: 'danger' },
      rejectButtonProps: { label: 'Close', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviewData.interviewSets = this.interviewData.interviewSets.map((item) =>
          item === interview ? { ...item, status: 'Completed' } : item,
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Session Ended',
          detail: `"${interview.title}" was ended successfully.`,
        });
      },
    });
  }

  showResultsDialog = false;
  resultsInterview: InterviewSet | null = null;

  onResults(interview: InterviewSet): void {
    this.resultsInterview = interview;
    this.showResultsDialog = true;
  }

  resultsFor(interview: InterviewSet | null): CandidateSession[] {
    if (!interview) {
      return [];
    }
    return this.interviewData.candidateSessions.filter((session) => session.interviewTitle === interview.title);
  }
}
