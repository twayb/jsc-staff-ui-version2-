import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import {
  SalaryScaleApiService,
  SalaryScaleInput,
  SalaryScaleRecord,
} from '../../../core/masterdata/salary-scale-api.service';

interface SalaryScaleRow {
  id: number;
  name: string;
  minName: string;
  minAmount: number;
  maxName: string;
  maxAmount: number;
}

function mapSalaryScale(record: SalaryScaleRecord): SalaryScaleRow {
  return {
    id: record.id,
    name: record.scaleName,
    minName: record.minName,
    minAmount: Number(record.minAmount),
    maxName: record.maxName,
    maxAmount: Number(record.maxAmount),
  };
}

@Component({
  selector: 'app-salary-scale',
  imports: [DecimalPipe, ReactiveFormsModule, Menu, Dialog, InputText, InputNumber, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './salary-scale.html',
  styleUrl: './salary-scale.css',
})
export class SalaryScale implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly salaryScaleApi = inject(SalaryScaleApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Salary Scale' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly salaryScales = signal<SalaryScaleRow[]>([]);

  ngOnInit(): void {
    this.loadSalaryScales();
  }

  private loadSalaryScales(): void {
    this.loading.set(true);
    this.salaryScaleApi
      .getSalaryScales()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.salaryScales.set((response.data ?? []).map(mapSalaryScale));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Salary Scales',
            detail: 'Could not load the salary scales. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingSalaryScale: SalaryScaleRow | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    minName: ['', Validators.required],
    minAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    maxName: ['', Validators.required],
    maxAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  openActionMenu(event: Event, salaryScale: SalaryScaleRow, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(salaryScale) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(salaryScale) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingSalaryScale = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(salaryScale: SalaryScaleRow): void {
    this.dialogMode = 'edit';
    this.editingSalaryScale = salaryScale;
    this.form.reset({
      name: salaryScale.name,
      minName: salaryScale.minName,
      minAmount: salaryScale.minAmount,
      maxName: salaryScale.maxName,
      maxAmount: salaryScale.maxAmount,
    });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const input: SalaryScaleInput = {
      scaleName: raw.name,
      minName: raw.minName,
      minAmount: raw.minAmount!,
      maxName: raw.maxName,
      maxAmount: raw.maxAmount!,
    };

    const request =
      this.dialogMode === 'edit' && this.editingSalaryScale
        ? this.salaryScaleApi.updateSalaryScale(this.editingSalaryScale.id, input)
        : this.salaryScaleApi.createSalaryScale(input);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Salary Scale Updated' : 'Salary Scale Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadSalaryScales();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the salary scale. Please try again later.',
        });
      },
    });
  }

  onDelete(salaryScale: SalaryScaleRow): void {
    this.confirmationService.confirm({
      header: 'Delete Salary Scale',
      message: `Are you sure you want to delete "${salaryScale.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.salaryScaleApi.deleteSalaryScale(salaryScale.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Salary Scale Deleted',
              detail: `"${salaryScale.name}" was deleted successfully.`,
            });
            this.loadSalaryScales();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the salary scale. Please try again later.',
            });
          },
        });
      },
    });
  }
}
