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
import { LanguageApiService, LanguageRecord } from '../../../core/masterdata/language-api.service';
import { titleCase } from '../../../core/utils';

interface Language {
  id: number;
  name: string;
}

function mapLanguage(record: LanguageRecord): Language {
  return { id: record.id, name: titleCase(record.name) };
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
  private readonly languageApi = inject(LanguageApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Languages' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly languages = signal<Language[]>([]);

  ngOnInit(): void {
    this.loadLanguages();
  }

  private loadLanguages(): void {
    this.loading.set(true);
    this.languageApi
      .getLanguages()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.languages.set((response.data ?? []).map(mapLanguage));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Languages',
            detail: 'Could not load the languages. Please try again later.',
          });
        },
      });
  }

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
    const request =
      this.dialogMode === 'edit' && this.editingLanguage
        ? this.languageApi.updateLanguage(this.editingLanguage.id, raw.name)
        : this.languageApi.createLanguage(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Language Updated' : 'Language Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadLanguages();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the language. Please try again later.',
        });
      },
    });
  }

  onDelete(language: Language): void {
    this.confirmationService.confirm({
      header: 'Delete Language',
      message: `Are you sure you want to delete "${language.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.languageApi.deleteLanguage(language.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Language Deleted',
              detail: `"${language.name}" was deleted successfully.`,
            });
            this.loadLanguages();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the language. Please try again later.',
            });
          },
        });
      },
    });
  }
}
