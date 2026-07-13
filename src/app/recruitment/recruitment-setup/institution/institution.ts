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

interface InstitutionRecord {
  name: string;
  type: string;
  country: string;
}

@Component({
  selector: 'app-institution',
  imports: [ReactiveFormsModule, Menu, Dialog, Select, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './institution.html',
  styleUrl: './institution.css',
})
export class Institution implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Institutions' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  institutions: InstitutionRecord[] = [
    { name: 'University of Dar es Salaam', type: 'University', country: 'Tanzania' },
    { name: 'Dar es Salaam Institute of Technology', type: 'Institute', country: 'Tanzania' },
    { name: 'University of Nairobi', type: 'University', country: 'Kenya' },
    { name: 'Makerere University', type: 'University', country: 'Uganda' },
  ];

  readonly typeOptions = [
    { label: 'University', value: 'University' },
    { label: 'College', value: 'College' },
    { label: 'Institute', value: 'Institute' },
    { label: 'Polytechnic', value: 'Polytechnic' },
  ];

  readonly countryOptions = [
    { label: 'Tanzania', value: 'Tanzania' },
    { label: 'Kenya', value: 'Kenya' },
    { label: 'Uganda', value: 'Uganda' },
    { label: 'Rwanda', value: 'Rwanda' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingInstitution: InstitutionRecord | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    country: ['', Validators.required],
  });

  openActionMenu(event: Event, institution: InstitutionRecord, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(institution) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(institution) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingInstitution = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(institution: InstitutionRecord): void {
    this.dialogMode = 'edit';
    this.editingInstitution = institution;
    this.form.reset({ name: institution.name, type: institution.type, country: institution.country });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const institution: InstitutionRecord = { name: raw.name, type: raw.type, country: raw.country };

    if (this.dialogMode === 'edit' && this.editingInstitution) {
      const target = this.editingInstitution;
      this.institutions = this.institutions.map((item) => (item === target ? institution : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Institution Updated',
        detail: `"${institution.name}" was updated successfully.`,
      });
    } else {
      this.institutions = [...this.institutions, institution];
      this.messageService.add({
        severity: 'success',
        summary: 'Institution Added',
        detail: `"${institution.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(institution: InstitutionRecord): void {
    this.confirmationService.confirm({
      header: 'Delete Institution',
      message: `Are you sure you want to delete "${institution.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.institutions = this.institutions.filter((item) => item !== institution);
        this.messageService.add({
          severity: 'success',
          summary: 'Institution Deleted',
          detail: `"${institution.name}" was deleted successfully.`,
        });
      },
    });
  }
}
