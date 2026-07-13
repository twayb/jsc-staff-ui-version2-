import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface SalaryScaleRecord {
  name: string;
  minName: string;
  minAmount: number;
  maxName: string;
  maxAmount: number;
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

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Salary Scale' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  salaryScales: SalaryScaleRecord[] = [
    { name: 'TGS D', minName: 'TGS D1', minAmount: 400000, maxName: 'TGS D3', maxAmount: 450000 },
    { name: 'TGS E', minName: 'TGS E1', minAmount: 500000, maxName: 'TGS E5', maxAmount: 900000 },
    { name: 'TGS F', minName: 'TGS F1', minAmount: 950000, maxName: 'TGS F4', maxAmount: 1200000 },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingSalaryScale: SalaryScaleRecord | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    minName: ['', Validators.required],
    minAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    maxName: ['', Validators.required],
    maxAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  openActionMenu(event: Event, salaryScale: SalaryScaleRecord, menu: Menu): void {
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

  onEdit(salaryScale: SalaryScaleRecord): void {
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
    const salaryScale: SalaryScaleRecord = {
      name: raw.name,
      minName: raw.minName,
      minAmount: raw.minAmount!,
      maxName: raw.maxName,
      maxAmount: raw.maxAmount!,
    };

    if (this.dialogMode === 'edit' && this.editingSalaryScale) {
      const target = this.editingSalaryScale;
      this.salaryScales = this.salaryScales.map((item) => (item === target ? salaryScale : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Salary Scale Updated',
        detail: `"${salaryScale.name}" was updated successfully.`,
      });
    } else {
      this.salaryScales = [...this.salaryScales, salaryScale];
      this.messageService.add({
        severity: 'success',
        summary: 'Salary Scale Added',
        detail: `"${salaryScale.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(salaryScale: SalaryScaleRecord): void {
    this.confirmationService.confirm({
      header: 'Delete Salary Scale',
      message: `Are you sure you want to delete "${salaryScale.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.salaryScales = this.salaryScales.filter((item) => item !== salaryScale);
        this.messageService.add({
          severity: 'success',
          summary: 'Salary Scale Deleted',
          detail: `"${salaryScale.name}" was deleted successfully.`,
        });
      },
    });
  }
}
