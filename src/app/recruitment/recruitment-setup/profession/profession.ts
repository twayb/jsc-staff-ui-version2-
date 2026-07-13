import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface ProfessionRecord {
  name: string;
}

@Component({
  selector: 'app-profession',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './profession.html',
  styleUrl: './profession.css',
})
export class Profession implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Profession' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  professions: ProfessionRecord[] = [
    { name: 'Procurement and Supplies Full Technician' },
    { name: 'Graduate Procurement and Supplies Professionals' },
    { name: 'Driving licence' },
    { name: 'Management Development Program for Executive Assistants (MDEA I)' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingProfession: ProfessionRecord | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, profession: ProfessionRecord, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(profession) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(profession) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingProfession = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(profession: ProfessionRecord): void {
    this.dialogMode = 'edit';
    this.editingProfession = profession;
    this.form.reset({ name: profession.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingProfession) {
      const target = this.editingProfession;
      this.professions = this.professions.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Profession Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.professions = [...this.professions, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Profession Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(profession: ProfessionRecord): void {
    this.confirmationService.confirm({
      header: 'Delete Profession',
      message: `Are you sure you want to delete "${profession.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.professions = this.professions.filter((item) => item !== profession);
        this.messageService.add({
          severity: 'success',
          summary: 'Profession Deleted',
          detail: `"${profession.name}" was deleted successfully.`,
        });
      },
    });
  }
}
