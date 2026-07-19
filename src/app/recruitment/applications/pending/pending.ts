import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface PendingApplicant {
  name: string;
  nin: string;
  applicationDate: string;
}

@Component({
  selector: 'app-pending',
  imports: [Tag, Tooltip, AppDataTable],
  templateUrl: './pending.html',
  styleUrl: './pending.css',
})
export class Pending implements OnInit {
  private readonly router = inject(Router);

  @Input() advertId = '';
  @Input() origin: 'longlist' | 'assigned' = 'assigned';

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicants: PendingApplicant[] = [
    { name: 'Amina Hassan', nin: '19990531111020000125', applicationDate: '2026-01-15' },
    { name: 'Peter Mushi', nin: '19921045678900000456', applicationDate: '2026-01-20' },
    { name: 'Fatma Salim', nin: '19870056789010000567', applicationDate: '2026-01-22' },
  ];

  onView(applicant: PendingApplicant): void {
    this.router.navigate(['/recruitment/applications', this.origin, this.advertId, 'applicant', applicant.nin]);
  }
}
