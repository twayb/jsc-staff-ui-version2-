import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface SelectionCadre {
  referenceNo: string;
  cadre: string;
  closeDate: string;
  totalSelection: number;
}

@Component({
  selector: 'app-selection-by-cadre',
  imports: [Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './selection-by-cadre.html',
  styleUrl: './selection-by-cadre.css',
})
export class SelectionByCadre implements OnInit {
  private readonly router = inject(Router);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Selection' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  cadres: SelectionCadre[] = [
    { referenceNo: 'ADV-2026-001', cadre: 'Afisa TEHAMA - Usimamizi wa Data za Kieletroniki (Database Administration) Daraja II', closeDate: '2026-02-10', totalSelection: 5 },
    { referenceNo: 'ADV-2026-002', cadre: 'Afisa Tehama - Usalama Wa Mifumo Ya Tehama (Ict Security) Daraja II', closeDate: '2026-03-01', totalSelection: 8 },
    { referenceNo: 'ADV-2026-003', cadre: 'Afisa Tehama Msaidizi Daraja II (Sehemu Ya Mifumo Ya Habari (Information Systems)', closeDate: '2025-12-15', totalSelection: 3 },
    { referenceNo: 'ADV-2026-004', cadre: 'Research Officer', closeDate: '2026-01-01', totalSelection: 2 },
  ];

  onView(cadre: SelectionCadre): void {
    this.router.navigate(['/recruitment/selection', cadre.referenceNo], {
      queryParams: { cadre: cadre.cadre },
    });
  }
}
