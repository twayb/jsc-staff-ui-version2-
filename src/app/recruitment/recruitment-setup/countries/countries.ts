import { Component, OnInit, inject, signal } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { CountryApiService, CountryRecord } from '../../../core/masterdata/country-api.service';

interface Country {
  id: number;
  name: string;
  iso: string;
  phoneCode: string;
}

function mapCountry(record: CountryRecord): Country {
  return {
    id: record.id,
    name: record.nicename,
    iso: record.iso,
    phoneCode: record.phonecode,
  };
}

@Component({
  selector: 'app-countries',
  imports: [Button, AppBreadcrumb, AppDataTable],
  templateUrl: './countries.html',
  styleUrl: './countries.css',
})
export class Countries implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly countryApi = inject(CountryApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Countries' },
  ];

  readonly loading = signal(true);
  readonly syncing = signal(false);
  readonly countries = signal<Country[]>([]);

  ngOnInit(): void {
    this.loadCountries();
  }

  private loadCountries(): void {
    this.loading.set(true);
    this.countryApi
      .getCountries()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.countries.set((response.data ?? []).map(mapCountry));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Countries',
            detail: 'Could not load the countries list. Please try again later.',
          });
        },
      });
  }

  onSync(): void {
    this.syncing.set(true);
    this.countryApi
      .syncCountries()
      .pipe(finalize(() => this.syncing.set(false)))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Countries Synced',
            detail: response.message,
          });
          this.loadCountries();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Sync Failed',
            detail: 'Could not sync the country list. Please try again later.',
          });
        },
      });
  }
}
