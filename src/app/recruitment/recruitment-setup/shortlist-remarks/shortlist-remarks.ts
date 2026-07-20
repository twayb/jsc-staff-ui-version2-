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
import {
  ApplicationRemarkApiService,
  ApplicationRemarkRecord,
} from '../../../core/masterdata/application-remark-api.service';

interface ShortlistRemark {
  id: number;
  name: string;
}

function mapRemark(record: ApplicationRemarkRecord): ShortlistRemark {
  return { id: record.id, name: record.remark };
}

@Component({
  selector: 'app-shortlist-remarks',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './shortlist-remarks.html',
  styleUrl: './shortlist-remarks.css',
})
export class ShortlistRemarks implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly remarkApi = inject(ApplicationRemarkApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Shortlist Remarks' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly remarks = signal<ShortlistRemark[]>([]);

  ngOnInit(): void {
    this.loadRemarks();
  }

  private loadRemarks(): void {
    this.loading.set(true);
    this.remarkApi
      .getRemarks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.remarks.set((response.data ?? []).map(mapRemark));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Remarks',
            detail: 'Could not load the shortlist remarks. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingRemark: ShortlistRemark | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, remark: ShortlistRemark, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(remark) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(remark) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingRemark = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(remark: ShortlistRemark): void {
    this.dialogMode = 'edit';
    this.editingRemark = remark;
    this.form.reset({ name: remark.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request =
      this.dialogMode === 'edit' && this.editingRemark
        ? this.remarkApi.updateRemark(this.editingRemark.id, raw.name)
        : this.remarkApi.createRemark(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Remark Updated' : 'Remark Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadRemarks();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the remark. Please try again later.',
        });
      },
    });
  }

  onDelete(remark: ShortlistRemark): void {
    this.confirmationService.confirm({
      header: 'Delete Remark',
      message: `Are you sure you want to delete "${remark.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.remarkApi.deleteRemark(remark.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Remark Deleted',
              detail: `"${remark.name}" was deleted successfully.`,
            });
            this.loadRemarks();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the remark. Please try again later.',
            });
          },
        });
      },
    });
  }
}
