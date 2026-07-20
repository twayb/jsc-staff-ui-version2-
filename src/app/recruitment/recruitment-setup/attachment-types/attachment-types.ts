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
import { AttachmentTypeApiService, AttachmentTypeRecord } from '../../../core/masterdata/attachment-type-api.service';

interface AttachmentType {
  id: number;
  name: string;
}

function mapAttachmentType(record: AttachmentTypeRecord): AttachmentType {
  return { id: record.id, name: record.name };
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
  private readonly attachmentTypeApi = inject(AttachmentTypeApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Attachment Types' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly attachmentTypes = signal<AttachmentType[]>([]);

  ngOnInit(): void {
    this.loadAttachmentTypes();
  }

  private loadAttachmentTypes(): void {
    this.loading.set(true);
    this.attachmentTypeApi
      .getAttachmentTypes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.attachmentTypes.set((response.data ?? []).map(mapAttachmentType));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Attachment Types',
            detail: 'Could not load the attachment types. Please try again later.',
          });
        },
      });
  }

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
    const request =
      this.dialogMode === 'edit' && this.editingAttachmentType
        ? this.attachmentTypeApi.updateAttachmentType(this.editingAttachmentType.id, raw.name)
        : this.attachmentTypeApi.createAttachmentType(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Attachment Type Updated' : 'Attachment Type Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadAttachmentTypes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the attachment type. Please try again later.',
        });
      },
    });
  }

  onDelete(attachmentType: AttachmentType): void {
    this.confirmationService.confirm({
      header: 'Delete Attachment Type',
      message: `Are you sure you want to delete "${attachmentType.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.attachmentTypeApi.deleteAttachmentType(attachmentType.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Attachment Type Deleted',
              detail: `"${attachmentType.name}" was deleted successfully.`,
            });
            this.loadAttachmentTypes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the attachment type. Please try again later.',
            });
          },
        });
      },
    });
  }
}
