import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import {
  InterviewVenueApiService,
  InterviewVenueInput,
  InterviewVenueRecord,
} from '../../../core/recruitment/interview-venue-api.service';
import { RegionApiService } from '../../../core/masterdata/region-api.service';
import { DistrictApiService, DistrictRecord } from '../../../core/masterdata/district-api.service';

type VenueStatus = 'Active' | 'Not Active';
type VenueStatusSeverity = 'success' | 'danger';

interface InterviewVenue {
  id: number;
  name: string;
  regionIds: number[];
  districtId: number;
  regionNames: string;
  district: string;
  capacity: number;
  status: VenueStatus;
}

@Component({
  selector: 'app-interview-venues',
  imports: [
    ReactiveFormsModule,
    Menu,
    Tag,
    Dialog,
    Select,
    MultiSelect,
    InputText,
    InputNumber,
    ToggleSwitch,
    Button,
    AppBreadcrumb,
    AppDataTable,
  ],
  templateUrl: './interview-venues.html',
  styleUrl: './interview-venues.css',
})
export class InterviewVenues implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly interviewVenueApi = inject(InterviewVenueApiService);
  private readonly regionApi = inject(RegionApiService);
  private readonly districtApi = inject(DistrictApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Interview Venues' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly venues = signal<InterviewVenue[]>([]);
  readonly regionOptions = signal<{ label: string; value: number }[]>([]);
  readonly districtOptions = signal<{ label: string; value: number }[]>([]);

  private allDistricts: DistrictRecord[] = [];
  private regionNamesById = new Map<number, string>();
  private districtNamesById = new Map<number, string>();

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      venues: this.interviewVenueApi.getInterviewVenues(),
      regions: this.regionApi.getRegions(),
      districts: this.districtApi.getDistricts(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ venues, regions, districts }) => {
          const regionList = regions.data ?? [];
          this.allDistricts = districts.data ?? [];
          this.regionOptions.set(regionList.map((region) => ({ label: region.name, value: region.id })));
          this.regionNamesById = new Map(regionList.map((region) => [region.id, region.name]));
          this.districtNamesById = new Map(this.allDistricts.map((district) => [district.id, district.name]));

          this.venues.set((venues.data ?? []).map((record) => this.toRow(record)));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interview Venues',
            detail: 'Could not load the interview venues. Please try again later.',
          });
        },
      });
  }

  private toRow(record: InterviewVenueRecord): InterviewVenue {
    const regionIds = (record.setInterviewRegionVenues ?? []).map((link) => link.regionId);
    return {
      id: record.id,
      name: record.name,
      regionIds,
      districtId: record.districtId,
      regionNames: regionIds
        .map((regionId) => this.regionNamesById.get(regionId) ?? '')
        .filter(Boolean)
        .join(', '),
      district: this.districtNamesById.get(record.districtId) ?? '',
      capacity: record.venueCapacity,
      status: record.active ? 'Active' : 'Not Active',
    };
  }

  private loadVenues(): void {
    this.loading.set(true);
    this.interviewVenueApi
      .getInterviewVenues()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.venues.set((response.data ?? []).map((record) => this.toRow(record)));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interview Venues',
            detail: 'Could not load the interview venues. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingVenue: InterviewVenue | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    regionIds: this.fb.nonNullable.control<number[]>([], Validators.required),
    districtId: this.fb.control<number | null>(null, Validators.required),
    capacity: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    active: this.fb.nonNullable.control<boolean>(true, Validators.required),
  });

  private setDistrictOptions(regionIds: number[]): void {
    this.districtOptions.set(
      this.allDistricts
        .filter((district) => regionIds.includes(district.regionId))
        .map((district) => ({ label: district.name, value: district.id })),
    );
  }

  onRegionChange(regionIds: number[]): void {
    this.setDistrictOptions(regionIds ?? []);
    this.form.controls.districtId.reset(null);
  }

  statusSeverity(status: VenueStatus): VenueStatusSeverity {
    return status === 'Active' ? 'success' : 'danger';
  }

  openActionMenu(event: Event, venue: InterviewVenue, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(venue) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(venue) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingVenue = null;
    this.districtOptions.set([]);
    this.form.reset({ active: true, regionIds: [] });
    this.showFormDialog = true;
  }

  onEdit(venue: InterviewVenue): void {
    this.dialogMode = 'edit';
    this.editingVenue = venue;
    this.setDistrictOptions(venue.regionIds);
    this.form.reset({
      name: venue.name,
      regionIds: venue.regionIds,
      districtId: venue.districtId,
      capacity: venue.capacity,
      active: venue.status === 'Active',
    });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const input: InterviewVenueInput = {
      name: raw.name,
      regionIds: raw.regionIds,
      districtId: raw.districtId!,
      venueCapacity: raw.capacity!,
      active: raw.active,
    };

    const request =
      this.dialogMode === 'edit' && this.editingVenue
        ? this.interviewVenueApi.updateInterviewVenue(this.editingVenue.id, input)
        : this.interviewVenueApi.createInterviewVenue(input);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Venue Updated' : 'Venue Added',
          detail: response.message,
        });
        this.showFormDialog = false;
        this.loadVenues();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the venue. Please try again later.',
        });
      },
    });
  }

  onDelete(venue: InterviewVenue): void {
    this.confirmationService.confirm({
      header: 'Delete Venue',
      message: `Are you sure you want to delete "${venue.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviewVenueApi.deleteInterviewVenue(venue.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Venue Deleted',
              detail: `"${venue.name}" was deleted successfully.`,
            });
            this.loadVenues();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the venue. Please try again later.',
            });
          },
        });
      },
    });
  }
}
