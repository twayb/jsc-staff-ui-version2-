import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface DistributionRow {
  name: string;
  applications: number;
  shortlist: number;
  unshortlisted: number;
  pending: number;
}

@Component({
  selector: 'app-longlist-distribution',
  imports: [Dialog, Button, Tooltip, AppDataTable],
  templateUrl: './longlist-distribution.html',
  styleUrl: './longlist-distribution.css',
})
export class LonglistDistribution implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  rows: DistributionRow[] = [
    { name: 'Jestina Kayuki', applications: 15, shortlist: 8, unshortlisted: 5, pending: 2 },
    { name: 'Fatuma Mwafujo', applications: 12, shortlist: 6, unshortlisted: 4, pending: 2 },
    { name: 'Rebbeca Mwakaje', applications: 10, shortlist: 5, unshortlisted: 3, pending: 2 },
  ];

  showViewDialog = false;
  viewingRow: DistributionRow | null = null;

  onDistribute(): void {
    this.confirmationService.confirm({
      header: 'Distribute Longlist',
      message: 'Are you sure you want to distribute the longlist to the interview panels?',
      icon: 'pi pi-sitemap',
      acceptButtonProps: { label: 'Distribute' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Longlist Distributed',
          detail: 'The longlist was distributed successfully.',
        });
      },
    });
  }

  onView(row: DistributionRow): void {
    this.viewingRow = row;
    this.showViewDialog = true;
  }
}
