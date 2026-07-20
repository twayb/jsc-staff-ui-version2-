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
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { InterviewApiService, InterviewInput, InterviewRecord } from '../../../core/recruitment/interview-api.service';

type InterviewTitle = 'Written Interview' | 'Oral Interview' | 'Practical Interview';
type InterviewStatus = 'Published' | 'Unpublished';
type InterviewStatusSeverity = 'success' | 'warn';

interface CadreInterview {
  id: number;
  interviewTypeId: number;
  title: InterviewTitle;
  weight: number;
  date: string;
  time: string;
  status: InterviewStatus;
  cutOff: number | null;
}

function titleFromInterviewType(name: string): InterviewTitle {
  const upper = name.toUpperCase();
  if (upper.includes('ORAL')) return 'Oral Interview';
  if (upper.includes('PRACTICAL')) return 'Practical Interview';
  return 'Written Interview';
}

function mapInterview(record: InterviewRecord): CadreInterview {
  return {
    id: record.id,
    interviewTypeId: record.interviewType.id,
    title: titleFromInterviewType(record.interviewType.name),
    weight: record.interviewMarksWeight,
    date: record.interviewDate,
    time: record.interviewTime?.slice(0, 5) ?? '',
    status: record.status === 'PUBLISHED' ? 'Published' : 'Unpublished',
    cutOff: record.interviewCutOff,
  };
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
  private readonly advertApi = inject(AdvertApiService);
  private readonly interviewApi = inject(InterviewApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';

  readonly advertName = signal<string | null>(null);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: 'Interviews' },
  ];

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly interviews = signal<CadreInterview[]>([]);
  readonly interviewTypeOptions = signal<{ label: string; value: number }[]>([]);

  ngOnInit(): void {
    this.advertApi.getAdvert(Number(this.advertId)).subscribe({
      next: (response) => this.advertName.set(response.data?.advertName ?? null),
      error: () => {},
    });

    this.interviewApi.getInterviewTypes().subscribe({
      next: (response) => {
        this.interviewTypeOptions.set(
          (response.data ?? []).map((type) => ({ label: titleFromInterviewType(type.name), value: type.id })),
        );
      },
      error: () => {},
    });

    this.loadInterviews();
  }

  private loadInterviews(): void {
    this.loading.set(true);
    this.interviewApi
      .getAdvertInterviews(Number(this.advertId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.interviews.set((response.data ?? []).map(mapInterview));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interviews',
            detail: 'Could not load the interview list. Please try again later.',
          });
        },
      });
  }

  actionMenuItems: MenuItem[] = [];

  showAddDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingInterview: CadreInterview | null = null;

  readonly form = this.fb.nonNullable.group({
    interviewTypeId: this.fb.control<number | null>(null, Validators.required),
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
      interviewTypeId: interview.interviewTypeId,
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
    const input: InterviewInput = {
      interviewTypeId: raw.interviewTypeId!,
      interviewDate: this.formatDate(raw.date!),
      interviewTime: this.formatTime(raw.time!),
      interviewMarksWeight: raw.weight!,
    };

    const request =
      this.dialogMode === 'edit' && this.editingInterview
        ? this.interviewApi.updateInterview(this.editingInterview.id, input)
        : this.interviewApi.createInterview(Number(this.advertId), input);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: this.dialogMode === 'edit' ? 'Interview Updated' : 'Interview Added',
          detail: response.message,
        });
        this.showAddDialog = false;
        this.loadInterviews();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save the interview. Please try again later.',
        });
      },
    });
  }

  onVenue(interview: CadreInterview): void {
    this.router.navigate(
      ['/recruitment/interview-management', this.advertId, 'distribute-by-region', interview.interviewTypeId],
      { queryParams: { title: interview.title } },
    );
  }

  onManageCutOff(interview: CadreInterview): void {
    this.cutOffInterview = interview;
    this.cutOffForm.reset({ cutOff: interview.cutOff });
    this.showCutOffDialog = true;
  }

  // Not wired yet: the old app's cut-off endpoint is POST interview-results-cut-off/{advertId}/{interviewTypeId},
  // a separate results-stage concept, not a field on the interview record itself — belongs with the Results screen.
  onSaveCutOff(): void {
    if (this.cutOffForm.invalid || !this.cutOffInterview) {
      this.cutOffForm.markAllAsTouched();
      return;
    }

    const raw = this.cutOffForm.getRawValue();
    const target = this.cutOffInterview;
    this.interviews.update((list) =>
      list.map((interview) => (interview === target ? { ...interview, cutOff: raw.cutOff } : interview)),
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Cut Off Saved',
      detail: `Cut off marks for "${target.title}" was saved successfully.`,
    });
    this.showCutOffDialog = false;
  }

  // Not wired yet: the old app's publishInterview() is GET admins/publish-applications/{advertId} —
  // scoped to the whole advert, not a single interview row, so calling it per-row here would be wrong.
  // Needs its own confirmation before wiring.
  onPublish(interview: CadreInterview): void {
    this.confirmationService.confirm({
      header: 'Publish Interview',
      message: `Are you sure you want to publish "${interview.title}"?`,
      icon: 'pi pi-send',
      acceptButtonProps: { label: 'Publish' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.interviews.update((list) =>
          list.map((item) => (item === interview ? { ...item, status: 'Published' } : item)),
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
        this.interviewApi.deleteInterview(interview.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Interview Deleted',
              detail: `"${interview.title}" was deleted successfully.`,
            });
            this.loadInterviews();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: 'Could not delete the interview. Please try again later.',
            });
          },
        });
      },
    });
  }

  onResults(interview: CadreInterview): void {
    this.router.navigate(['/recruitment/interview-management', this.advertId, 'results'], {
      queryParams: { title: interview.title },
    });
  }

  onPanel(interview: CadreInterview): void {
    this.router.navigate(['/recruitment/interview-management', this.advertId, 'panel'], {
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
