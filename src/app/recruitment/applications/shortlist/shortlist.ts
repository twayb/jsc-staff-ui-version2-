import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { ApplicationRecord, LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { ApplicationDetailRecord } from '../../../core/recruitment/applicant-preview-api.service';

type ApprovalState = 'Approved' | 'Not Approved';
type ApprovalStateSeverity = 'success' | 'warn';

interface ShortlistedApplicant {
  applicationId: string;
  name: string;
  nin: string;
  applicationDate: string;
  state: ApprovalState;
}

function approvalStateOf(state: string | null): ApprovalState {
  return (state ?? '').toUpperCase() === 'APPROVED' ? 'Approved' : 'Not Approved';
}

function mapShortlisted(raw: ApplicationRecord): ShortlistedApplicant {
  return {
    applicationId: raw.applicationId,
    name: raw.applicantName,
    nin: raw.nin,
    applicationDate: raw.applicationDate?.slice(0, 10) ?? '',
    state: approvalStateOf(raw.state),
  };
}

function mapAssignedShortlisted(record: ApplicationDetailRecord): ShortlistedApplicant {
  return {
    applicationId: record.id,
    name: record.applicant.fullName,
    nin: record.applicant.nin,
    applicationDate: record.createdAt?.slice(0, 10) ?? '',
    state: approvalStateOf(record.state),
  };
}

@Component({
  selector: 'app-shortlist',
  imports: [Tag, Tooltip, AppDataTable],
  templateUrl: './shortlist.html',
  styleUrl: './shortlist.css',
})
export class Shortlist implements OnInit {
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly longlistApi = inject(LonglistApiService);

  @Input() showApproval = true;
  @Input() advertId = '';
  @Input() origin: 'longlist' | 'assigned' = 'longlist';

  readonly loading = signal(true);
  readonly applicants = signal<ShortlistedApplicant[]>([]);

  ngOnInit(): void {
    this.loading.set(true);

    if (this.origin === 'longlist') {
      this.longlistApi
        .getShortlist(Number(this.advertId), 'SHORTLISTED')
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (response) => {
            this.applicants.set((response.data?.content ?? []).map(mapShortlisted));
          },
          error: () => this.showLoadError(),
        });
      return;
    }

    this.longlistApi
      .getOfficerApplicationsShortlisted(Number(this.advertId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applicants.set((response.data?.content ?? []).map(mapAssignedShortlisted));
        },
        error: () => this.showLoadError(),
      });
  }

  private showLoadError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Failed to Load Shortlist',
      detail: 'Could not load the shortlisted applicants. Please try again later.',
    });
  }

  approvalStateSeverity(state: ApprovalState): ApprovalStateSeverity {
    return state === 'Approved' ? 'success' : 'warn';
  }

  onApprove(): void {
    this.confirmationService.confirm({
      header: 'Approve Shortlist',
      message: 'Are you sure you want to approve the shortlist?',
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.applicants.update((list) => list.map((applicant) => ({ ...applicant, state: 'Approved' })));
        this.messageService.add({
          severity: 'success',
          summary: 'Shortlist Approved',
          detail: 'The shortlist was approved successfully.',
        });
      },
    });
  }

  onView(applicant: ShortlistedApplicant): void {
    this.router.navigate([
      '/recruitment/applications',
      this.origin,
      this.advertId,
      'applicant',
      applicant.applicationId,
    ]);
  }
}
