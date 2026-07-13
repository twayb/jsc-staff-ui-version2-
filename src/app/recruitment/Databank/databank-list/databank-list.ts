import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type Gender = 'Male' | 'Female';
type CandidateStatus = 'Active' | 'Replaced';
type CandidateStatusSeverity = 'success' | 'secondary';

interface DatabankCandidate {
  name: string;
  age: number;
  gender: Gender;
  marks: number;
  status: CandidateStatus;
}

@Component({
  selector: 'app-databank-list',
  imports: [Tag, Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './databank-list.html',
  styleUrl: './databank-list.css',
})
export class DatabankList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly referenceNo = this.route.snapshot.paramMap.get('referenceNo') ?? '';
  readonly cadre = this.route.snapshot.queryParamMap.get('cadre') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Databank', routerLink: '/recruitment/databank' },
    { label: this.cadre || this.referenceNo },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  candidates: DatabankCandidate[] = [
    { name: 'John Mwangi', age: 29, gender: 'Male', marks: 72, status: 'Active' },
    { name: 'Amina Hassan', age: 34, gender: 'Female', marks: 65, status: 'Active' },
    { name: 'Fatma Salim', age: 27, gender: 'Female', marks: 58, status: 'Replaced' },
    { name: 'Juma Kessy', age: 31, gender: 'Male', marks: 61, status: 'Active' },
  ];

  statusSeverity(status: CandidateStatus): CandidateStatusSeverity {
    return status === 'Active' ? 'success' : 'secondary';
  }

  onReplace(candidate: DatabankCandidate): void {
    this.confirmationService.confirm({
      header: 'Replace Candidate',
      message: `Are you sure you want to replace "${candidate.name}" from the databank?`,
      icon: 'pi pi-sync',
      acceptButtonProps: { label: 'Replace' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.candidates = this.candidates.map((item) =>
          item === candidate ? { ...item, status: 'Replaced' } : item,
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Candidate Replaced',
          detail: `"${candidate.name}" was replaced successfully.`,
        });
      },
    });
  }
}
