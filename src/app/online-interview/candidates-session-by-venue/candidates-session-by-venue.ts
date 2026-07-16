import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { CandidateVenueSession, CandidateVenueSessionStatus, OnlineInterviewDataService } from '../online-interview-data.service';

type CandidateVenueSessionStatusSeverity = 'secondary' | 'warn' | 'success' | 'danger';

interface Kpi {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
}

@Component({
  selector: 'app-candidates-session-by-venue',
  imports: [Tag, NgClass, FormsModule, Dialog, Textarea, Button, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './candidates-session-by-venue.html',
  styleUrl: './candidates-session-by-venue.css',
})
export class CandidatesSessionByVenue implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly interviewId = this.route.snapshot.queryParamMap.get('id') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly venue = this.route.snapshot.queryParamMap.get('venue') ?? '';
  readonly session = this.route.snapshot.queryParamMap.get('session') ?? '';

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

  readonly subtitle = this.session
    ? `Candidates in ${this.session}${this.venue ? ' — ' + this.venue : ''}`
    : 'Candidate progress for this session';

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  get candidates(): CandidateVenueSession[] {
    return this.interviewData.candidateVenueSessions;
  }

  get kpis(): Kpi[] {
    const candidates = this.candidates;
    const started = candidates.filter(
      (c) => c.status === 'Started' || c.status === 'Finished' || c.status === 'Ended',
    ).length;
    const inProgress = candidates.filter((c) => c.status === 'Started').length;
    const finished = candidates.filter((c) => c.status === 'Finished').length;
    const exitedFullscreen = candidates.filter((c) => c.fullscreenExits > 0).length;

    return [
      { label: 'Total', value: candidates.length, icon: 'pi-users', bgClass: 'bg-primary/10', fgClass: 'text-primary' },
      { label: 'Started', value: started, icon: 'pi-play-circle', bgClass: 'bg-info-bg', fgClass: 'text-info' },
      { label: 'In Progress', value: inProgress, icon: 'pi-spinner', bgClass: 'bg-warning-bg', fgClass: 'text-warning' },
      { label: 'Finished', value: finished, icon: 'pi-check-circle', bgClass: 'bg-success-bg', fgClass: 'text-success' },
      {
        label: 'Exit Full Screen',
        value: exitedFullscreen,
        icon: 'pi-external-link',
        bgClass: 'bg-danger-bg',
        fgClass: 'text-danger',
      },
    ];
  }

  statusSeverity(status: CandidateVenueSessionStatus): CandidateVenueSessionStatusSeverity {
    switch (status) {
      case 'Not Started':
        return 'secondary';
      case 'Started':
        return 'warn';
      case 'Finished':
        return 'success';
      case 'Ended':
        return 'danger';
    }
  }

  canManage(candidate: CandidateVenueSession): boolean {
    return candidate.status === 'Started';
  }

  isEnded(candidate: CandidateVenueSession): boolean {
    return candidate.status === 'Ended';
  }

  private readonly pausedCandidates = signal<Set<CandidateVenueSession>>(new Set());

  isPaused(candidate: CandidateVenueSession): boolean {
    return this.pausedCandidates().has(candidate);
  }

  onTogglePause(candidate: CandidateVenueSession): void {
    const paused = this.isPaused(candidate);

    this.pausedCandidates.update((set) => {
      const next = new Set(set);
      if (paused) {
        next.delete(candidate);
      } else {
        next.add(candidate);
      }
      return next;
    });

    this.messageService.add({
      severity: 'info',
      summary: paused ? 'Session Resumed' : 'Session Paused',
      detail: `"${candidate.candidateName}"'s session was ${paused ? 'resumed' : 'paused'}.`,
    });
  }

  showEndSessionDialog = false;
  endingCandidate: CandidateVenueSession | null = null;
  endReason = '';

  onEndSession(candidate: CandidateVenueSession): void {
    this.endingCandidate = candidate;
    this.endReason = '';
    this.showEndSessionDialog = true;
  }

  onCancelEndSession(): void {
    this.showEndSessionDialog = false;
  }

  onConfirmEndSession(): void {
    const candidate = this.endingCandidate;
    if (!candidate || !this.endReason.trim()) {
      return;
    }

    this.interviewData.candidateVenueSessions = this.interviewData.candidateVenueSessions.map((item) =>
      item === candidate ? { ...item, status: 'Ended' } : item,
    );

    this.pausedCandidates.update((set) => {
      const next = new Set(set);
      next.delete(candidate);
      return next;
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Session Ended',
      detail: `"${candidate.candidateName}"'s session was ended successfully.`,
    });

    this.showEndSessionDialog = false;
  }
}
