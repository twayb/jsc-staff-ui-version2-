import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSkeleton } from '../shared/app-skeleton/app-skeleton';
import { cando } from '../core/utils';

interface Service {
  title: string;
  description: string;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
  permission?: string;
}

type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

const GREETINGS: Record<GreetingPeriod, { title: string; subtitle: string; icon: string }> = {
  morning: {
    title: 'Good Morning',
    subtitle: 'Welcome back. We wish you a productive day.',
    icon: 'pi-sun',
  },
  afternoon: {
    title: 'Good Afternoon',
    subtitle: 'Welcome back. We hope your day is progressing well.',
    icon: 'pi-sun',
  },
  evening: {
    title: 'Good Evening',
    subtitle: 'Welcome back. We hope you had a successful day.',
    icon: 'pi-moon',
  },
};

@Component({
  selector: 'app-service-section',
  imports: [RouterLink, NgClass, DatePipe, AppSkeleton],
  templateUrl: './service-section.html',
  styleUrl: './service-section.css',
})
export class ServiceSection implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);

  // TODO: replace with the authenticated user's name once auth/session state is wired up.
  private readonly userName = 'Admin User';
  readonly firstName = this.userName.split(' ')[0];

  readonly now = signal(new Date());

  readonly period = computed<GreetingPeriod>(() => {
    const hour = this.now().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  });

  readonly greeting = computed(() => GREETINGS[this.period()]);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);

    const handle = setInterval(() => this.now.set(new Date()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(handle));
  }

  readonly services: Service[] = [
    {
      title: 'Recruitment',
      description: 'Manage adverts, longlist & shortlist.',
      icon: 'pi-user-plus',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/recruitment',
      permission: 'GET_ASSIGNED_APPLICATIONS_BY_ADVERT',
    },
    {
      title: 'Complaints',
      description: 'Register and Handle complaints',
      icon: 'pi-flag',
      bgClass: 'bg-danger-bg',
      fgClass: 'text-danger',
      route: null,
      permission: 'GET_FILTERED_COMPLAINTS',
    },
    {
      title: 'System Administration',
      description: 'Manage users, roles, permissions, and system settings.',
      icon: 'pi-cog',
      bgClass: 'bg-secondary-bg',
      fgClass: 'text-secondary',
      route: '/system-administration',
      permission: 'GET_AUDIT_LOGS_SYSADMIN',
    },
    {
      title: 'Question Bank',
      description: 'Add questions and set interviews.',
      icon: 'pi-book',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/question-bank',
      permission: 'ADD_PERMIT',
    },
    {
      title: 'Online Interview',
      description: 'Conduct and manage online aptitude tests.',
      icon: 'pi-desktop',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/online-interview',
      permission: 'ADD_PERMIT',
    },
    {
      title: 'Report',
      description: 'Generate and export reports',
      icon: 'pi-chart-bar',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: null,
      permission: 'GET_DATA_BANK_APPLICATIONS',
    },
    {
      title: 'HR Management',
      description: 'Oversee staff records and performance management.',
      icon: 'pi-users',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: null,
      permission: 'GET_ASSIGNED_APPLICATIONS_BY_ADVERT',
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

  canAccess(service: Service): boolean {
    return !!service.route && (!service.permission || cando(service.permission));
  }
}
