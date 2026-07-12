import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type ApprovalState = 'Approved' | 'Not Approved';
type ApprovalStateSeverity = 'success' | 'warn';

interface ShortlistedApplicant {
  name: string;
  nin: string;
  applicationDate: string;
  state: ApprovalState;
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

  @Input() showApproval = true;
  @Input() referenceNo = '';
  @Input() origin: 'longlist' | 'assigned' = 'longlist';

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicants: ShortlistedApplicant[] = [
    { name: 'John Mwangi', nin: '19900023456780000234', applicationDate: '2026-01-16', state: 'Approved' },
    { name: 'Amina Hassan', nin: '19990531111020000125', applicationDate: '2026-01-15', state: 'Not Approved' },
    { name: 'Fatma Salim', nin: '19870056789010000567', applicationDate: '2026-01-22', state: 'Not Approved' },
  ];

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
        this.applicants = this.applicants.map((applicant) => ({ ...applicant, state: 'Approved' }));
        this.messageService.add({
          severity: 'success',
          summary: 'Shortlist Approved',
          detail: 'The shortlist was approved successfully.',
        });
      },
    });
  }

  onView(applicant: ShortlistedApplicant): void {
    this.router.navigate(['/recruitment/applications', this.origin, this.referenceNo, 'applicant', applicant.nin]);
  }
}
