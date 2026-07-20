import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { DisabilityApiService, DisabilityRecord } from '../../../core/masterdata/disability-api.service';

interface DisabilityCategory {
  id: number;
  name: string;
}

function mapDisability(record: DisabilityRecord): DisabilityCategory {
  return { id: record.id, name: record.name };
}

@Component({
  selector: 'app-disability',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './disability.html',
  styleUrl: './disability.css',
})
export class Disability implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly disabilityApi = inject(DisabilityApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Disability' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly disabilities = signal<DisabilityCategory[]>([]);

  ngOnInit(): void {
    this.loadDisabilities();
  }

  private loadDisabilities(): void {
    this.loading.set(true);
    this.disabilityApi
      .getDisabilities()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.disabilities.set((response.data ?? []).map(mapDisability));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Disabilities',
            detail: 'Could not load the disability categories. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingDisability: DisabilityCategory | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, disability: DisabilityCategory, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(disability) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(disability) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingDisability = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(disability: DisabilityCategory): void {
    this.dialogMode = 'edit';
    this.editingDisability = disability;
    this.form.reset({ name: disability.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request =
      this.dialogMode === 'edit' && this.editingDisability
        ? this.disabilityApi.updateDisability(this.editingDisability.id, raw.name)
        : this.disabilityApi.createDisability(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Disability Updated' : 'Disability Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadDisabilities();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the disability category. Please try again later.',
        });
      },
    });
  }

  onDelete(disability: DisabilityCategory): void {
    this.confirmationService.confirm({
      header: 'Delete Disability',
      message: `Are you sure you want to delete "${disability.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.disabilityApi.deleteDisability(disability.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Disability Deleted',
              detail: `"${disability.name}" was deleted successfully.`,
            });
            this.loadDisabilities();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the disability category. Please try again later.',
            });
          },
        });
      },
    });
  }
}
