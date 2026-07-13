import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface ShortlistRemark {
  name: string;
}

@Component({
  selector: 'app-shortlist-remarks',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './shortlist-remarks.html',
  styleUrl: './shortlist-remarks.css',
})
export class ShortlistRemarks implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Shortlist Remarks' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  remarks: ShortlistRemark[] = [
    { name: 'Does not meet minimum qualification requirements' },
    { name: 'Incomplete application documents' },
    { name: 'Failed to meet age requirement' },
    { name: 'Failed interview/assessment criteria' },
    { name: 'Duplicate application' },
    { name: 'Other' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingRemark: ShortlistRemark | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, remark: ShortlistRemark, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(remark) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(remark) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingRemark = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(remark: ShortlistRemark): void {
    this.dialogMode = 'edit';
    this.editingRemark = remark;
    this.form.reset({ name: remark.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingRemark) {
      const target = this.editingRemark;
      this.remarks = this.remarks.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Remark Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.remarks = [...this.remarks, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Remark Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(remark: ShortlistRemark): void {
    this.confirmationService.confirm({
      header: 'Delete Remark',
      message: `Are you sure you want to delete "${remark.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.remarks = this.remarks.filter((item) => item !== remark);
        this.messageService.add({
          severity: 'success',
          summary: 'Remark Deleted',
          detail: `"${remark.name}" was deleted successfully.`,
        });
      },
    });
  }
}
