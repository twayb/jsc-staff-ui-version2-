import { Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { InterviewApiService, InterviewTypeRef } from '../../../core/recruitment/interview-api.service';
import { titleCase } from '../../../core/utils';

interface InterviewType {
  id: number;
  name: string;
  level: number;
}

function mapInterviewType(record: InterviewTypeRef): InterviewType {
  return { id: record.id, name: titleCase(record.name), level: record.level };
}

@Component({
  selector: 'app-interview-types',
  imports: [AppBreadcrumb, AppDataTable],
  templateUrl: './interview-types.html',
  styleUrl: './interview-types.css',
})
export class InterviewTypes implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly interviewApi = inject(InterviewApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Interview Types' },
  ];

  readonly loading = signal(true);
  readonly interviewTypes = signal<InterviewType[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.interviewApi
      .getInterviewTypes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.interviewTypes.set((response.data ?? []).map(mapInterviewType));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interview Types',
            detail: 'Could not load the interview types. Please try again later.',
          });
        },
      });
  }
}
