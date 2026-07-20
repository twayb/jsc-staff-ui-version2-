import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { ApplicantApiService, ApplicantRecord } from '../../../core/recruitment/applicant-api.service';
import { titleCase } from '../../../core/utils';

interface Applicant {
  id: string;
  fullName: string;
  nin: string;
  gender: string;
  mobile: string;
  email: string;
}

function mapApplicant(record: ApplicantRecord): Applicant {
  return {
    id: record.id,
    fullName: record.fullName ? titleCase(record.fullName) : '—',
    nin: record.nin ?? '—',
    gender: record.gender ? titleCase(record.gender) : '—',
    mobile: record.mobile ?? '—',
    email: record.email ?? '—',
  };
}

@Component({
  selector: 'app-applicant-list',
  imports: [Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './applicant-list.html',
  styleUrl: './applicant-list.css',
})
export class ApplicantList implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly applicantApi = inject(ApplicantApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applicants' },
  ];

  readonly loading = signal(true);
  readonly applicants = signal<Applicant[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.applicantApi
      .getApplicants()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applicants.set((response.data?.content ?? []).map(mapApplicant));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Applicants',
            detail: 'Could not load the applicants list. Please try again later.',
          });
        },
      });
  }

  onView(applicant: Applicant): void {
    this.router.navigate(['/recruitment/applicants', applicant.id]);
  }
}
