import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type AttendanceStatus = 'Shortlist' | 'Not Shortlist' | 'Pending';
type AttendanceStatusSeverity = 'success' | 'danger' | 'warn';

interface AttendanceApplicant {
  name: string;
  gender: string;
  address: string;
  status: AttendanceStatus;
}

@Component({
  selector: 'app-attended-unattended',
  imports: [Tag, Dialog, Button, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel, AppBreadcrumb, AppDataTable],
  templateUrl: './attended-unattended.html',
  styleUrl: './attended-unattended.css',
})
export class AttendedUnattended implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly panel = this.route.snapshot.paramMap.get('panel') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    { label: 'Longlist', routerLink: ['/recruitment/applications/longlist', this.advertId] },
    { label: 'Attend' },
  ];

  readonly activeTab = signal('attended');
  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  attended: AttendanceApplicant[] = [
    { name: 'John Mwangi', gender: 'Male', address: 'Dodoma', status: 'Shortlist' },
    { name: 'Grace Kileo', gender: 'Female', address: 'Arusha', status: 'Not Shortlist' },
    { name: 'Fatma Salim', gender: 'Female', address: 'Zanzibar', status: 'Shortlist' },
  ];

  unattended: AttendanceApplicant[] = [
    { name: 'Amina Hassan', gender: 'Female', address: 'Mwanza', status: 'Pending' },
    { name: 'Peter Mushi', gender: 'Male', address: 'Mbeya', status: 'Pending' },
  ];

  showViewDialog = false;
  viewingApplicant: AttendanceApplicant | null = null;

  attendanceStatusSeverity(status: AttendanceStatus): AttendanceStatusSeverity {
    if (status === 'Shortlist') return 'success';
    if (status === 'Not Shortlist') return 'danger';
    return 'warn';
  }

  onView(applicant: AttendanceApplicant): void {
    this.viewingApplicant = applicant;
    this.showViewDialog = true;
  }
}
