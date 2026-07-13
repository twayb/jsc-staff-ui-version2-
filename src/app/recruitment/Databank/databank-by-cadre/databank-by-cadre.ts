import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface DatabankCadre {
  referenceNo: string;
  cadre: string;
  applicants: number;
}

@Component({
  selector: 'app-databank-by-cadre',
  imports: [Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './databank-by-cadre.html',
  styleUrl: './databank-by-cadre.css',
})
export class DatabankByCadre implements OnInit {
  private readonly router = inject(Router);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Databank' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  cadres: DatabankCadre[] = [
    { referenceNo: 'ADV-2026-001', cadre: 'Afisa TEHAMA - Usimamizi wa Data za Kieletroniki (Database Administration) Daraja II', applicants: 42 },
    { referenceNo: 'ADV-2026-002', cadre: 'Afisa Tehama - Usalama Wa Mifumo Ya Tehama (Ict Security) Daraja II', applicants: 76 },
    { referenceNo: 'ADV-2026-003', cadre: 'Afisa Tehama Msaidizi Daraja II (Sehemu Ya Mifumo Ya Habari (Information Systems)', applicants: 21 },
    { referenceNo: 'ADV-2026-004', cadre: 'Research Officer', applicants: 15 },
  ];

  onViewCandidate(cadre: DatabankCadre): void {
    this.router.navigate(['/recruitment/databank', cadre.referenceNo], {
      queryParams: { cadre: cadre.cadre },
    });
  }
}
