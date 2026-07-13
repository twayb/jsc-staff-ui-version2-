import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type Gender = 'Male' | 'Female';

interface Applicant {
  fullName: string;
  nin: string;
  gender: Gender;
  mobile: string;
  email: string;
}

@Component({
  selector: 'app-applicant-list',
  imports: [Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './applicant-list.html',
  styleUrl: './applicant-list.css',
})
export class ApplicantList implements OnInit {
  private readonly router = inject(Router);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applicants' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicants: Applicant[] = [
    {
      fullName: 'John Mwangi',
      nin: '19900023456780000234',
      gender: 'Male',
      mobile: '0754123456',
      email: 'john.mwangi@example.com',
    },
    {
      fullName: 'Amina Hassan',
      nin: '19990531111020000125',
      gender: 'Female',
      mobile: '0765234567',
      email: 'amina.hassan@example.com',
    },
    {
      fullName: 'Fatma Salim',
      nin: '19870056789010000567',
      gender: 'Female',
      mobile: '0713345678',
      email: 'fatma.salim@example.com',
    },
    {
      fullName: 'Juma Kessy',
      nin: '19850012345670000891',
      gender: 'Male',
      mobile: '0788456789',
      email: 'juma.kessy@example.com',
    },
  ];

  onView(applicant: Applicant): void {
    this.router.navigate(['/recruitment/applicants', applicant.nin]);
  }
}
