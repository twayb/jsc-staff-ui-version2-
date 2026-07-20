import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { MultiSelect } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { RegionApiService } from '../../../core/masterdata/region-api.service';
import { InterviewVenueApiService } from '../../../core/recruitment/interview-venue-api.service';

interface RegionDistribution {
  regionId: number;
  region: string;
  applicants: number;
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
  private readonly advertApi = inject(AdvertApiService);
  private readonly regionApi = inject(RegionApiService);
  private readonly interviewVenueApi = inject(InterviewVenueApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly interviewTypeId = this.route.snapshot.paramMap.get('interviewTypeId') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems = signal<MenuItem[]>([
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    { label: 'Distribute by Region' },
  ]);

  readonly loading = signal(true);
  readonly regions = signal<RegionDistribution[]>([]);

  ngOnInit(): void {
    this.advertApi.getAdvert(Number(this.advertId)).subscribe({
      next: (response) => {
        const name = response.data?.advertName;
        if (name) {
          this.breadcrumbItems.update((items) => items.map((item, index) => (index === 2 ? { ...item, label: name } : item)));
        }
      },
      error: () => {},
    });

    this.loading.set(true);
    forkJoin({
      stats: this.interviewVenueApi.getShortlistedByRegion(Number(this.advertId), Number(this.interviewTypeId)),
      regions: this.regionApi.getRegions(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ stats, regions }) => {
          const namesById = new Map((regions.data ?? []).map((region) => [region.id, region.name]));
          this.regions.set(
            (stats.data ?? []).map((stat) => {
              const regionId = Number(stat.regionResidenceId);
              return {
                regionId,
                region: namesById.get(regionId) ?? stat.regionResidenceId,
                applicants: Number(stat.totalApplications),
              };
            }),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Regions',
            detail: 'Could not load the region distribution. Please try again later.',
          });
        },
      });
  }

  readonly venueOptions = signal<{ label: string; value: number }[]>([]);
  readonly loadingVenues = signal(false);
  readonly submittingVenue = signal(false);

  actionMenuItems: MenuItem[] = [];

  showVenueDialog = false;
  venueRegion: RegionDistribution | null = null;

  readonly venueForm = this.fb.nonNullable.group({
    venues: this.fb.nonNullable.control<number[]>([], Validators.required),
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
    this.venueForm.reset({ venues: [] });
    this.venueOptions.set([]);
    this.showVenueDialog = true;

    this.loadingVenues.set(true);
    this.interviewVenueApi
      .getVenuesByRegion(region.regionId)
      .pipe(finalize(() => this.loadingVenues.set(false)))
      .subscribe({
        next: (response) => {
          this.venueOptions.set(
            (response.data ?? []).map((venue) => ({
              label: `${venue.name} (capacity ${venue.venueCapacity})`,
              value: venue.id,
            })),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Venues',
            detail: 'Could not load venues for this region. Please try again later.',
          });
        },
      });
  }

  onSaveVenue(): void {
    if (this.venueForm.invalid || !this.venueRegion) {
      this.venueForm.markAllAsTouched();
      return;
    }

    const raw = this.venueForm.getRawValue();
    const target = this.venueRegion;

    this.submittingVenue.set(true);
    this.interviewVenueApi
      .setInterviewVenues({
        venueIds: raw.venues,
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
        regionId: String(target.regionId),
      })
      .pipe(finalize(() => this.submittingVenue.set(false)))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Venue Saved',
            detail: response.message,
          });
          this.showVenueDialog = false;
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

  onViewVenue(region: RegionDistribution): void {
    this.router.navigate(['/recruitment/interview-management', this.advertId, 'venue-by-region'], {
      queryParams: {
        region: region.region,
        regionId: region.regionId,
        interviewTypeId: this.interviewTypeId,
        title: this.interviewTitle,
      },
    });
  }
}
