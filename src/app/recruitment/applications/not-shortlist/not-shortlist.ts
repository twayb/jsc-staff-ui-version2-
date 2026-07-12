import { Component, OnInit, signal } from '@angular/core';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

interface NotShortlistedApplicant {
  name: string;
  nin: string;
  applicationDate: string;
  remark: string;
}

@Component({
  selector: 'app-not-shortlist',
  imports: [Tag, Dialog, Button, Tooltip, AppDataTable],
  templateUrl: './not-shortlist.html',
  styleUrl: './not-shortlist.css',
})
export class NotShortlist implements OnInit {
  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicants: NotShortlistedApplicant[] = [
    {
      name: 'Grace Kileo',
      nin: '19881034567890000345',
      applicationDate: '2026-01-18',
      remark: 'Does not meet minimum qualification requirements',
    },
    {
      name: 'Peter Mushi',
      nin: '19921045678900000456',
      applicationDate: '2026-01-20',
      remark: 'Incomplete application documents',
    },
  ];

  showViewDialog = false;
  viewingApplicant: NotShortlistedApplicant | null = null;

  onView(applicant: NotShortlistedApplicant): void {
    this.viewingApplicant = applicant;
    this.showViewDialog = true;
  }
}
