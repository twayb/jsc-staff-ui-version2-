import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface AcademicLevel {
  name: string;
  level: number;
}

@Component({
  selector: 'app-academic-levels',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, InputNumber, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './academic-levels.html',
  styleUrl: './academic-levels.css',
})
export class AcademicLevels implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Academic Levels' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  academicLevels: AcademicLevel[] = [
    { name: 'Certificate', level: 1 },
    { name: 'Diploma', level: 2 },
    { name: "Bachelor's Degree", level: 3 },
    { name: "Master's Degree", level: 4 },
    { name: 'PhD', level: 5 },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingAcademicLevel: AcademicLevel | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    level: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  openActionMenu(event: Event, academicLevel: AcademicLevel, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(academicLevel) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(academicLevel) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingAcademicLevel = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(academicLevel: AcademicLevel): void {
    this.dialogMode = 'edit';
    this.editingAcademicLevel = academicLevel;
    this.form.reset({ name: academicLevel.name, level: academicLevel.level });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const academicLevel: AcademicLevel = { name: raw.name, level: raw.level! };

    if (this.dialogMode === 'edit' && this.editingAcademicLevel) {
      const target = this.editingAcademicLevel;
      this.academicLevels = this.academicLevels.map((item) => (item === target ? academicLevel : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Academic Level Updated',
        detail: `"${academicLevel.name}" was updated successfully.`,
      });
    } else {
      this.academicLevels = [...this.academicLevels, academicLevel];
      this.messageService.add({
        severity: 'success',
        summary: 'Academic Level Added',
        detail: `"${academicLevel.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(academicLevel: AcademicLevel): void {
    this.confirmationService.confirm({
      header: 'Delete Academic Level',
      message: `Are you sure you want to delete "${academicLevel.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.academicLevels = this.academicLevels.filter((item) => item !== academicLevel);
        this.messageService.add({
          severity: 'success',
          summary: 'Academic Level Deleted',
          detail: `"${academicLevel.name}" was deleted successfully.`,
        });
      },
    });
  }
}
