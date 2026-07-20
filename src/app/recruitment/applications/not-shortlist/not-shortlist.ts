import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { ApplicationRecord, LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { ApplicationDetailRecord } from '../../../core/recruitment/applicant-preview-api.service';

interface NotShortlistedApplicant {
  applicationId: string;
  name: string;
  nin: string;
  applicationDate: string;
  remark: string;
}

function mapNotShortlisted(raw: ApplicationRecord): NotShortlistedApplicant {
  return {
    applicationId: raw.applicationId,
    name: raw.applicantName,
    nin: raw.nin,
    applicationDate: raw.applicationDate?.slice(0, 10) ?? '',
    remark: raw.remarks ?? '',
  };
}

function mapAssignedNotShortlisted(record: ApplicationDetailRecord): NotShortlistedApplicant {
  return {
    applicationId: record.id,
    name: record.applicant.fullName,
    nin: record.applicant.nin,
    applicationDate: record.createdAt?.slice(0, 10) ?? '',
    remark: record.remarks ?? '',
  };
}

@Component({
  selector: 'app-not-shortlist',
  imports: [Tag, Tooltip, AppDataTable],
  templateUrl: './not-shortlist.html',
  styleUrl: './not-shortlist.css',
})
export class NotShortlist implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly longlistApi = inject(LonglistApiService);

  @Input() advertId = '';
  @Input() origin: 'longlist' | 'assigned' = 'longlist';

  readonly loading = signal(true);
  readonly applicants = signal<NotShortlistedApplicant[]>([]);

  ngOnInit(): void {
    this.loading.set(true);

    if (this.origin === 'longlist') {
      this.longlistApi
        .getShortlist(Number(this.advertId), 'NOT_SHORTLISTED')
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.applicants.set((response.data?.content ?? []).map(mapNotShortlisted));
          },
          error: () => this.showLoadError(),
        });
      return;
    }

    this.longlistApi
      .getOfficerApplicationsNotShortlisted(Number(this.advertId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applicants.set((response.data?.content ?? []).map(mapAssignedNotShortlisted));
        },
        error: () => this.showLoadError(),
      });
  }

  private showLoadError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Failed to Load Not Shortlisted',
      detail: 'Could not load the not-shortlisted applicants. Please try again later.',
    });
  }

  onView(applicant: NotShortlistedApplicant): void {
    this.router.navigate([
      '/recruitment/applications',
      this.origin,
      this.advertId,
      'applicant',
      applicant.applicationId,
    ]);
  }
}
