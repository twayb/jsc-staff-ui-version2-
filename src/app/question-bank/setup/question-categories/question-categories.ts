import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { QuestionBankApiService, QuestionCategoryRecord } from '../../../core/question-bank/question-bank-api.service';

interface QuestionCategoryItem {
  id: number;
  category: string;
  status: boolean;
}

function mapQuestionCategory(record: QuestionCategoryRecord): QuestionCategoryItem {
  return { id: record.id, category: record.category, status: record.status };
}

@Component({
  selector: 'app-question-categories',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, ToggleSwitch, Tag, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './question-categories.html',
  styleUrl: './question-categories.css',
})
export class QuestionCategories implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Setup' },
    { label: 'Question Categories' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly categories = signal<QuestionCategoryItem[]>([]);

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.questionBankApi
      .getQuestionCategories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.categories.set((response.data?.content ?? []).map(mapQuestionCategory));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Question Categories',
            detail: 'Could not load the question categories. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingCategory: QuestionCategoryItem | null = null;

  readonly form = this.fb.nonNullable.group({
    category: ['', Validators.required],
    status: this.fb.nonNullable.control<boolean>(true, Validators.required),
  });

  statusSeverity(status: boolean): 'success' | 'secondary' {
    return status ? 'success' : 'secondary';
  }

  openActionMenu(event: Event, category: QuestionCategoryItem, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(category) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(category) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingCategory = null;
    this.form.reset({ category: '', status: true });
    this.showFormDialog = true;
  }

  onEdit(category: QuestionCategoryItem): void {
    this.dialogMode = 'edit';
    this.editingCategory = category;
    this.form.reset({ category: category.category, status: category.status });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request =
      this.dialogMode === 'edit' && this.editingCategory
        ? this.questionBankApi.updateQuestionCategory(this.editingCategory.id, raw)
        : this.questionBankApi.createQuestionCategory(raw);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Question Category Updated' : 'Question Category Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadCategories();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the question category. Please try again later.',
        });
      },
    });
  }

  onDelete(category: QuestionCategoryItem): void {
    this.confirmationService.confirm({
      header: 'Delete Question Category',
      message: `Are you sure you want to delete "${category.category}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.questionBankApi.deleteQuestionCategory(category.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Question Category Deleted',
              detail: `"${category.category}" was deleted successfully.`,
            });
            this.loadCategories();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the question category. Please try again later.',
            });
          },
        });
      },
    });
  }
}
