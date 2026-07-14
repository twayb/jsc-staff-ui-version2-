import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { AuditDataService, CATEGORY_META, auditMethodSeverity } from '../audit-data.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AppSkeleton, CountUp, Tag],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly auditData = inject(AuditDataService);

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly stats: Stat[] = [
    {
      label: 'Total Users',
      value: 24,
      icon: 'pi-user',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/system-administration/users',
    },
    {
      label: 'Employees',
      value: 138,
      icon: 'pi-id-card',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/system-administration/employees',
    },
    {
      label: 'Roles',
      value: 6,
      icon: 'pi-shield',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: '/system-administration/roles',
    },
    {
      label: 'Audit Events Today',
      value: 17,
      icon: 'pi-history',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: '/system-administration/audit-trail/system-admin',
    },
  ];

  readonly categoryMeta = CATEGORY_META;
  readonly methodSeverity = auditMethodSeverity;

  readonly recentEvents = computed(() =>
    [...this.auditData.events()].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6),
  );
}
