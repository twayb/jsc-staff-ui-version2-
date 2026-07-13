import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface Country {
  name: string;
  iso: string;
  phoneCode: string;
}

@Component({
  selector: 'app-countries',
  imports: [ReactiveFormsModule, Menu, Dialog, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './countries.html',
  styleUrl: './countries.css',
})
export class Countries implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Countries' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  countries: Country[] = [
    { name: 'Tanzania', iso: 'TZ', phoneCode: '+255' },
    { name: 'Kenya', iso: 'KE', phoneCode: '+254' },
    { name: 'Uganda', iso: 'UG', phoneCode: '+256' },
    { name: 'Rwanda', iso: 'RW', phoneCode: '+250' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingCountry: Country | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    iso: ['', Validators.required],
    phoneCode: ['', Validators.required],
  });

  openActionMenu(event: Event, country: Country, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(country) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(country) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingCountry = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(country: Country): void {
    this.dialogMode = 'edit';
    this.editingCountry = country;
    this.form.reset({ name: country.name, iso: country.iso, phoneCode: country.phoneCode });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const country: Country = { name: raw.name, iso: raw.iso, phoneCode: raw.phoneCode };

    if (this.dialogMode === 'edit' && this.editingCountry) {
      const target = this.editingCountry;
      this.countries = this.countries.map((item) => (item === target ? country : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Country Updated',
        detail: `"${country.name}" was updated successfully.`,
      });
    } else {
      this.countries = [...this.countries, country];
      this.messageService.add({
        severity: 'success',
        summary: 'Country Added',
        detail: `"${country.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(country: Country): void {
    this.confirmationService.confirm({
      header: 'Delete Country',
      message: `Are you sure you want to delete "${country.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.countries = this.countries.filter((item) => item !== country);
        this.messageService.add({
          severity: 'success',
          summary: 'Country Deleted',
          detail: `"${country.name}" was deleted successfully.`,
        });
      },
    });
  }

  onSync(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Countries Synced',
      detail: 'The country list has been synced successfully.',
    });
  }
}
