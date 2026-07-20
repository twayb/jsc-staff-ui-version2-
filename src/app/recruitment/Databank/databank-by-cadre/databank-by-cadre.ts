import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../../shared/count-up.directive';
import { DatabankApplicationRecord, DatabankApiService } from '../../../core/recruitment/databank-api.service';

interface DatabankCadre {
  advertId: number;
  referenceNo: string;
  cadre: string;
  applicants: number;
  male: number;
  female: number;
}

function mapDatabankCadre(record: DatabankApplicationRecord): DatabankCadre {
  return {
    advertId: record.advertId,
    referenceNo: record.referenceNumber,
    cadre: record.advertName,
    applicants: record.totalApplicants,
    male: record.maleApplicants,
    female: record.femaleApplicants,
  };
}

@Component({
  selector: 'app-databank-by-cadre',
  imports: [Tooltip, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './databank-by-cadre.html',
  styleUrl: './databank-by-cadre.css',
})
export class DatabankByCadre implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly databankApi = inject(DatabankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Databank' },
  ];

  readonly loading = signal(true);
  readonly cadres = signal<DatabankCadre[]>([]);

  readonly totalApplicants = computed(() => this.cadres().reduce((sum, c) => sum + c.applicants, 0));
  readonly maleApplicants = computed(() => this.cadres().reduce((sum, c) => sum + c.male, 0));
  readonly femaleApplicants = computed(() => this.cadres().reduce((sum, c) => sum + c.female, 0));

  ngOnInit(): void {
    this.loading.set(true);
    this.databankApi
      .getDatabankApplications()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.cadres.set((response.data ?? []).map(mapDatabankCadre));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Databank',
            detail: 'Could not load the applicant databank. Please try again later.',
          });
        },
      });
  }

  onViewCandidate(cadre: DatabankCadre): void {
    this.router.navigate(['/recruitment/databank', cadre.advertId], {
      queryParams: { cadre: cadre.cadre },
    });
  }
}
