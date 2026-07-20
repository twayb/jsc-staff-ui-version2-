import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { DistributedVenueRecord, InterviewVenueApiService } from '../../../core/recruitment/interview-venue-api.service';

interface VenueSession {
  venueId: number;
  venueName: string;
  capacity: number;
  candidates: number;
  date: string;
  time: string;
  sessions: number;
}

function mapVenueSession(record: DistributedVenueRecord): VenueSession {
  return {
    venueId: record.venueId,
    venueName: record.venueName,
    capacity: record.venueCapacity,
    candidates: record.numberOfApplications,
    date: record.interviewDate,
    time: record.interviewTime?.slice(0, 5) ?? '',
    sessions: record.numberOfSessions,
  };
}

@Component({
  selector: 'app-venue-by-region',
  imports: [Tooltip, AppBreadcrumb, AppDataTable],
  templateUrl: './venue-by-region.html',
  styleUrl: './venue-by-region.css',
})
export class VenueByRegion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);
  private readonly interviewVenueApi = inject(InterviewVenueApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly regionId = this.route.snapshot.queryParamMap.get('regionId') ?? '';
  readonly interviewTypeId = this.route.snapshot.queryParamMap.get('interviewTypeId') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems = signal<MenuItem[]>([
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    {
      label: 'Distribute by Region',
      routerLink: `/recruitment/interview-management/${this.advertId}/distribute-by-region/${this.interviewTypeId}`,
    },
    { label: this.region },
  ]);

  readonly loading = signal(true);
  readonly venues = signal<VenueSession[]>([]);

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
    this.interviewVenueApi
      .listApplicationInterviews({
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
        regionId: this.regionId,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.venues.set((response.data ?? []).map(mapVenueSession));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Venues',
            detail: 'Could not load the distributed venues for this region. Please try again later.',
          });
        },
      });
  }

  onViewCandidates(venue: VenueSession): void {
    this.router.navigate(['/recruitment/interview-management', this.advertId, 'candidate-by-venue'], {
      queryParams: {
        region: this.region,
        venue: venue.venueName,
        venueId: venue.venueId,
        interviewTypeId: this.interviewTypeId,
      },
    });
  }
}
