import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type Gender = 'Male' | 'Female';
type SelectionStatus = 'Approved' | 'Not Approved';
type SelectionStatusSeverity = 'success' | 'warn';
type SelectionRemark = 'Confirm' | 'Reject';
type SelectionRemarkSeverity = 'success' | 'danger';

interface SelectionCandidate {
  name: string;
  gender: Gender;
  status: SelectionStatus;
  remarks: SelectionRemark;
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

  readonly referenceNo = this.route.snapshot.paramMap.get('referenceNo') ?? '';
  readonly cadre = this.route.snapshot.queryParamMap.get('cadre') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Selection', routerLink: '/recruitment/selection' },
    { label: this.cadre || this.referenceNo },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  candidates: SelectionCandidate[] = [
    { name: 'John Mwangi', gender: 'Male', status: 'Approved', remarks: 'Confirm' },
    { name: 'Amina Hassan', gender: 'Female', status: 'Not Approved', remarks: 'Reject' },
    { name: 'Fatma Salim', gender: 'Female', status: 'Not Approved', remarks: 'Confirm' },
    { name: 'Juma Kessy', gender: 'Male', status: 'Approved', remarks: 'Confirm' },
  ];

  statusSeverity(status: SelectionStatus): SelectionStatusSeverity {
    return status === 'Approved' ? 'success' : 'warn';
  }

  remarksSeverity(remarks: SelectionRemark): SelectionRemarkSeverity {
    return remarks === 'Confirm' ? 'success' : 'danger';
  }

  onApprove(candidate: SelectionCandidate): void {
    this.confirmationService.confirm({
      header: 'Approve Selection',
      message: `Are you sure you want to approve the selection for "${candidate.name}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.candidates = this.candidates.map((item) =>
          item === candidate ? { ...item, status: 'Approved' } : item,
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
