import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface DisabilityCategory {
  name: string;
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

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Disability' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  disabilities: DisabilityCategory[] = [
    { name: 'Visual Impairment' },
    { name: 'Hearing Impairment' },
    { name: 'Physical Disability' },
    { name: 'None' },
  ];

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

    if (this.dialogMode === 'edit' && this.editingDisability) {
      const target = this.editingDisability;
      this.disabilities = this.disabilities.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Disability Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.disabilities = [...this.disabilities, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Disability Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(disability: DisabilityCategory): void {
    this.confirmationService.confirm({
      header: 'Delete Disability',
      message: `Are you sure you want to delete "${disability.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.disabilities = this.disabilities.filter((item) => item !== disability);
        this.messageService.add({
          severity: 'success',
          summary: 'Disability Deleted',
          detail: `"${disability.name}" was deleted successfully.`,
        });
      },
    });
  }
}
