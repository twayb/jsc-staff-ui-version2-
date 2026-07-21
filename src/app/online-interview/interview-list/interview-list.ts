import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import {
  InterviewSetupRecord,
  QuestionBankApiService,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type InterviewTypeSeverity = 'success' | 'info' | 'secondary';

interface InterviewListRow {
  id: number;
  cadre: string;
  interviewType: string;
  questionCount: number;
  scheduledDate: string;
  scheduledTime: string;
  endDate: string;
  endTime: string;
}

function splitDateTime(value: string): { date: string; time: string } {
  const [date, time] = value.split('T');
  return { date: date ?? '', time: time?.slice(0, 5) ?? '' };
}

function mapInterview(record: InterviewSetupRecord): InterviewListRow {
  const start = splitDateTime(record.startDateTime);
  const end = splitDateTime(record.endDateTime);
  return {
    id: record.id,
    cadre: record.advertName,
    interviewType: titleCase(record.interviewTypeName),
    questionCount: record.numberOfQuestions,
    scheduledDate: start.date,
    scheduledTime: start.time,
    endDate: end.date,
    endTime: end.time,
  };
}

@Component({
  selector: 'app-interview-list',
  imports: [AppBreadcrumb, AppDataTable, Tag],
  templateUrl: './interview-list.html',
  styleUrl: './interview-list.css',
})
export class InterviewList implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview List' },
  ];

  readonly loading = signal(true);
  readonly interviews = signal<InterviewListRow[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getInterviewSetupList()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.interviews.set((response.data ?? []).map(mapInterview));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interviews',
            detail: 'Could not load the interview list. Please try again later.',
          });
        },
      });
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

  onAdd(): void {
    this.router.navigate(['/online-interview/set-interview']);
  }

  onView(interview: InterviewListRow): void {
    this.router.navigate(['/online-interview/interview-list', interview.id]);
  }
}
