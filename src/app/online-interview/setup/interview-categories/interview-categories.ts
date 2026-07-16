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
import {
  InterviewCategoryItem,
  InterviewCategoryStatus,
  InterviewCategoryType,
  OnlineInterviewDataService,
} from '../../online-interview-data.service';

@Component({
  selector: 'app-interview-categories',
  imports: [ReactiveFormsModule, Menu, Dialog, Select, Tag, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './interview-categories.html',
  styleUrl: './interview-categories.css',
})
export class InterviewCategories implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Setup' },
    { label: 'Interview Categories' },
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

  get categories(): InterviewCategoryItem[] {
    return this.interviewData.interviewCategories;
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingCategory: InterviewCategoryItem | null = null;

  readonly form = this.fb.nonNullable.group({
    category: this.fb.nonNullable.control<InterviewCategoryType | ''>('', Validators.required),
    status: this.fb.nonNullable.control<InterviewCategoryStatus>('Active', Validators.required),
  });

  statusSeverity(status: InterviewCategoryStatus): 'success' | 'secondary' {
    return status === 'Active' ? 'success' : 'secondary';
  }

  openActionMenu(event: Event, category: InterviewCategoryItem, menu: Menu): void {
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

  onEdit(category: InterviewCategoryItem): void {
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
    const category: InterviewCategoryItem = {
      category: raw.category as InterviewCategoryType,
      status: raw.status,
    };

    if (this.dialogMode === 'edit' && this.editingCategory) {
      const target = this.editingCategory;
      this.interviewData.interviewCategories = this.interviewData.interviewCategories.map((item) =>
        item === target ? category : item,
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Category Updated',
        detail: `"${category.category}" was updated successfully.`,
      });
    } else {
      this.interviewData.interviewCategories = [...this.interviewData.interviewCategories, category];
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Category Added',
        detail: `"${category.category}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(category: InterviewCategoryItem): void {
    this.confirmationService.confirm({
      header: 'Delete Interview Category',
      message: `Are you sure you want to delete "${category.category}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviewData.interviewCategories = this.interviewData.interviewCategories.filter(
          (item) => item !== category,
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Interview Category Deleted',
          detail: `"${category.category}" was deleted successfully.`,
        });
      },
    });
  }
}
