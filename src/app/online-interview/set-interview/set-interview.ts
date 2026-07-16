import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Stepper, StepList, Step, StepPanels, StepPanel } from 'primeng/stepper';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { DatePipe, NgClass } from '@angular/common';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { InterviewSet, OnlineInterviewDataService, QuestionLevel } from '../online-interview-data.service';

type SelectionMode = 'random' | 'manual';

interface AllocationRow {
  category: string;
  available: Record<QuestionLevel, number>;
  counts: Record<QuestionLevel, number>;
}

@Component({
  selector: 'app-set-interview',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    Select,
    InputNumber,
    DatePicker,
    ToggleSwitch,
    Button,
    NgClass,
    DatePipe,
    AppBreadcrumb,
    AppDataTable,
  ],
  templateUrl: './set-interview.html',
  styleUrl: './set-interview.css',
})
export class SetInterview {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Set Interview' },
  ];

  readonly levels: QuestionLevel[] = ['Easy', 'Medium', 'Hard'];

  readonly activeStep = signal(1);
  readonly selectionMode = signal<SelectionMode>('random');
  readonly selectedQuestionIds = signal<string[]>([]);
  readonly randomAllocation = signal<AllocationRow[]>([]);
  readonly confirmed = signal(false);

  readonly advertOptions = this.interviewData.advertOptions.map((advert) => ({
    label: `${advert.referenceNo} — ${advert.cadre} (${advert.posts} posts)`,
    value: advert.referenceNo,
  }));

  readonly interviewTypeOptions = this.interviewData.interviewTypes.map((type) => ({
    label: type.name,
    value: type.name,
  }));

  readonly setupForm = this.fb.nonNullable.group({
    advert: ['', Validators.required],
    interviewType: ['', Validators.required],
    questionCount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    showResults: this.fb.nonNullable.control<boolean>(true),
  });

  readonly timingForm = this.fb.nonNullable.group({
    startDate: this.fb.control<Date | null>(null, Validators.required),
    startTime: this.fb.control<Date | null>(null, Validators.required),
    endDate: this.fb.control<Date | null>(null, Validators.required),
    endTime: this.fb.control<Date | null>(null, Validators.required),
    durationHours: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.max(23)]),
    durationMinutes: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.max(59)]),
  });

  private readonly selectedAdvertRef = signal('');

  constructor() {
    this.setupForm.controls.advert.valueChanges.subscribe((value) => {
      this.selectedAdvertRef.set(value);
      this.selectedQuestionIds.set([]);
      this.randomAllocation.set(
        this.interviewData.getCategoryAvailability(this.interviewData.findAdvert(value)?.cadre ?? '').map((row) => ({
          category: row.category,
          available: row.levels,
          counts: { Easy: 0, Medium: 0, Hard: 0 },
        })),
      );
    });
  }

  readonly selectedCadre = computed(() => this.interviewData.findAdvert(this.selectedAdvertRef())?.cadre ?? '');

  readonly availableQuestions = computed(() => this.interviewData.getQuestionsForCadre(this.selectedCadre()));

  // Reads a plain FormControl value (not a signal), so this must stay a regular
  // method rather than `computed()` — a computed with no signal reads inside it
  // would cache its first result and never see later edits to the control.
  questionCount(): number {
    return this.setupForm.controls.questionCount.value ?? 0;
  }

  totalAllocated(): number {
    return this.randomAllocation().reduce((sum, row) => sum + row.counts.Easy + row.counts.Medium + row.counts.Hard, 0);
  }

  totalRemaining(): number {
    return this.questionCount() - this.totalAllocated();
  }

  canProceedFromQuestionSelection(): boolean {
    if (this.questionCount() <= 0) {
      return false;
    }
    if (this.selectionMode() === 'manual') {
      return this.selectedQuestionIds().length === this.questionCount();
    }
    return this.totalRemaining() === 0;
  }

  isQuestionSelected(id: string): boolean {
    return this.selectedQuestionIds().includes(id);
  }

  isSelectionLimitReached(id: string): boolean {
    return !this.isQuestionSelected(id) && this.selectedQuestionIds().length >= this.questionCount();
  }

  toggleQuestion(id: string): void {
    if (this.isSelectionLimitReached(id)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selection Limit Reached',
        detail: `You can only select ${this.questionCount()} question(s). Unselect one to choose another.`,
      });
      return;
    }
    this.selectedQuestionIds.update((ids) =>
      ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id],
    );
  }

  rowAvailableTotal(row: AllocationRow): number {
    return row.available.Easy + row.available.Medium + row.available.Hard;
  }

  rowAllocatedTotal(row: AllocationRow): number {
    return row.counts.Easy + row.counts.Medium + row.counts.Hard;
  }

  setLevelCount(rowIndex: number, level: QuestionLevel, value: number | null): void {
    this.randomAllocation.update((rows) => {
      const row = rows[rowIndex];
      if (!row) {
        return rows;
      }

      const allocatedElsewhere = this.totalAllocated() - row.counts[level];
      const maxByTotal = Math.max(0, this.questionCount() - allocatedElsewhere);
      const clamped = Math.max(0, Math.min(value ?? 0, row.available[level], maxByTotal));

      return rows.map((existing, index) =>
        index === rowIndex ? { ...existing, counts: { ...existing.counts, [level]: clamped } } : existing,
      );
    });
  }

  onGoToQuestionStep(activateCallback: (step: number) => void): void {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    activateCallback(2);
  }

  onGoToReviewStep(activateCallback: (step: number) => void): void {
    if (this.timingForm.invalid) {
      this.timingForm.markAllAsTouched();
      return;
    }

    const raw = this.timingForm.getRawValue();
    if ((raw.durationHours ?? 0) * 60 + (raw.durationMinutes ?? 0) <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duration Required',
        detail: 'Please set a duration greater than zero.',
      });
      return;
    }

    activateCallback(4);
  }

  private resolveRandomQuestionIds(): string[] {
    const pool = this.availableQuestions();
    const ids: string[] = [];

    for (const row of this.randomAllocation()) {
      for (const level of this.levels) {
        const count = row.counts[level];
        if (count <= 0) {
          continue;
        }
        const candidates = pool.filter((question) => question.level === level);
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        ids.push(...shuffled.slice(0, count).map((question) => question.id));
      }
    }

    return ids;
  }

  onSubmit(): void {
    const setupRaw = this.setupForm.getRawValue();
    const timingRaw = this.timingForm.getRawValue();
    const advert = this.interviewData.findAdvert(setupRaw.advert);

    if (!advert) {
      return;
    }

    const interview: InterviewSet = {
      id: `OI-${Date.now()}`,
      title: `${advert.cadre} ${setupRaw.interviewType}`,
      cadre: advert.cadre,
      category: this.interviewData.categoryForCadre(advert.cadre),
      interviewType: setupRaw.interviewType,
      selectionMode: this.selectionMode() === 'manual' ? 'Manual' : 'Random',
      showResults: setupRaw.showResults,
      questionIds:
        this.selectionMode() === 'manual' ? this.selectedQuestionIds() : this.resolveRandomQuestionIds(),
      questionCount: setupRaw.questionCount!,
      duration: (timingRaw.durationHours ?? 0) * 60 + (timingRaw.durationMinutes ?? 0),
      passMark: 50,
      candidatesInvited: advert.posts * 6,
      scheduledDate: this.formatDate(timingRaw.startDate!),
      scheduledTime: this.formatTime(timingRaw.startTime!),
      endDate: this.formatDate(timingRaw.endDate!),
      endTime: this.formatTime(timingRaw.endTime!),
      status: 'Scheduled',
    };

    this.interviewData.interviewSets = [...this.interviewData.interviewSets, interview];

    this.messageService.add({
      severity: 'success',
      summary: 'Interview Scheduled',
      detail: `"${interview.title}" was scheduled successfully.`,
    });

    this.setupForm.reset({ showResults: true });
    this.timingForm.reset({ durationHours: 0, durationMinutes: 0 });
    this.selectionMode.set('random');
    this.selectedQuestionIds.set([]);
    this.randomAllocation.set([]);
    this.confirmed.set(false);
    this.activeStep.set(1);
    this.router.navigate(['/online-interview/interview-list']);
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatTime(time: Date): string {
    return time.toTimeString().slice(0, 5);
  }
}
