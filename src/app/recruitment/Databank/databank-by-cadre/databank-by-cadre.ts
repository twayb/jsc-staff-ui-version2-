import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../../shared/count-up.directive';

interface DatabankCadre {
  referenceNo: string;
  cadre: string;
  applicants: number;
  male: number;
  female: number;
}

@Component({
  selector: 'app-databank-by-cadre',
  imports: [Tooltip, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
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
    { referenceNo: 'ADV-2026-001', cadre: 'Afisa TEHAMA - Usimamizi wa Data za Kieletroniki (Database Administration) Daraja II', applicants: 42, male: 24, female: 18 },
    { referenceNo: 'ADV-2026-002', cadre: 'Afisa Tehama - Usalama Wa Mifumo Ya Tehama (Ict Security) Daraja II', applicants: 76, male: 41, female: 35 },
    { referenceNo: 'ADV-2026-003', cadre: 'Afisa Tehama Msaidizi Daraja II (Sehemu Ya Mifumo Ya Habari (Information Systems)', applicants: 21, male: 9, female: 12 },
    { referenceNo: 'ADV-2026-004', cadre: 'Research Officer', applicants: 15, male: 8, female: 7 },
  ];

  get totalApplicants(): number {
    return this.cadres.reduce((sum, c) => sum + c.applicants, 0);
  }

  get maleApplicants(): number {
    return this.cadres.reduce((sum, c) => sum + c.male, 0);
  }

  get femaleApplicants(): number {
    return this.cadres.reduce((sum, c) => sum + c.female, 0);
  }

  onViewCandidate(cadre: DatabankCadre): void {
    this.router.navigate(['/recruitment/databank', cadre.referenceNo], {
      queryParams: { cadre: cadre.cadre },
    });
  }
}
