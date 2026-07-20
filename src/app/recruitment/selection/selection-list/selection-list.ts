import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { titleCase } from '../../../core/utils';
import { SelectedApplicantRecord, SelectionApiService } from '../../../core/recruitment/selection-api.service';

type Gender = 'Male' | 'Female';
type Severity = 'success' | 'danger' | 'warn' | 'secondary';

interface SelectionCandidate {
  applicationId: string;
  name: string;
  gender: Gender;
  interviewNo: string;
  marks: number;
  status: string;
  remarks: string;
}

function mapSelectionCandidate(record: SelectedApplicantRecord): SelectionCandidate {
  return {
    applicationId: record.applicationId,
    name: record.applicantName,
    gender: record.gender.toUpperCase() === 'FEMALE' ? 'Female' : 'Male',
    interviewNo: record.interviewNumber,
    marks: record.marks,
    status: record.status,
    remarks: record.remarks,
  };
}

@Component({
  selector: 'app-selection-list',
  imports: [Tag, Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './selection-list.html',
  styleUrl: './selection-list.css',
})
export class SelectionList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly selectionApi = inject(SelectionApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly cadre = this.route.snapshot.queryParamMap.get('cadre') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Selection', routerLink: '/recruitment/selection' },
    { label: this.cadre || this.advertId },
  ];

  readonly loading = signal(true);
  readonly candidates = signal<SelectionCandidate[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.selectionApi
      .getSelectedApplicants(Number(this.advertId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.candidates.set((response.data ?? []).map(mapSelectionCandidate));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Selection',
            detail: 'Could not load the selected candidates. Please try again later.',
          });
        },
      });
  }

  statusLabel(status: string): string {
    return titleCase(status.replace(/_/g, ' '));
  }

  statusSeverity(status: string): Severity {
    const upper = status.toUpperCase();
    if (upper.includes('APPROV')) return 'success';
    if (upper.includes('REJECT') || upper.includes('DECLIN')) return 'danger';
    if (upper.includes('PENDING')) return 'warn';
    return 'secondary';
  }

  remarksLabel(remarks: string): string {
    return titleCase(remarks.replace(/_/g, ' '));
  }

  remarksSeverity(remarks: string): Severity {
    const upper = remarks.toUpperCase();
    if (upper.includes('CONFIRM')) return 'success';
    if (upper.includes('REJECT') || upper.includes('DECLIN')) return 'danger';
    if (upper.includes('PENDING')) return 'warn';
    return 'secondary';
  }

  // Not wired yet: no confirmed endpoint for approving a selection — stays local-only for now.
  onApprove(candidate: SelectionCandidate): void {
    this.confirmationService.confirm({
      header: 'Approve Selection',
      message: `Are you sure you want to approve the selection for "${candidate.name}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.candidates.update((list) =>
          list.map((item) => (item === candidate ? { ...item, status: 'APPROVED' } : item)),
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Selection Approved',
          detail: `"${candidate.name}" was approved successfully.`,
        });
      },
    });
  }
}
