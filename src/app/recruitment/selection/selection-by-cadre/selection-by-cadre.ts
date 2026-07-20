import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../../shared/count-up.directive';
import { SelectedApplicationRecord, SelectionApiService } from '../../../core/recruitment/selection-api.service';

interface SelectionCadre {
  advertId: number;
  referenceNo: string;
  cadre: string;
  closeDate: string;
  totalSelection: number;
}

function mapSelectionCadre(record: SelectedApplicationRecord): SelectionCadre {
  return {
    advertId: record.advertId,
    referenceNo: record.referenceNumber,
    cadre: record.advertName,
    closeDate: record.closingDate,
    totalSelection: record.totalSelections,
  };
}

@Component({
  selector: 'app-selection-by-cadre',
  imports: [Tooltip, AppBreadcrumb, AppDataTable, AppSkeleton, CountUp],
  templateUrl: './selection-by-cadre.html',
  styleUrl: './selection-by-cadre.css',
})
export class SelectionByCadre implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly selectionApi = inject(SelectionApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Selection' },
  ];

  readonly loading = signal(true);
  readonly cadres = signal<SelectionCadre[]>([]);

  readonly totalSelections = computed(() => this.cadres().reduce((sum, c) => sum + c.totalSelection, 0));
  readonly totalCadres = computed(() => this.cadres().length);

  ngOnInit(): void {
    this.loading.set(true);
    this.selectionApi
      .getSelectedApplications()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.cadres.set((response.data ?? []).map(mapSelectionCadre));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Selections',
            detail: 'Could not load the selected applications. Please try again later.',
          });
        },
      });
  }

  onView(cadre: SelectionCadre): void {
    this.router.navigate(['/recruitment/selection', cadre.advertId], {
      queryParams: { cadre: cadre.cadre },
    });
  }
}
