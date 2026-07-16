import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import {
  InterviewSetStatus,
  InterviewSetStatusSeverity,
  OnlineInterviewDataService,
  SessionByVenueItem,
} from '../online-interview-data.service';

type ViewMode = 'table' | 'card';
type StatusFilter = 'all' | 'ongoing' | 'pending' | 'completed';
type SessionStatus = 'Ongoing' | 'Scheduled' | 'Completed';

const STATUS_FILTER_MAP: Record<Exclude<StatusFilter, 'all'>, SessionStatus> = {
  ongoing: 'Ongoing',
  pending: 'Scheduled',
  completed: 'Completed',
};

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Component({
  selector: 'app-interview-sesssion-by-venue',
  imports: [Tag, Dialog, Button, AppBreadcrumb, AppDataTable, AppSkeleton],
  templateUrl: './interview-sesssion-by-venue.html',
  styleUrl: './interview-sesssion-by-venue.css',
})
export class InterviewSesssionByVenue implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly venue = this.route.snapshot.queryParamMap.get('venue') ?? '';

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

  readonly subtitle = this.venue
    ? `Sessions at ${this.venue}${this.region ? ' — ' + this.region : ''}`
    : 'Interview sessions grouped by venue';

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

  get sessions(): SessionByVenueItem[] {
    return this.interviewData.sessionsByVenue;
  }

  sessionStatus(session: SessionByVenueItem): SessionStatus {
    const finished = session.total - session.notStarted - session.inProgress;
    if (session.total > 0 && finished >= session.total) {
      return 'Completed';
    }
    if (session.inProgress > 0 || finished > 0) {
      return 'Ongoing';
    }
    return 'Scheduled';
  }

  sessionStatusSeverity(session: SessionByVenueItem): InterviewSetStatusSeverity {
    return this.interviewData.interviewStatusSeverity(this.sessionStatus(session) as InterviewSetStatus);
  }

  filteredSessions(): SessionByVenueItem[] {
    const filter = this.statusFilter();
    if (filter === 'all') {
      return this.sessions;
    }
    return this.sessions.filter((session) => this.sessionStatus(session) === STATUS_FILTER_MAP[filter]);
  }

  filterCount(filter: StatusFilter): number {
    if (filter === 'all') {
      return this.sessions.length;
    }
    return this.sessions.filter((session) => this.sessionStatus(session) === STATUS_FILTER_MAP[filter]).length;
  }

  inProgressProgress(session: SessionByVenueItem): number {
    if (session.total <= 0) {
      return 0;
    }
    return Math.round((session.inProgress / session.total) * 100);
  }

  showCodeDialog = false;
  generatedCode = '';
  codeForSession: SessionByVenueItem | null = null;

  onGenerateCode(session: SessionByVenueItem): void {
    this.codeForSession = session;
    this.generatedCode = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(
      '',
    );
    this.showCodeDialog = true;
  }

  onCopyCode(): void {
    navigator.clipboard.writeText(this.generatedCode);
    this.messageService.add({
      severity: 'success',
      summary: 'Code Copied',
      detail: 'The session code was copied to your clipboard.',
    });
  }

  onView(session: SessionByVenueItem): void {
    this.router.navigate(['/online-interview/candidates-session-by-venue'], {
      queryParams: {
        id: this.interviewId,
        title: this.interviewTitle,
        region: this.region,
        venue: this.venue,
        session: session.session,
      },
    });
  }
}
