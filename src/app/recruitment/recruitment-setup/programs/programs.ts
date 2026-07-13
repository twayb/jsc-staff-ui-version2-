import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface Program {
  name: string;
  category: string;
  level: string;
}

@Component({
  selector: 'app-programs',
  imports: [ReactiveFormsModule, Menu, Dialog, Select, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './programs.html',
  styleUrl: './programs.css',
})
export class Programs implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Programs' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  programs: Program[] = [
    { name: 'Bachelor of Laws', category: 'Law', level: "Bachelor's Degree" },
    { name: 'Bachelor of Computer Science', category: 'ICT', level: "Bachelor's Degree" },
    { name: 'Diploma in Accountancy', category: 'Business', level: 'Diploma' },
    { name: 'Certificate in Information Technology', category: 'ICT', level: 'Certificate' },
  ];

  readonly categoryOptions = [
    { label: 'Law', value: 'Law' },
    { label: 'Business', value: 'Business' },
    { label: 'ICT', value: 'ICT' },
    { label: 'Science', value: 'Science' },
    { label: 'Arts', value: 'Arts' },
    { label: 'Engineering', value: 'Engineering' },
  ];

  readonly levelOptions = [
    { label: 'Certificate', value: 'Certificate' },
    { label: 'Diploma', value: 'Diploma' },
    { label: "Bachelor's Degree", value: "Bachelor's Degree" },
    { label: "Master's Degree", value: "Master's Degree" },
    { label: 'PhD', value: 'PhD' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingProgram: Program | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    level: ['', Validators.required],
  });

  openActionMenu(event: Event, program: Program, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(program) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(program) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingProgram = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(program: Program): void {
    this.dialogMode = 'edit';
    this.editingProgram = program;
    this.form.reset({ name: program.name, category: program.category, level: program.level });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const program: Program = { name: raw.name, category: raw.category, level: raw.level };

    if (this.dialogMode === 'edit' && this.editingProgram) {
      const target = this.editingProgram;
      this.programs = this.programs.map((item) => (item === target ? program : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Program Updated',
        detail: `"${program.name}" was updated successfully.`,
      });
    } else {
      this.programs = [...this.programs, program];
      this.messageService.add({
        severity: 'success',
        summary: 'Program Added',
        detail: `"${program.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(program: Program): void {
    this.confirmationService.confirm({
      header: 'Delete Program',
      message: `Are you sure you want to delete "${program.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.programs = this.programs.filter((item) => item !== program);
        this.messageService.add({
          severity: 'success',
          summary: 'Program Deleted',
          detail: `"${program.name}" was deleted successfully.`,
        });
      },
    });
  }
}
