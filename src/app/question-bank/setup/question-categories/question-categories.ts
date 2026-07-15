import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type CategoryType = 'General' | 'Profession';
type CategoryStatus = 'Active' | 'Inactive';

interface QuestionCategoryItem {
  category: CategoryType;
  status: CategoryStatus;
}

@Component({
  selector: 'app-question-categories',
  imports: [ReactiveFormsModule, Menu, Dialog, Select, Tag, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './question-categories.html',
  styleUrl: './question-categories.css',
})
export class QuestionCategories implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Setup' },
    { label: 'Question Categories' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly categoryOptions = [
    { label: 'General', value: 'General' },
    { label: 'Profession', value: 'Profession' },
  ];

  readonly statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  categories: QuestionCategoryItem[] = [
    { category: 'General', status: 'Active' },
    { category: 'Profession', status: 'Active' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingCategory: QuestionCategoryItem | null = null;

  readonly form = this.fb.nonNullable.group({
    category: this.fb.nonNullable.control<CategoryType | ''>('', Validators.required),
    status: this.fb.nonNullable.control<CategoryStatus>('Active', Validators.required),
  });

  statusSeverity(status: CategoryStatus): 'success' | 'secondary' {
    return status === 'Active' ? 'success' : 'secondary';
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
    this.form.reset({ category: '', status: 'Active' });
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
    const category: QuestionCategoryItem = {
      category: raw.category as CategoryType,
      status: raw.status,
    };

    if (this.dialogMode === 'edit' && this.editingCategory) {
      const target = this.editingCategory;
      this.categories = this.categories.map((item) => (item === target ? category : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Question Category Updated',
        detail: `"${category.category}" was updated successfully.`,
      });
    } else {
      this.categories = [...this.categories, category];
      this.messageService.add({
        severity: 'success',
        summary: 'Question Category Added',
        detail: `"${category.category}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(category: QuestionCategoryItem): void {
    this.confirmationService.confirm({
      header: 'Delete Question Category',
      message: `Are you sure you want to delete "${category.category}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.categories = this.categories.filter((item) => item !== category);
        this.messageService.add({
          severity: 'success',
          summary: 'Question Category Deleted',
          detail: `"${category.category}" was deleted successfully.`,
        });
      },
    });
  }
}
