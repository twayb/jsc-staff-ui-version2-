import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import {
  InterviewSessionSummaryRecord,
  QuestionBankApiService,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type SessionStatus = 'Scheduled' | 'Ongoing' | 'Completed';

interface Stat {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

interface UpcomingInterview {
  id: number;
  title: string;
  cadre: string;
  scheduledDate: string;
  scheduledTime: string;
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

@Component({
  selector: 'app-online-interview-dashboard',
  imports: [RouterLink, AppSkeleton, CountUp],
  templateUrl: './online-interview-dashboard.html',
  styleUrl: './online-interview-dashboard.css',
})
export class OnlineInterviewDashboard implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly loading = signal(true);
  private readonly records = signal<InterviewSessionSummaryRecord[]>([]);

  readonly upcomingInterviews = computed<UpcomingInterview[]>(() =>
    this.records()
      .filter((record) => deriveStatus(record.startDateTime, record.endDateTime) === 'Scheduled')
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
      .slice(0, 6)
      .map((record) => {
        const start = splitDateTime(record.startDateTime);
        return {
          id: record.id,
          title: `${record.advertName} — ${titleCase(record.interviewType)}`,
          cadre: record.advertName,
          scheduledDate: start.date,
          scheduledTime: start.time,
        };
      }),
  );

  readonly stats = computed<Stat[]>(() => {
    const all = this.records();
    const statuses = all.map((record) => deriveStatus(record.startDateTime, record.endDateTime));

    return [
      {
        label: 'Total Interviews',
        value: all.length,
        icon: 'pi-desktop',
        bgClass: 'bg-primary/10',
        fgClass: 'text-primary',
        route: '/online-interview/interview-list',
      },
      {
        label: 'Ongoing',
        value: statuses.filter((status) => status === 'Ongoing').length,
        icon: 'pi-sync',
        bgClass: 'bg-info-bg',
        fgClass: 'text-info',
        route: '/online-interview/interview-session',
      },
      {
        label: 'Completed',
        value: statuses.filter((status) => status === 'Completed').length,
        icon: 'pi-check-circle',
        bgClass: 'bg-success-bg',
        fgClass: 'text-success',
        route: '/online-interview/interview-session',
      },
      {
        label: 'Pending',
        value: statuses.filter((status) => status === 'Scheduled').length,
        icon: 'pi-clock',
        bgClass: 'bg-warning-bg',
        fgClass: 'text-warning',
        route: '/online-interview/interview-session',
      },
    ];
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getInterviewSetupListByApplicantTotal()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.records.set(response.data ?? []);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Dashboard',
            detail: 'Could not load online interview statistics. Please try again later.',
          });
        },
      });
  }
}
