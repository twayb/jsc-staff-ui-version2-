import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { InterviewSet, InterviewTypeSeverity, OnlineInterviewDataService } from '../online-interview-data.service';

@Component({
  selector: 'app-interview-list',
  imports: [AppBreadcrumb, AppDataTable, Tag],
  templateUrl: './interview-list.html',
  styleUrl: './interview-list.css',
})
export class InterviewList implements OnInit {
  private readonly router = inject(Router);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview List' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  get interviews(): InterviewSet[] {
    return this.interviewData.interviewSets;
  }

  interviewTypeSeverity(interviewType: string): InterviewTypeSeverity {
    return this.interviewData.interviewTypeSeverity(interviewType);
  }

  onAdd(): void {
    this.router.navigate(['/online-interview/set-interview']);
  }

  onView(interview: InterviewSet): void {
    this.router.navigate(['/online-interview/interview-list', interview.id]);
  }
}
