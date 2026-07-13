import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface AttachmentType {
  name: string;
}

@Component({
  selector: 'app-attachment-types',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './attachment-types.html',
  styleUrl: './attachment-types.css',
})
export class AttachmentTypes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Attachment Types' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  attachmentTypes: AttachmentType[] = [
    { name: 'Curriculum Vitae (CV)' },
    { name: 'Deed poll/Affidavit' },
    { name: 'Curriculum Vitae' },
    { name: 'Birth Certificatewire ' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingAttachmentType: AttachmentType | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, attachmentType: AttachmentType, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(attachmentType) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(attachmentType) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingAttachmentType = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(attachmentType: AttachmentType): void {
    this.dialogMode = 'edit';
    this.editingAttachmentType = attachmentType;
    this.form.reset({ name: attachmentType.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingAttachmentType) {
      const target = this.editingAttachmentType;
      this.attachmentTypes = this.attachmentTypes.map((item) => (item === target ? { name: raw.name } : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Attachment Type Updated',
        detail: `"${raw.name}" was updated successfully.`,
      });
    } else {
      this.attachmentTypes = [...this.attachmentTypes, { name: raw.name }];
      this.messageService.add({
        severity: 'success',
        summary: 'Attachment Type Added',
        detail: `"${raw.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(attachmentType: AttachmentType): void {
    this.confirmationService.confirm({
      header: 'Delete Attachment Type',
      message: `Are you sure you want to delete "${attachmentType.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.attachmentTypes = this.attachmentTypes.filter((item) => item !== attachmentType);
        this.messageService.add({
          severity: 'success',
          summary: 'Attachment Type Deleted',
          detail: `"${attachmentType.name}" was deleted successfully.`,
        });
      },
    });
  }
}
