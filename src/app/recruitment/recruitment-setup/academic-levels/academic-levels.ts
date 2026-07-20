import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AcademicLevelApiService, AcademicLevelRecord } from '../../../core/masterdata/academic-level-api.service';

interface AcademicLevel {
  id: number;
  name: string;
  level: number;
}

function mapAcademicLevel(record: AcademicLevelRecord): AcademicLevel {
  return {
    id: record.id,
    name: record.name,
    level: record.level,
  };
}

@Component({
  selector: 'app-academic-levels',
  imports: [Menu, AppBreadcrumb, AppDataTable],
  templateUrl: './academic-levels.html',
  styleUrl: './academic-levels.css',
})
export class AcademicLevels implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly academicLevelApi = inject(AcademicLevelApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Academic Levels' },
  ];

  readonly loading = signal(true);
  readonly academicLevels = signal<AcademicLevel[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.academicLevelApi
      .getAcademicLevels()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.academicLevels.set((response.data ?? []).map(mapAcademicLevel));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Academic Levels',
            detail: 'Could not load the academic levels. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, academicLevel: AcademicLevel, menu: Menu): void {
    this.actionMenuItems = [{ label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(academicLevel) }];
    menu.toggle(event);
  }

  // Not wired yet: no confirmed delete endpoint for academic levels — stays local-only for now.
  onDelete(academicLevel: AcademicLevel): void {
    this.confirmationService.confirm({
      header: 'Delete Academic Level',
      message: `Are you sure you want to delete "${academicLevel.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.academicLevels.update((list) => list.filter((item) => item !== academicLevel));
        this.messageService.add({
          severity: 'success',
          summary: 'Academic Level Deleted',
          detail: `"${academicLevel.name}" was deleted successfully.`,
        });
      },
    });
  }
}
