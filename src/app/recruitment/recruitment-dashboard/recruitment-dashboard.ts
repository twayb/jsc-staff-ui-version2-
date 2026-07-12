import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';

interface Stat {
  label: string;
  value: string;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

@Component({
  selector: 'app-recruitment-dashboard',
  imports: [RouterLink, NgClass, AppSkeleton],
  templateUrl: './recruitment-dashboard.html',
  styleUrl: './recruitment-dashboard.css',
})
export class RecruitmentDashboard implements OnInit {
  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly stats: Stat[] = [
    {
      label: 'Applications ',
      value: '0',
      icon: 'pi-inbox',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/recruitment/applications',
    },
    {
      label: 'Available Vacancies',
      value: '0',
      icon: 'pi-briefcase',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/recruitment/adverts',
    },
    {
      label: 'New Permits',
      value: '0',
      icon: 'pi-id-card',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: '/recruitment/permits',
    },
    {
      label: 'Databank',
      value: '0',
      icon: 'pi-database',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: null,
    },
  ];
}
