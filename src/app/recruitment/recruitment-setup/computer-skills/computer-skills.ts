import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface ComputerSkill {
  name: string;
}

@Component({
  selector: 'app-computer-skills',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './computer-skills.html',
  styleUrl: './computer-skills.css',
})
export class ComputerSkills implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Computer Skills' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  computerSkills: ComputerSkill[] = [
    { name: 'Microsoft Word' },
    { name: 'Microsoft Excel' },
    { name: 'Microsoft PowerPoint' },
    { name: 'Database Management' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingComputerSkill: ComputerSkill | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, computerSkill: ComputerSkill, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(computerSkill) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(computerSkill) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingComputerSkill = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(computerSkill: ComputerSkill): void {
    this.dialogMode = 'edit';
    this.editingComputerSkill = computerSkill;
    this.form.reset({ name: computerSkill.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingComputerSkill) {
      const target = this.editingComputerSkill;
      this.computerSkills = this.computerSkills.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Computer Skill Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.computerSkills = [...this.computerSkills, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Computer Skill Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(computerSkill: ComputerSkill): void {
    this.confirmationService.confirm({
      header: 'Delete Computer Skill',
      message: `Are you sure you want to delete "${computerSkill.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.computerSkills = this.computerSkills.filter((item) => item !== computerSkill);
        this.messageService.add({
          severity: 'success',
          summary: 'Computer Skill Deleted',
          detail: `"${computerSkill.name}" was deleted successfully.`,
        });
      },
    });
  }
}
