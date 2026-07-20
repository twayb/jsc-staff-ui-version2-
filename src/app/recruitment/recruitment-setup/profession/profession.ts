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
import { ProfessionApiService, ProfessionRecord } from '../../../core/masterdata/profession-api.service';

interface ProfessionRow {
  id: number;
  name: string;
}

function mapProfession(record: ProfessionRecord): ProfessionRow {
  return { id: record.id, name: record.name };
}

@Component({
  selector: 'app-profession',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './profession.html',
  styleUrl: './profession.css',
})
export class Profession implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly professionApi = inject(ProfessionApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Profession' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly professions = signal<ProfessionRow[]>([]);

  ngOnInit(): void {
    this.loadProfessions();
  }

  private loadProfessions(): void {
    this.loading.set(true);
    this.professionApi
      .getProfessions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.professions.set((response.data ?? []).map(mapProfession));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Professions',
            detail: 'Could not load the professions. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingProfession: ProfessionRow | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, profession: ProfessionRow, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(profession) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(profession) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingProfession = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(profession: ProfessionRow): void {
    this.dialogMode = 'edit';
    this.editingProfession = profession;
    this.form.reset({ name: profession.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request =
      this.dialogMode === 'edit' && this.editingProfession
        ? this.professionApi.updateProfession(this.editingProfession.id, raw.name)
        : this.professionApi.createProfession(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Profession Updated' : 'Profession Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadProfessions();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the profession. Please try again later.',
        });
      },
    });
  }

  onDelete(profession: ProfessionRow): void {
    this.confirmationService.confirm({
      header: 'Delete Profession',
      message: `Are you sure you want to delete "${profession.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.professionApi.deleteProfession(profession.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Profession Deleted',
              detail: `"${profession.name}" was deleted successfully.`,
            });
            this.loadProfessions();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the profession. Please try again later.',
            });
          },
        });
      },
    });
  }
}
