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
import { QuestionBankApiService, QuestionTypeRecord } from '../../../core/question-bank/question-bank-api.service';

interface QuestionTypeItem {
  id: number;
  name: string;
}

function mapQuestionType(record: QuestionTypeRecord): QuestionTypeItem {
  return { id: record.id, name: record.name };
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
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Setup' },
    { label: 'Question Types' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly types = signal<QuestionTypeItem[]>([]);

  ngOnInit(): void {
    this.loadTypes();
  }

  private loadTypes(): void {
    this.loading.set(true);
    this.questionBankApi
      .getQuestionTypes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.types.set((response.data?.content ?? []).map(mapQuestionType));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Question Types',
            detail: 'Could not load the question types. Please try again later.',
          });
        },
      });
  }

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
    const request =
      this.dialogMode === 'edit' && this.editingType
        ? this.questionBankApi.updateQuestionType(this.editingType.id, raw.name)
        : this.questionBankApi.createQuestionType(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Question Type Updated' : 'Question Type Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadTypes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the question type. Please try again later.',
        });
      },
    });
  }

  onDelete(type: QuestionTypeItem): void {
    this.confirmationService.confirm({
      header: 'Delete Question Type',
      message: `Are you sure you want to delete "${type.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.questionBankApi.deleteQuestionType(type.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Question Type Deleted',
              detail: `"${type.name}" was deleted successfully.`,
            });
            this.loadTypes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the question type. Please try again later.',
            });
          },
        });
      },
    });
  }
}
