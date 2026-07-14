import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSkeleton } from '../shared/app-skeleton/app-skeleton';

interface Service {
  title: string;
  description: string;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

@Component({
  selector: 'app-service-section',
  imports: [RouterLink, NgClass, AppSkeleton],
  templateUrl: './service-section.html',
  styleUrl: './service-section.css',
})
export class ServiceSection implements OnInit {
  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly services: Service[] = [
    {
      title: 'Recruitment',
      description: 'Manage adverts, longlist & shortlist.',
      icon: 'pi-user-plus',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/recruitment',
    },
    {
      title: 'Complaints',
      description: 'Register and Handle complaints',
      icon: 'pi-flag',
      bgClass: 'bg-danger-bg',
      fgClass: 'text-danger',
      route: null,
    },
    {
      title: 'System Administration',
      description: 'Manage users, roles, permissions, and system settings.',
      icon: 'pi-cog',
      bgClass: 'bg-secondary-bg',
      fgClass: 'text-secondary',
      route: '/system-administration',
    },
    {
      title: 'Question Bank',
      description: 'Add questions and set interviews.',
      icon: 'pi-book',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: null,
    },
    {
      title: 'Online Interview',
      description: 'Conduct and manage online aptitude tests.',
      icon: 'pi-desktop',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: null,
    },
    {
      title: 'Report',
      description: 'Generate and export reports',
      icon: 'pi-chart-bar',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: null,
    },
    {
      title: 'HR Management',
      description: 'Oversee staff records and performance management.',
      icon: 'pi-users',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: null,
    },
    {
      title: 'Asset Management',
      description: 'Track and manage office assets and equipment.',
      icon: 'pi-box',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: null,
    },
  ];
}
