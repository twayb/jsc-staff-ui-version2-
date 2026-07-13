import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type InterviewTitle = 'Written Interview' | 'Oral Interview' | 'Practical Interview';
type InterviewStatus = 'Published' | 'Unpublished';
type InterviewStatusSeverity = 'success' | 'warn';

interface CadreInterview {
  title: InterviewTitle;
  weight: number;
  date: string;
  time: string;
  status: InterviewStatus;
  cutOff: number | null;
}

@Component({
  selector: 'app-interview-list',
  imports: [
    ReactiveFormsModule,
    Menu,
    Tag,
    Dialog,
    Select,
    DatePicker,
    InputNumber,
    Button,
    AppBreadcrumb,
    AppDataTable,
  ],
  templateUrl: './interview-list.html',
  styleUrl: './interview-list.css',
})
export class InterviewList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly permitNo = this.route.snapshot.paramMap.get('permitNo') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.permitNo },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  interviews: CadreInterview[] = [
    {
      title: 'Written Interview',
      weight: 40,
      date: '2026-08-10',
      time: '09:00',
      status: 'Published',
      cutOff: 50,
    },
    {
      title: 'Oral Interview',
      weight: 60,
      date: '2026-08-17',
      time: '10:30',
      status: 'Unpublished',
      cutOff: null,
    },
  ];

  readonly titleOptions = [
    { label: 'Written Interview', value: 'Written Interview' },
    { label: 'Oral Interview', value: 'Oral Interview' },
    { label: 'Practical Interview', value: 'Practical Interview' },
  ];

  actionMenuItems: MenuItem[] = [];

  showAddDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingInterview: CadreInterview | null = null;

  readonly form = this.fb.nonNullable.group({
    title: this.fb.control<InterviewTitle | null>(null, Validators.required),
    date: this.fb.control<Date | null>(null, Validators.required),
    time: this.fb.control<Date | null>(null, Validators.required),
    weight: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(100)]),
  });

  showCutOffDialog = false;
  cutOffInterview: CadreInterview | null = null;

  readonly cutOffForm = this.fb.nonNullable.group({
    cutOff: this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  interviewStatusSeverity(status: InterviewStatus): InterviewStatusSeverity {
    return status === 'Published' ? 'success' : 'warn';
  }

  openActionMenu(event: Event, interview: CadreInterview, menu: Menu): void {
    this.actionMenuItems = [
      ...(interview.title === 'Oral Interview'
        ? [{ label: 'Panel', icon: 'pi pi-users', command: () => this.onPanel(interview) }]
        : [{ label: 'Venue', icon: 'pi pi-map-marker', command: () => this.onVenue(interview) }]),
      { label: 'Results', icon: 'pi pi-chart-bar', command: () => this.onResults(interview) },
      { label: 'Set Cut Off', icon: 'pi pi-percentage', command: () => this.onManageCutOff(interview) },
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(interview) },
      ...(interview.status === 'Unpublished'
        ? [{ label: 'Publish', icon: 'pi pi-send', command: () => this.onPublish(interview) }]
        : []),
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(interview) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingInterview = null;
    this.form.reset();
    this.showAddDialog = true;
  }

  onEdit(interview: CadreInterview): void {
    this.dialogMode = 'edit';
    this.editingInterview = interview;
    this.form.reset({
      title: interview.title,
      date: new Date(interview.date),
      time: this.parseTime(interview.time),
      weight: interview.weight,
    });
    this.showAddDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.dialogMode === 'edit' && this.editingInterview) {
      const target = this.editingInterview;
      this.interviews = this.interviews.map((interview) =>
        interview === target
          ? {
              ...interview,
              title: raw.title!,
              weight: raw.weight!,
              date: this.formatDate(raw.date!),
              time: this.formatTime(raw.time!),
            }
          : interview,
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Updated',
        detail: `"${raw.title}" was updated successfully.`,
      });
    } else {
      this.interviews = [
        ...this.interviews,
        {
          title: raw.title!,
          weight: raw.weight!,
          date: this.formatDate(raw.date!),
          time: this.formatTime(raw.time!),
          status: 'Unpublished',
          cutOff: null,
        },
      ];
      this.messageService.add({
        severity: 'success',
        summary: 'Interview Added',
        detail: `"${raw.title}" was added successfully.`,
      });
    }

    this.showAddDialog = false;
  }

  onVenue(interview: CadreInterview): void {
    this.router.navigate(['/recruitment/interview-management', this.permitNo, 'distribute-by-region'], {
      queryParams: { title: interview.title },
    });
  }

  onManageCutOff(interview: CadreInterview): void {
    this.cutOffInterview = interview;
    this.cutOffForm.reset({ cutOff: interview.cutOff });
    this.showCutOffDialog = true;
  }

  onSaveCutOff(): void {
    if (this.cutOffForm.invalid || !this.cutOffInterview) {
      this.cutOffForm.markAllAsTouched();
      return;
    }

    const raw = this.cutOffForm.getRawValue();
    const target = this.cutOffInterview;
    this.interviews = this.interviews.map((interview) =>
      interview === target ? { ...interview, cutOff: raw.cutOff } : interview,
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Cut Off Saved',
      detail: `Cut off marks for "${target.title}" was saved successfully.`,
    });
    this.showCutOffDialog = false;
  }

  onPublish(interview: CadreInterview): void {
    this.confirmationService.confirm({
      header: 'Publish Interview',
      message: `Are you sure you want to publish "${interview.title}"?`,
      icon: 'pi pi-send',
      acceptButtonProps: { label: 'Publish' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviews = this.interviews.map((item) =>
          item === interview ? { ...item, status: 'Published' } : item,
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Interview Published',
          detail: `"${interview.title}" was published successfully.`,
        });
      },
    });
  }

  onDelete(interview: CadreInterview): void {
    this.confirmationService.confirm({
      header: 'Delete Interview',
      message: `Are you sure you want to delete "${interview.title}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviews = this.interviews.filter((item) => item !== interview);
        this.messageService.add({
          severity: 'success',
          summary: 'Interview Deleted',
          detail: `"${interview.title}" was deleted successfully.`,
        });
      },
    });
  }

  onResults(interview: CadreInterview): void {
    this.router.navigate(['/recruitment/interview-management', this.permitNo, 'results'], {
      queryParams: { title: interview.title },
    });
  }

  onPanel(interview: CadreInterview): void {
    this.router.navigate(['/recruitment/interview-management', this.permitNo, 'panel'], {
      queryParams: { title: interview.title },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatTime(time: Date): string {
    return time.toTimeString().slice(0, 5);
  }

  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}
