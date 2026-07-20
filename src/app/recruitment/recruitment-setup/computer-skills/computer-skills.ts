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
import { ComputerSkillApiService, ComputerSkillRecord } from '../../../core/masterdata/computer-skill-api.service';

interface ComputerSkill {
  id: number;
  name: string;
}

function mapComputerSkill(record: ComputerSkillRecord): ComputerSkill {
  return { id: record.id, name: record.name };
}

@Component({
  selector: 'app-computer-skills',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './computer-skills.html',
  styleUrl: './computer-skills.css',
})
export class ComputerSkills implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly computerSkillApi = inject(ComputerSkillApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Computer Skills' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly computerSkills = signal<ComputerSkill[]>([]);

  ngOnInit(): void {
    this.loadComputerSkills();
  }

  private loadComputerSkills(): void {
    this.loading.set(true);
    this.computerSkillApi
      .getComputerSkills()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.computerSkills.set((response.data ?? []).map(mapComputerSkill));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Computer Skills',
            detail: 'Could not load the computer skills. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingComputerSkill: ComputerSkill | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  openActionMenu(event: Event, computerSkill: ComputerSkill, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(computerSkill) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(computerSkill) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingComputerSkill = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(computerSkill: ComputerSkill): void {
    this.dialogMode = 'edit';
    this.editingComputerSkill = computerSkill;
    this.form.reset({ name: computerSkill.name });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request =
      this.dialogMode === 'edit' && this.editingComputerSkill
        ? this.computerSkillApi.updateComputerSkill(this.editingComputerSkill.id, raw.name)
        : this.computerSkillApi.createComputerSkill(raw.name);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Computer Skill Updated' : 'Computer Skill Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadComputerSkills();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the computer skill. Please try again later.',
        });
      },
    });
  }

  onDelete(computerSkill: ComputerSkill): void {
    this.confirmationService.confirm({
      header: 'Delete Computer Skill',
      message: `Are you sure you want to delete "${computerSkill.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.computerSkillApi.deleteComputerSkill(computerSkill.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Computer Skill Deleted',
              detail: `"${computerSkill.name}" was deleted successfully.`,
            });
            this.loadComputerSkills();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the computer skill. Please try again later.',
            });
          },
        });
      },
    });
  }
}
