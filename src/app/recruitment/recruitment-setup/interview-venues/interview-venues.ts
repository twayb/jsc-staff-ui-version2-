import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type VenueStatus = 'Active' | 'Not Active';
type VenueStatusSeverity = 'success' | 'danger';

interface InterviewVenue {
  name: string;
  region: string;
  district: string;
  capacity: number;
  status: VenueStatus;
}

const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Dar es Salaam': ['Ilala', 'Temeke', 'Ubungo', 'Kinondoni', 'Kigamboni'],
  Arusha: ['Arusha City', 'Meru', 'Arumeru'],
  Mwanza: ['Nyamagana', 'Ilemela', 'Sengerema'],
  Dodoma: ['Dodoma City', 'Bahi', 'Chamwino'],
  Mbeya: ['Mbeya City', 'Rungwe', 'Mbarali'],
};

@Component({
  selector: 'app-interview-venues',
  imports: [
    ReactiveFormsModule,
    Menu,
    Tag,
    Dialog,
    Select,
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

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Setup' },
    { label: 'Interview Venues' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  venues: InterviewVenue[] = [
    { name: 'JSC Boardroom A', region: 'Dar es Salaam', district: 'Ilala', capacity: 50, status: 'Active' },
    {
      name: 'Arusha International Conference Centre',
      region: 'Arusha',
      district: 'Arusha City',
      capacity: 120,
      status: 'Active',
    },
    { name: 'Mwanza Regional Hall', region: 'Mwanza', district: 'Nyamagana', capacity: 80, status: 'Not Active' },
  ];

  readonly regionOptions = Object.keys(DISTRICTS_BY_REGION).map((region) => ({ label: region, value: region }));

  districtOptions: { label: string; value: string }[] = [];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingVenue: InterviewVenue | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    region: ['', Validators.required],
    district: ['', Validators.required],
    capacity: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    status: this.fb.nonNullable.control<VenueStatus>('Active', Validators.required),
  });

  private getDistrictOptions(region: string): { label: string; value: string }[] {
    return (DISTRICTS_BY_REGION[region] ?? []).map((district) => ({ label: district, value: district }));
  }

  onRegionChange(region: string): void {
    this.districtOptions = this.getDistrictOptions(region);
    this.form.controls.district.reset('');
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
    this.districtOptions = [];
    this.form.reset({ status: 'Active' });
    this.showFormDialog = true;
  }

  onEdit(venue: InterviewVenue): void {
    this.dialogMode = 'edit';
    this.editingVenue = venue;
    this.districtOptions = this.getDistrictOptions(venue.region);
    this.form.reset({
      name: venue.name,
      region: venue.region,
      district: venue.district,
      capacity: venue.capacity,
      status: venue.status,
    });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const venue: InterviewVenue = {
      name: raw.name,
      region: raw.region,
      district: raw.district,
      capacity: raw.capacity!,
      status: raw.status,
    };

    if (this.dialogMode === 'edit' && this.editingVenue) {
      const target = this.editingVenue;
      this.venues = this.venues.map((item) => (item === target ? venue : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Venue Updated',
        detail: `"${venue.name}" was updated successfully.`,
      });
    } else {
      this.venues = [...this.venues, venue];
      this.messageService.add({
        severity: 'success',
        summary: 'Venue Added',
        detail: `"${venue.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onDelete(venue: InterviewVenue): void {
    this.confirmationService.confirm({
      header: 'Delete Venue',
      message: `Are you sure you want to delete "${venue.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.venues = this.venues.filter((item) => item !== venue);
        this.messageService.add({
          severity: 'success',
          summary: 'Venue Deleted',
          detail: `"${venue.name}" was deleted successfully.`,
        });
      },
    });
  }
}
