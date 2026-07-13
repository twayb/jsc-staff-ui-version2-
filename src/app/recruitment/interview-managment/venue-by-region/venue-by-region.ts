import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface VenueSession {
  venueName: string;
  capacity: number;
  candidates: number;
  date: string;
  time: string;
  sessions: number;
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

  readonly permitNo = this.route.snapshot.paramMap.get('permitNo') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.permitNo, routerLink: `/recruitment/interview-management/${this.permitNo}` },
    {
      label: 'Distribute by Region',
      routerLink: `/recruitment/interview-management/${this.permitNo}/distribute-by-region`,
    },
    { label: this.region },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  venues: VenueSession[] = [
    {
      venueName: 'University of Dar es Salaam',
      capacity: 120,
      candidates: 95,
      date: '2026-08-10',
      time: '09:00',
      sessions: 2,
    },
    {
      venueName: 'Dar es Salaam Institute of Technology',
      capacity: 60,
      candidates: 45,
      date: '2026-08-11',
      time: '09:00',
      sessions: 1,
    },
  ];

  onViewCandidates(venue: VenueSession): void {
    this.router.navigate(['/recruitment/interview-management', this.permitNo, 'candidate-by-venue'], {
      queryParams: { region: this.region, venue: venue.venueName },
    });
  }
}
