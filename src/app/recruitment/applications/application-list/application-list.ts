import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { ApplicationApiService, ApplicationSummaryRecord } from '../../../core/recruitment/application-api.service';

interface ApplicationListing {
  id: number;
  referenceNo: string;
  cadre: string;
  posts: number;
  closingDate: string | null;
  applicants: number;
}

function mapApplication(raw: ApplicationSummaryRecord): ApplicationListing {
  return {
    id: raw.id,
    referenceNo: raw.advertReferenceNumber,
    cadre: raw.schemeName,
    posts: Number(raw.advertNumberOfPosts),
    closingDate: raw.advertClosingDate,
    applicants: Number(raw.advertTotalApplications),
  };
}

@Component({
  selector: 'app-application-list',
  imports: [Menu, AppBreadcrumb, AppDataTable],
  templateUrl: './application-list.html',
  styleUrl: './application-list.css',
})
export class ApplicationList {
  private readonly router = inject(Router);
  private readonly applicationApi = inject(ApplicationApiService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications' },
  ];

  readonly loading = signal(true);

  constructor() {
    this.fetchApplications();
  }

  private fetchApplications(): void {
    this.loading.set(true);
    this.applicationApi
      .getApplications()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.applications = (response.data?.content ?? []).map(mapApplication).sort((a, b) => b.id - a.id);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Applications',
            detail: 'Could not load the applications list. Please try again later.',
          });
        },
      });
  }

  applications: ApplicationListing[] = [];

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, application: ApplicationListing, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Longlist', icon: 'pi pi-list', command: () => this.onLonglist(application) },
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(application) },
    ];
    menu.toggle(event);
  }

  onLonglist(application: ApplicationListing): void {
    this.router.navigate(['/recruitment/applications/longlist', application.id]);
  }

  onView(application: ApplicationListing): void {
    this.router.navigate(['/recruitment/applications/assigned', application.id]);
  }
}
