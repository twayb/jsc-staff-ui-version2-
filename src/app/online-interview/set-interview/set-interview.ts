import { Component, OnInit, inject, signal } from '@angular/core';
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
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../core/recruitment/advert-api.service';
import {
  InterviewSetupPayload,
  InterviewSetupQuota,
  QuestionBankApiService,
  QuestionCategoryCount,
  QuestionRecord,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type SelectionMode = 'random' | 'manual';
type BackendQuestionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface SelectOption {
  label: string;
  value: number;
}

interface AllocationRow {
  categoryId: number;
  category: string;
  available: Record<BackendQuestionLevel, number>;
  counts: Record<BackendQuestionLevel, number>;
}

interface ManualQuestionOption {
  id: number;
  text: string;
  category: string;
  level: string;
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
export class SetInterview implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Set Interview' },
  ];

  readonly levels: BackendQuestionLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

  readonly activeStep = signal(1);
  readonly selectionMode = signal<SelectionMode>('random');
  readonly selectedQuestionIds = signal<number[]>([]);
  readonly randomAllocation = signal<AllocationRow[]>([]);
  readonly manualQuestions = signal<ManualQuestionOption[]>([]);
  readonly confirmed = signal(false);
  readonly submitting = signal(false);

  readonly optionsLoading = signal(true);
  readonly loadingInterviewTypes = signal(false);
  readonly loadingQuestions = signal(false);

  readonly advertOptions = signal<SelectOption[]>([]);
  readonly interviewTypeOptions = signal<SelectOption[]>([]);
  readonly questionTypeOptions = signal<SelectOption[]>([]);

  private questionCategoryNamesById = new Map<number, string>();
  private readonly schemeId = signal<number | null>(null);

  readonly setupForm = this.fb.nonNullable.group({
    advert: this.fb.control<number | null>(null, Validators.required),
    interviewType: this.fb.control<number | null>(null, Validators.required),
    questionType: this.fb.control<number | null>(null, Validators.required),
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

  constructor() {
    this.setupForm.controls.advert.valueChanges.subscribe((advertId) => this.onAdvertChange(advertId));
    this.setupForm.controls.questionType.valueChanges.subscribe(() => this.loadQuestionData());
  }

  ngOnInit(): void {
    this.optionsLoading.set(true);
    forkJoin({
      adverts: this.advertApi.getAdverts(),
      questionTypes: this.questionBankApi.getQuestionTypes(),
      questionCategories: this.questionBankApi.getQuestionCategories(),
    })
      .pipe(finalize(() => this.optionsLoading.set(false)))
      .subscribe({
        next: ({ adverts, questionTypes, questionCategories }) => {
          this.advertOptions.set(
            (adverts.data?.content ?? []).map((advert) => ({
              label: `${advert.referenceNumber} — ${advert.advertName}`,
              value: advert.id,
            })),
          );
          this.questionTypeOptions.set(
            (questionTypes.data?.content ?? []).map((type) => ({ label: type.name, value: type.id })),
          );
          this.questionCategoryNamesById = new Map(
            (questionCategories.data?.content ?? []).map((category) => [category.id, category.category]),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Form Data',
            detail: 'Could not load adverts, question types, or categories.',
          });
        },
      });
  }

  private onAdvertChange(advertId: number | null): void {
    this.setupForm.controls.interviewType.setValue(null, { emitEvent: false });
    this.interviewTypeOptions.set([]);
    this.schemeId.set(null);
    this.resetQuestionData();

    if (advertId === null) {
      return;
    }

    this.loadingInterviewTypes.set(true);
    this.advertApi
      .getAdvertInterviews(advertId)
      .pipe(finalize(() => this.loadingInterviewTypes.set(false)))
      .subscribe({
        next: (response) => {
          const records = response.data ?? [];
          const seen = new Map<number, string>();
          records.forEach((record) => seen.set(record.interviewType.id, titleCase(record.interviewType.name)));
          this.interviewTypeOptions.set([...seen].map(([value, label]) => ({ label, value })));
          this.schemeId.set(records[0]?.advert.scheme.id ?? null);
          this.loadQuestionData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interview Types',
            detail: 'Could not load interview types for the selected advert.',
          });
        },
      });
  }

  private resetQuestionData(): void {
    this.selectedQuestionIds.set([]);
    this.manualQuestions.set([]);
    this.randomAllocation.set([]);
  }

  private loadQuestionData(): void {
    this.resetQuestionData();
    const schemeId = this.schemeId();
    const questionTypeId = this.setupForm.controls.questionType.value;

    if (schemeId === null || questionTypeId === null) {
      return;
    }

    this.loadingQuestions.set(true);
    forkJoin({
      questions: this.questionBankApi.getQuestionsByScheme(schemeId, 0, 1000, questionTypeId),
      counts: this.questionBankApi.getQuestionCountByScheme(schemeId, questionTypeId),
    })
      .pipe(finalize(() => this.loadingQuestions.set(false)))
      .subscribe({
        next: ({ questions, counts }) => {
          this.manualQuestions.set((questions.data?.content ?? []).map((record) => this.toManualOption(record)));
          this.randomAllocation.set((counts.data?.categories ?? []).map((record) => this.toAllocationRow(record)));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Questions',
            detail: 'Could not load questions for the selected cadre and question type.',
          });
        },
      });
  }

  private toManualOption(record: QuestionRecord): ManualQuestionOption {
    return {
      id: record.id,
      text: record.question.replace(/<[^>]*>/g, ''),
      category: this.questionCategoryNamesById.get(record.questionCategoryId) ?? '—',
      level: titleCase(record.questionLevel),
    };
  }

  private toAllocationRow(record: QuestionCategoryCount): AllocationRow {
    const available: Record<BackendQuestionLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    record.levels.forEach((level) => {
      available[level.questionLevel as BackendQuestionLevel] = level.total;
    });
    return {
      categoryId: record.questionCategoryId,
      category: record.questionCategoryName,
      available,
      counts: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    };
  }

  levelLabel(level: BackendQuestionLevel): string {
    return titleCase(level);
  }

  selectedAdvertLabel(): string {
    const id = this.setupForm.controls.advert.value;
    return this.advertOptions().find((option) => option.value === id)?.label ?? '—';
  }

  selectedInterviewTypeLabel(): string {
    const id = this.setupForm.controls.interviewType.value;
    return this.interviewTypeOptions().find((option) => option.value === id)?.label ?? '—';
  }

  selectedQuestionTypeLabel(): string {
    const id = this.setupForm.controls.questionType.value;
    return this.questionTypeOptions().find((option) => option.value === id)?.label ?? '—';
  }

  // Reads a plain FormControl value (not a signal), so this must stay a regular
  // method rather than `computed()` — a computed with no signal reads inside it
  // would cache its first result and never see later edits to the control.
  questionCount(): number {
    return this.setupForm.controls.questionCount.value ?? 0;
  }

  totalAllocated(): number {
    return this.randomAllocation().reduce(
      (sum, row) => sum + row.counts.LOW + row.counts.MEDIUM + row.counts.HIGH,
      0,
    );
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

  isQuestionSelected(id: number): boolean {
    return this.selectedQuestionIds().includes(id);
  }

  isSelectionLimitReached(id: number): boolean {
    return !this.isQuestionSelected(id) && this.selectedQuestionIds().length >= this.questionCount();
  }

  toggleQuestion(id: number): void {
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
    return row.available.LOW + row.available.MEDIUM + row.available.HIGH;
  }

  rowAllocatedTotal(row: AllocationRow): number {
    return row.counts.LOW + row.counts.MEDIUM + row.counts.HIGH;
  }

  setLevelCount(rowIndex: number, level: BackendQuestionLevel, value: number | null): void {
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

  private buildQuestionQuotas(): InterviewSetupQuota[] {
    return this.randomAllocation()
      .filter((row) => this.rowAllocatedTotal(row) > 0)
      .map((row) => ({
        questionCategoryId: row.categoryId,
        levels: this.levels
          .filter((level) => row.counts[level] > 0)
          .map((level) => ({ questionLevel: level, count: row.counts[level] })),
      }));
  }

  private combineDateTime(date: Date, time: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}:00`;
  }

  onSubmit(): void {
    const setup = this.setupForm.getRawValue();
    const timing = this.timingForm.getRawValue();

    const payload: InterviewSetupPayload = {
      advertId: setup.advert!,
      interviewTypeId: setup.interviewType!,
      questionTypeId: setup.questionType!,
      numberOfQuestions: setup.questionCount!,
      questionSelectionMode: this.selectionMode() === 'manual' ? 'MANUAL' : 'RANDOM',
      selectedQuestionIds: this.selectionMode() === 'manual' ? this.selectedQuestionIds() : [],
      selectedInstructionIds: [],
      startDateTime: this.combineDateTime(timing.startDate!, timing.startTime!),
      endDateTime: this.combineDateTime(timing.endDate!, timing.endTime!),
      showResultToCandidate: setup.showResults,
      durationHours: timing.durationHours ?? 0,
      durationMinutes: timing.durationMinutes ?? 0,
      questionQuotas: this.selectionMode() === 'random' ? this.buildQuestionQuotas() : null,
    };

    this.submitting.set(true);
    this.questionBankApi
      .addInterviewSetup(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Interview Scheduled',
            detail: response.message,
          });
          this.resetWizard();
          this.router.navigate(['/online-interview/interview-list']);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: 'Could not schedule the interview. Please try again later.',
          });
        },
      });
  }

  private resetWizard(): void {
    this.setupForm.reset({ showResults: true });
    this.timingForm.reset({ durationHours: 0, durationMinutes: 0 });
    this.selectionMode.set('random');
    this.resetQuestionData();
    this.interviewTypeOptions.set([]);
    this.schemeId.set(null);
    this.confirmed.set(false);
    this.activeStep.set(1);
  }
}
