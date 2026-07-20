import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { ApplicationApiService, ApplicationSummaryRecord } from '../../../core/recruitment/application-api.service';

interface CadreInterviewListing {
  advertId: number;
  permitNo: string;
  cadre: string;
  posts: number;
  applicants: number;
}

function mapCadre(record: ApplicationSummaryRecord): CadreInterviewListing {
  return {
    advertId: record.id,
    permitNo: record.advertReferenceNumber,
    cadre: record.schemeName,
    posts: Number(record.advertNumberOfPosts),
    applicants: Number(record.advertTotalApplications),
  };
}

@Component({
  selector: 'app-interview-list-by-cadre',
  imports: [Menu, AppBreadcrumb, AppDataTable],
  templateUrl: './interview-list-by-cadre.html',
  styleUrl: './interview-list-by-cadre.css',
})
export class InterviewListByCadre implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly applicationApi = inject(ApplicationApiService);

  readonly breadcrumbItems: MenuItem[] = [{ label: 'Recruitment', routerLink: '/recruitment' }, { label: 'Interview Management' }];

  readonly loading = signal(true);
  readonly cadres = signal<CadreInterviewListing[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.applicationApi
      .getApplications()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.cadres.set((response.data?.content ?? []).map(mapCadre));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Cadres',
            detail: 'Could not load the interview cadre list. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, cadre: CadreInterviewListing, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(cadre) },
      { label: 'Results', icon: 'pi pi-chart-bar', command: () => this.onResults(cadre) },
    ];
    menu.toggle(event);
  }

  onView(cadre: CadreInterviewListing): void {
    this.router.navigate(['/recruitment/interview-management', cadre.advertId]);
  }

  onResults(cadre: CadreInterviewListing): void {
    this.router.navigate(['/recruitment/interview-management', cadre.advertId, 'results']);
  }
}
