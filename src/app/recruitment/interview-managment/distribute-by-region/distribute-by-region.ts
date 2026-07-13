import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { MultiSelect } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface RegionDistribution {
  region: string;
  applicants: number;
  venues: string[];
}

@Component({
  selector: 'app-distribute-by-region',
  imports: [ReactiveFormsModule, Menu, Dialog, MultiSelect, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './distribute-by-region.html',
  styleUrl: './distribute-by-region.css',
})
export class DistributeByRegion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly permitNo = this.route.snapshot.paramMap.get('permitNo') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.permitNo, routerLink: `/recruitment/interview-management/${this.permitNo}` },
    { label: 'Distribute by Region' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  regions: RegionDistribution[] = [
    { region: 'Dar es Salaam', applicants: 18, venues: ['JSC Boardroom A'] },
    { region: 'Arusha', applicants: 9, venues: [] },
    { region: 'Mwanza', applicants: 7, venues: [] },
    { region: 'Dodoma', applicants: 5, venues: ['Dodoma Regional Hall'] },
    { region: 'Mbeya', applicants: 3, venues: [] },
  ];

  readonly venueOptions = [
    { label: 'University of Dar es Salaam', value: 'University of Dar es Salaam' },
    { label: 'Dar es Salaam Institute of Technology', value: 'Dar es Salaam Institute of Technology' },
    { label: 'JSC Boardroom A', value: 'JSC Boardroom A' },
    { label: 'Arusha International Conference Centre', value: 'Arusha International Conference Centre' },
    { label: 'Mwanza Regional Hall', value: 'Mwanza Regional Hall' },
    { label: 'Dodoma Regional Hall', value: 'Dodoma Regional Hall' },
    { label: 'Mbeya Hall', value: 'Mbeya Hall' },
    { label: 'Institute of Judicial Administration, Lushoto', value: 'Institute of Judicial Administration, Lushoto' },
  ];

  actionMenuItems: MenuItem[] = [];

  showVenueDialog = false;
  venueRegion: RegionDistribution | null = null;

  readonly venueForm = this.fb.nonNullable.group({
    venues: this.fb.nonNullable.control<string[]>([], Validators.required),
  });

  openActionMenu(event: Event, region: RegionDistribution, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Set Venue', icon: 'pi pi-map-marker', command: () => this.onSetVenue(region) },
      { label: 'View Venue', icon: 'pi pi-eye', command: () => this.onViewVenue(region) },
    ];
    menu.toggle(event);
  }

  onSetVenue(region: RegionDistribution): void {
    this.venueRegion = region;
    this.venueForm.reset({ venues: region.venues });
    this.showVenueDialog = true;
  }

  onSaveVenue(): void {
    if (this.venueForm.invalid || !this.venueRegion) {
      this.venueForm.markAllAsTouched();
      return;
    }

    const raw = this.venueForm.getRawValue();
    const target = this.venueRegion;
    this.regions = this.regions.map((region) => (region === target ? { ...region, venues: raw.venues } : region));

    this.messageService.add({
      severity: 'success',
      summary: 'Venue Saved',
      detail: `Venue(s) for "${target.region}" was saved successfully.`,
    });
    this.showVenueDialog = false;
  }

  onViewVenue(region: RegionDistribution): void {
    this.router.navigate(['/recruitment/interview-management', this.permitNo, 'venue-by-region'], {
      queryParams: { region: region.region, title: this.interviewTitle },
    });
  }
}
