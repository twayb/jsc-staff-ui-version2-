import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { InterviewTypeItem, OnlineInterviewDataService } from '../../online-interview-data.service';

@Component({
  selector: 'app-interview-types',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './interview-types.html',
  styleUrl: './interview-types.css',
})
export class InterviewTypes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Setup' },
    { label: 'Interview Types' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  get types(): InterviewTypeItem[] {
    return this.interviewData.interviewTypes;
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingType: InterviewTypeItem | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, type: InterviewTypeItem, menu: Menu): void {
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

  onEdit(type: InterviewTypeItem): void {
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
    const type: InterviewTypeItem = { name: raw.name };

    if (this.dialogMode === 'edit' && this.editingType) {
      const target = this.editingType;
      this.interviewData.interviewTypes = this.interviewData.interviewTypes.map((item) =>
        item === target ? type : item,
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Type Updated',
        detail: `"${type.name}" was updated successfully.`,
      });
    } else {
      this.interviewData.interviewTypes = [...this.interviewData.interviewTypes, type];
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Type Added',
        detail: `"${type.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(type: InterviewTypeItem): void {
    this.confirmationService.confirm({
      header: 'Delete Interview Type',
      message: `Are you sure you want to delete "${type.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviewData.interviewTypes = this.interviewData.interviewTypes.filter((item) => item !== type);
        this.messageService.add({
          severity: 'success',
          summary: 'Interview Type Deleted',
          detail: `"${type.name}" was deleted successfully.`,
        });
      },
    });
  }
}
