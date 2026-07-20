import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { ApplicationDetailRecord } from '../../../core/recruitment/applicant-preview-api.service';

interface PendingApplicant {
  applicationId: string;
  name: string;
  nin: string;
  applicationDate: string;
}

function mapPending(record: ApplicationDetailRecord): PendingApplicant {
  return {
    applicationId: record.id,
    name: record.applicant.fullName,
    nin: record.applicant.nin,
    applicationDate: record.createdAt?.slice(0, 10) ?? '',
  };
}

@Component({
  selector: 'app-pending',
  imports: [Tag, Tooltip, AppDataTable],
  templateUrl: './pending.html',
  styleUrl: './pending.css',
})
export class Pending implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly longlistApi = inject(LonglistApiService);

  @Input() advertId = '';
  @Input() origin: 'longlist' | 'assigned' = 'assigned';

  readonly loading = signal(true);
  readonly applicants = signal<PendingApplicant[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.longlistApi
      .getOfficerApplicationsPending(Number(this.advertId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applicants.set((response.data?.content ?? []).map(mapPending));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Pending',
            detail: 'Could not load the pending applicants. Please try again later.',
          });
        },
      });
  }

  onView(applicant: PendingApplicant): void {
    this.router.navigate([
      '/recruitment/applications',
      this.origin,
      this.advertId,
      'applicant',
      applicant.applicationId,
    ]);
  }
}
