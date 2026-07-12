import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface ApplicationListing {
  referenceNo: string;
  cadre: string;
  posts: number;
  closingDate: string;
  applicants: number;
}

@Component({
  selector: 'app-application-list',
  imports: [Menu, AppBreadcrumb, AppDataTable],
  templateUrl: './application-list.html',
  styleUrl: './application-list.css',
})
export class ApplicationList implements OnInit {
  private readonly router = inject(Router);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applications: ApplicationListing[] = [
    {
      referenceNo: 'ADV-2026-001',
      cadre: 'Magistrate',
      posts: 5,
      closingDate: '2026-02-10',
      applicants: 42,
    },
    {
      referenceNo: 'ADV-2026-002',
      cadre: 'Court Clerk',
      posts: 8,
      closingDate: '2026-03-01',
      applicants: 76,
    },
    {
      referenceNo: 'ADV-2026-003',
      cadre: 'Legal Officer',
      posts: 3,
      closingDate: '2025-12-15',
      applicants: 21,
    },
    {
      referenceNo: 'ADV-2026-004',
      cadre: 'Research Officer',
      posts: 2,
      closingDate: '2026-01-01',
      applicants: 15,
    },
  ];

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, application: ApplicationListing, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Longlist', icon: 'pi pi-list', command: () => this.onLonglist(application) },
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(application) },
    ];
    menu.toggle(event);
  }

  onLonglist(application: ApplicationListing): void {
    this.router.navigate(['/recruitment/applications/longlist', application.referenceNo]);
  }

  onView(application: ApplicationListing): void {
    this.router.navigate(['/recruitment/applications/assigned', application.referenceNo]);
  }
}
