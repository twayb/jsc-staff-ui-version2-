import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface Language {
  name: string;
}

@Component({
  selector: 'app-languages',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './languages.html',
  styleUrl: './languages.css',
})
export class Languages implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Languages' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  languages: Language[] = [
    { name: 'Swahili' },
    { name: 'English' },
    { name: 'French' },
    { name: 'Arabic' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingLanguage: Language | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, language: Language, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(language) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(language) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingLanguage = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(language: Language): void {
    this.dialogMode = 'edit';
    this.editingLanguage = language;
    this.form.reset({ name: language.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingLanguage) {
      const target = this.editingLanguage;
      this.languages = this.languages.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Language Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.languages = [...this.languages, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Language Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(language: Language): void {
    this.confirmationService.confirm({
      header: 'Delete Language',
      message: `Are you sure you want to delete "${language.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.languages = this.languages.filter((item) => item !== language);
        this.messageService.add({
          severity: 'success',
          summary: 'Language Deleted',
          detail: `"${language.name}" was deleted successfully.`,
        });
      },
    });
  }
}
