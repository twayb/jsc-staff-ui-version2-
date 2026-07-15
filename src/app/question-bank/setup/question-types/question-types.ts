import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface QuestionTypeItem {
  name: string;
}

@Component({
  selector: 'app-question-types',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './question-types.html',
  styleUrl: './question-types.css',
})
export class QuestionTypes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Setup' },
    { label: 'Question Types' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  types: QuestionTypeItem[] = [
    { name: 'Multiple Choice' },
    { name: 'True/False' },
    { name: 'Short Answer' },
    { name: 'Essay' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingType: QuestionTypeItem | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, type: QuestionTypeItem, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(type) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(type) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingType = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(type: QuestionTypeItem): void {
    this.dialogMode = 'edit';
    this.editingType = type;
    this.form.reset({ name: type.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const type: QuestionTypeItem = { name: raw.name };

    if (this.dialogMode === 'edit' && this.editingType) {
      const target = this.editingType;
      this.types = this.types.map((item) => (item === target ? type : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Question Type Updated',
        detail: `"${type.name}" was updated successfully.`,
      });
    } else {
      this.types = [...this.types, type];
      this.messageService.add({
        severity: 'success',
        summary: 'Question Type Added',
        detail: `"${type.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(type: QuestionTypeItem): void {
    this.confirmationService.confirm({
      header: 'Delete Question Type',
      message: `Are you sure you want to delete "${type.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.types = this.types.filter((item) => item !== type);
        this.messageService.add({
          severity: 'success',
          summary: 'Question Type Deleted',
          detail: `"${type.name}" was deleted successfully.`,
        });
      },
    });
  }
}
