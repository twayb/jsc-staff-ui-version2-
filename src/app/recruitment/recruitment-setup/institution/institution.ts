import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import {
  InstitutionApiService,
  InstitutionInput,
  InstitutionRecord,
  InstitutionType,
} from '../../../core/masterdata/institution-api.service';
import { CountryApiService } from '../../../core/masterdata/country-api.service';
import { titleCase } from '../../../core/utils';

interface InstitutionRow {
  id: number;
  name: string;
  type: InstitutionType;
  countryId: number;
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
  private readonly institutionApi = inject(InstitutionApiService);
  private readonly countryApi = inject(CountryApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Institutions' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly institutions = signal<InstitutionRow[]>([]);
  readonly countryOptions = signal<{ label: string; value: number }[]>([]);

  private countryNamesById = new Map<number, string>();

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      institutions: this.institutionApi.getInstitutions(),
      countries: this.countryApi.getCountries(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ institutions, countries }) => {
          const countryList = countries.data ?? [];
          this.countryOptions.set(countryList.map((country) => ({ label: country.nicename, value: country.id })));
          this.countryNamesById = new Map(countryList.map((country) => [country.id, country.nicename]));
          this.institutions.set((institutions.data ?? []).map((record) => this.toRow(record)));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Institutions',
            detail: 'Could not load the institutions. Please try again later.',
          });
        },
      });
  }

  private toRow(record: InstitutionRecord): InstitutionRow {
    return {
      id: record.id,
      name: record.name,
      type: record.type,
      countryId: record.countryId,
      country: this.countryNamesById.get(record.countryId) ?? '',
    };
  }

  private loadInstitutions(): void {
    this.loading.set(true);
    this.institutionApi
      .getInstitutions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.institutions.set((response.data ?? []).map((record) => this.toRow(record)));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Institutions',
            detail: 'Could not load the institutions. Please try again later.',
          });
        },
      });
  }

  readonly typeOptions: { label: string; value: InstitutionType }[] = [
    { label: 'Academic', value: 'ACADEMIC' },
    { label: 'Professional', value: 'PROFESSIONAL' },
  ];

  typeLabel(type: string): string {
    return titleCase(type.toLowerCase());
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingInstitution: InstitutionRow | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: this.fb.control<InstitutionType | null>(null, Validators.required),
    countryId: this.fb.control<number | null>(null, Validators.required),
  });

  openActionMenu(event: Event, institution: InstitutionRow, menu: Menu): void {
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

  onEdit(institution: InstitutionRow): void {
    this.dialogMode = 'edit';
    this.editingInstitution = institution;
    this.form.reset({ name: institution.name, type: institution.type, countryId: institution.countryId });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const input: InstitutionInput = {
      name: raw.name,
      type: raw.type!,
      countryId: raw.countryId!,
    };

    const request =
      this.dialogMode === 'edit' && this.editingInstitution
        ? this.institutionApi.updateInstitution(this.editingInstitution.id, input)
        : this.institutionApi.createInstitution(input);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Institution Updated' : 'Institution Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadInstitutions();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the institution. Please try again later.',
        });
      },
    });
  }

  onDelete(institution: InstitutionRow): void {
    this.confirmationService.confirm({
      header: 'Delete Institution',
      message: `Are you sure you want to delete "${institution.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.institutionApi.deleteInstitution(institution.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Institution Deleted',
              detail: `"${institution.name}" was deleted successfully.`,
            });
            this.institutions.update((list) => list.filter((item) => item !== institution));
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the institution. Please try again later.',
            });
          },
        });
      },
    });
  }
}
