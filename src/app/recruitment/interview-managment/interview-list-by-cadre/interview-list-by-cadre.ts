import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface CadreInterviewListing {
  permitNo: string;
  cadre: string;
  posts: number;
  applicants: number;
}

@Component({
  selector: 'app-interview-list-by-cadre',
  imports: [Menu, AppBreadcrumb, AppDataTable],
  templateUrl: './interview-list-by-cadre.html',
  styleUrl: './interview-list-by-cadre.css',
})
export class InterviewListByCadre implements OnInit {
  private readonly router = inject(Router);

  readonly breadcrumbItems: MenuItem[] = [{ label: 'Recruitment', routerLink: '/recruitment' }, { label: 'Interview Management' }];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  cadres: CadreInterviewListing[] = [
    { permitNo: 'PR-2026-001', cadre: 'Afisa Tehama - Usimamizi Wa Data Za Kieletroniki (Database Administration) Daraja II', posts: 5, applicants: 42 },
    { permitNo: 'PR-2026-002', cadre: 'Afisa Tehama - Usalama Wa Mifumo Ya Tehama (Ict Security) Daraja II', posts: 8, applicants: 76 },
    { permitNo: 'PR-2026-003', cadre: 'Afisa Hesabu Daraja II', posts: 3, applicants: 21 },
    { permitNo: 'PR-2026-004', cadre: 'Msaidizi wa Hesabu Daraja I', posts: 2, applicants: 15 },
  ];

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, cadre: CadreInterviewListing, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(cadre) },
      { label: 'Results', icon: 'pi pi-chart-bar', command: () => this.onResults(cadre) },
    ];
    menu.toggle(event);
  }

  onView(cadre: CadreInterviewListing): void {
    this.router.navigate(['/recruitment/interview-management', cadre.permitNo]);
  }

  onResults(cadre: CadreInterviewListing): void {
    this.router.navigate(['/recruitment/interview-management', cadre.permitNo, 'results']);
  }
}
