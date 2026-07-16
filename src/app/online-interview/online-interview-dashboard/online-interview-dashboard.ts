import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { OnlineInterviewDataService } from '../online-interview-data.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

@Component({
  selector: 'app-online-interview-dashboard',
  imports: [RouterLink, AppSkeleton, CountUp],
  templateUrl: './online-interview-dashboard.html',
  styleUrl: './online-interview-dashboard.css',
})
export class OnlineInterviewDashboard implements OnInit {
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly upcomingInterviews = this.interviewData.upcomingInterviews;

  readonly stats: Stat[] = [
    {
      label: 'Total Interviews',
      value: this.interviewData.totalInterviews,
      icon: 'pi-desktop',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/online-interview/interview-list',
    },
    {
      label: 'Total Sessions',
      value: this.interviewData.totalSessions,
      icon: 'pi-users',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/online-interview/interview-session',
    },
    {
      label: 'Completed Sessions',
      value: this.interviewData.completedSessions,
      icon: 'pi-check-circle',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: '/online-interview/interview-session',
    },
    {
      label: 'Pending Sessions',
      value: this.interviewData.pendingSessions,
      icon: 'pi-clock',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: null,
    },
  ];
}
