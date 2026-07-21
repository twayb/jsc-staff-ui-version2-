import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppRichTextEditor } from '../../shared/app-rich-text-editor/app-rich-text-editor';
import {
  InterviewInstructionApiService,
  InterviewInstructionRecord,
} from '../../core/online-interview/interview-instruction-api.service';

interface InterviewInstructionItem {
  id: number;
  instruction: string;
  status: boolean;
}

function mapInstruction(record: InterviewInstructionRecord): InterviewInstructionItem {
  return { id: record.id, instruction: record.instruction, status: record.status };
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

@Component({
  selector: 'app-interview-instructions',
  imports: [ReactiveFormsModule, Menu, Dialog, ToggleSwitch, Tag, Button, AppBreadcrumb, AppDataTable, AppRichTextEditor],
  templateUrl: './interview-instructions.html',
  styleUrl: './interview-instructions.css',
})
export class InterviewInstructions implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly instructionApi = inject(InterviewInstructionApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview Instructions' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly instructions = signal<InterviewInstructionItem[]>([]);

  readonly stripHtml = stripHtml;

  ngOnInit(): void {
    this.loadInstructions();
  }

  private loadInstructions(): void {
    this.loading.set(true);
    this.instructionApi
      .getInstructions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.instructions.set((response.data?.content ?? []).map(mapInstruction));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Instructions',
            detail: 'Could not load the interview instructions. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingInstruction: InterviewInstructionItem | null = null;

  readonly form = this.fb.nonNullable.group({
    instruction: ['', Validators.required],
    status: this.fb.nonNullable.control<boolean>(true, Validators.required),
  });

  statusSeverity(status: boolean): 'success' | 'secondary' {
    return status ? 'success' : 'secondary';
  }

  openActionMenu(event: Event, instruction: InterviewInstructionItem, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(instruction) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(instruction) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingInstruction = null;
    this.form.reset({ instruction: '', status: true });
    this.showFormDialog = true;
  }

  onEdit(instruction: InterviewInstructionItem): void {
    this.dialogMode = 'edit';
    this.editingInstruction = instruction;
    this.form.reset({ instruction: instruction.instruction, status: instruction.status });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request =
      this.dialogMode === 'edit' && this.editingInstruction
        ? this.instructionApi.updateInstruction(this.editingInstruction.id, raw)
        : this.instructionApi.createInstruction(raw);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Instruction Updated' : 'Instruction Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadInstructions();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the instruction. Please try again later.',
        });
      },
    });
  }

  onDelete(instruction: InterviewInstructionItem): void {
    this.confirmationService.confirm({
      header: 'Delete Instruction',
      message: 'Are you sure you want to delete this instruction? This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.instructionApi.deleteInstruction(instruction.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Instruction Deleted',
              detail: 'The interview instruction was deleted successfully.',
            });
            this.loadInstructions();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the instruction. Please try again later.',
            });
          },
        });
      },
    });
  }
}
