import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface InterviewType {
  name: string;
}

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

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Interview Types' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  interviewTypes: InterviewType[] = [
    { name: 'Written Interview' },
    { name: 'Oral Interview' },
    { name: 'Practical Interview' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingInterviewType: InterviewType | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, interviewType: InterviewType, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(interviewType) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(interviewType) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingInterviewType = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(interviewType: InterviewType): void {
    this.dialogMode = 'edit';
    this.editingInterviewType = interviewType;
    this.form.reset({ name: interviewType.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingInterviewType) {
      const target = this.editingInterviewType;
      this.interviewTypes = this.interviewTypes.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Type Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.interviewTypes = [...this.interviewTypes, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Type Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(interviewType: InterviewType): void {
    this.confirmationService.confirm({
      header: 'Delete Interview Type',
      message: `Are you sure you want to delete "${interviewType.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviewTypes = this.interviewTypes.filter((item) => item !== interviewType);
        this.messageService.add({
          severity: 'success',
          summary: 'Interview Type Deleted',
          detail: `"${interviewType.name}" was deleted successfully.`,
        });
      },
    });
  }
}
