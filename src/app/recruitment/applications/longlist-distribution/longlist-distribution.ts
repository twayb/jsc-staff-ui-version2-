import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { MultiSelect } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { finalize, forkJoin } from 'rxjs';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { UserManagementService } from '../../../core/auth/user-management.service';

interface DistributionRow {
  userId: string;
  name: string;
  applications: number;
  shortlist: number;
  unshortlisted: number;
  pending: number;
}

interface StaffOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-longlist-distribution',
  imports: [ReactiveFormsModule, Tooltip, Dialog, MultiSelect, Button, AppDataTable],
  templateUrl: './longlist-distribution.html',
  styleUrl: './longlist-distribution.css',
})
export class LonglistDistribution implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly longlistApi = inject(LonglistApiService);
  private readonly userManagementApi = inject(UserManagementService);

  @Input() advertId = '';

  readonly loading = signal(true);
  readonly distributing = signal(false);

  readonly rows = signal<DistributionRow[]>([]);
  readonly staffOptions = signal<StaffOption[]>([]);

  readonly showDistributeDialog = signal(false);

  readonly distributeForm = this.fb.nonNullable.group({
    userIds: this.fb.nonNullable.control<string[]>([], Validators.required),
  });

  ngOnInit(): void {
    this.loadDistribution();
  }

  private loadDistribution(): void {
    this.loading.set(true);
    forkJoin({
      stats: this.longlistApi.getDistributionStats(Number(this.advertId)),
      staff: this.userManagementApi.getStaffUsersByType('STAFF'),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ stats, staff }) => {
          const staffList = staff.data ?? [];
          const namesById = new Map(staffList.map((user) => [user.id, user.name]));
          this.rows.set(
            (stats.data?.content ?? []).map((stat) => ({
              userId: stat.userId,
              name: namesById.get(stat.userId) ?? stat.userId,
              applications: stat.applications,
              shortlist: stat.shortlisted,
              unshortlisted: stat.notShortlisted,
              pending: stat.pending,
            })),
          );
          this.staffOptions.set(staffList.map((user) => ({ label: user.name, value: user.id })));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Distribution',
            detail: 'Could not load the longlist distribution. Please try again later.',
          });
        },
      });
  }

  onDistribute(): void {
    this.distributeForm.reset({ userIds: [] });
    this.showDistributeDialog.set(true);
  }

  onSubmitDistribute(): void {
    if (this.distributeForm.invalid) {
      this.distributeForm.markAllAsTouched();
      return;
    }

    const { userIds } = this.distributeForm.getRawValue();
    this.distributing.set(true);
    this.longlistApi
      .distributeLonglist(Number(this.advertId), userIds)
      .pipe(finalize(() => this.distributing.set(false)))
      .subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Longlist Distributed',
            detail: res.message,
          });
          this.showDistributeDialog.set(false);
          this.loadDistribution();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Distribution Failed',
            detail: 'Could not distribute the longlist. Please try again later.',
          });
        },
      });
  }

  onView(row: DistributionRow): void {
    this.router.navigate(['/recruitment/applications/longlist', this.advertId, 'attended-unattended', row.userId]);
  }
}
