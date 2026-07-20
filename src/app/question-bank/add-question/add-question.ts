import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Stepper, StepList, Step, StepPanels, StepPanel } from 'primeng/stepper';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppRichTextEditor } from '../../shared/app-rich-text-editor/app-rich-text-editor';
import { AcademicLevelApiService } from '../../core/masterdata/academic-level-api.service';
import { InterviewApiService } from '../../core/recruitment/interview-api.service';
import { SchemeApiService } from '../../core/recruitment/scheme-api.service';
import {
  AddQuestionPayload,
  AnswerOption,
  ExportTemplatePayload,
  ImportResult,
  QuestionBankApiService,
  QuestionCategoryRecord,
  QuestionTypeRecord,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type AddQuestionMode = 'one-by-one' | 'template';
type QuestionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface SelectOption {
  label: string;
  value: number;
}

function downloadBase64Xlsx(base64: string, filename: string): void {
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array([...byteCharacters].map((char) => char.charCodeAt(0)));
  const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

@Component({
  selector: 'app-add-question',
  imports: [
    ReactiveFormsModule,
    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
    Select,
    MultiSelect,
    InputNumber,
    InputText,
    Textarea,
    RadioButton,
    Button,
    Dialog,
    FileUpload,
    NgClass,
    AppBreadcrumb,
    AppRichTextEditor,
  ],
  templateUrl: './add-question.html',
  styleUrl: './add-question.css',
})
export class AddQuestion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly academicLevelApi = inject(AcademicLevelApiService);
  private readonly interviewApi = inject(InterviewApiService);
  private readonly schemeApi = inject(SchemeApiService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Add Question' },
  ];

  readonly activeStep = signal(1);
  readonly mode = signal<AddQuestionMode>('one-by-one');
  readonly optionsLoading = signal(true);
  readonly cadresLoading = signal(false);
  readonly submitting = signal(false);
  readonly showResultDialog = signal(false);
  readonly importResult = signal<ImportResult | null>(null);
  selectedTemplateFile: File | null = null;

  readonly educationLevelOptions = signal<SelectOption[]>([]);
  readonly cadreOptions = signal<SelectOption[]>([]);
  readonly interviewTypeOptions = signal<SelectOption[]>([]);
  readonly questionTypeOptions = signal<SelectOption[]>([]);
  readonly questionCategoryOptions = signal<SelectOption[]>([]);

  private questionTypes: QuestionTypeRecord[] = [];

  readonly questionLevelOptions: { label: string; value: QuestionLevel }[] = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];

  readonly optionCountOptions = [
    { label: '3 (A-C)', value: 3 },
    { label: '4 (A-D)', value: 4 },
    { label: '5 (A-E)', value: 5 },
  ];

  readonly detailsForm = this.fb.nonNullable.group({
    educationLevel: this.fb.control<number | null>(null, Validators.required),
    cadre: this.fb.nonNullable.control<number[]>([], Validators.minLength(1)),
    interviewType: this.fb.control<number | null>(null, Validators.required),
    questionType: this.fb.control<number | null>(null, Validators.required),
    questionCategory: this.fb.control<number | null>(null, Validators.required),
    questionLevel: this.fb.nonNullable.control<QuestionLevel | ''>('', Validators.required),
    points: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    numberOfOptions: this.fb.control<number | null>(null),
  });

  readonly questionForm = this.fb.nonNullable.group({
    questionText: ['', Validators.required],
    correctAnswer: [''],
    modelAnswer: [''],
    correctOptionIndex: this.fb.control<number | null>(null),
    options: this.fb.array<FormGroup>([]),
  });

  get optionsArray(): FormArray<FormGroup> {
    return this.questionForm.controls.options;
  }

  private readonly questionTypeId = signal<number | null>(null);

  readonly selectedQuestionTypeName = computed(
    () => this.questionTypes.find((type) => type.id === this.questionTypeId())?.name ?? '',
  );

  readonly isMultipleChoice = computed(() => this.selectedQuestionTypeName() === 'Multiple Choice');
  readonly isTrueFalse = computed(() => this.selectedQuestionTypeName() === 'True or False');
  readonly isOpenEnded = computed(() => this.selectedQuestionTypeName() === 'Short Answer');

  constructor() {
    this.detailsForm.controls.questionType.valueChanges.subscribe((value) => {
      this.questionTypeId.set(value);
      const numberOfOptions = this.detailsForm.controls.numberOfOptions;
      if (this.isMultipleChoice()) {
        numberOfOptions.setValidators(Validators.required);
      } else {
        numberOfOptions.clearValidators();
        numberOfOptions.setValue(null);
      }
      numberOfOptions.updateValueAndValidity();
    });

    this.detailsForm.controls.educationLevel.valueChanges.subscribe((educationLevelId) => {
      this.detailsForm.controls.cadre.setValue([]);
      this.cadreOptions.set([]);
      if (educationLevelId !== null) {
        this.loadCadres(educationLevelId);
      }
    });
  }

  ngOnInit(): void {
    this.optionsLoading.set(true);
    forkJoin({
      levels: this.academicLevelApi.getAcademicLevels(),
      interviewTypes: this.interviewApi.getInterviewTypes(),
      questionTypes: this.questionBankApi.getQuestionTypes(),
      questionCategories: this.questionBankApi.getQuestionCategories(),
    })
      .pipe(finalize(() => this.optionsLoading.set(false)))
      .subscribe({
        next: ({ levels, interviewTypes, questionTypes, questionCategories }) => {
          this.educationLevelOptions.set(
            (levels.data ?? []).map((level) => ({ label: level.name, value: level.id })),
          );
          this.interviewTypeOptions.set(
            (interviewTypes.data ?? []).map((type) => ({ label: titleCase(type.name), value: type.id })),
          );
          this.questionTypes = questionTypes.data?.content ?? [];
          this.questionTypeOptions.set(this.questionTypes.map((type) => ({ label: type.name, value: type.id })));
          this.questionCategoryOptions.set(
            (questionCategories.data?.content ?? []).map((category: QuestionCategoryRecord) => ({
              label: category.category,
              value: category.id,
            })),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Form Data',
            detail: 'Could not load education levels, interview types, question types, or categories.',
          });
        },
      });
  }

  private loadCadres(educationLevelId: number): void {
    this.cadresLoading.set(true);
    this.schemeApi
      .getSchemesByEducationLevel(educationLevelId)
      .pipe(finalize(() => this.cadresLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.cadreOptions.set((response.data ?? []).map((scheme) => ({ label: scheme.name, value: scheme.id })));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Cadres',
            detail: 'Could not load cadres for the selected education level.',
          });
        },
      });
  }

  onGoToQuestionStep(activateCallback: (step: number) => void): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    this.rebuildOptions();
    activateCallback(2);
  }

  private rebuildOptions(): void {
    this.optionsArray.clear();

    if (!this.isMultipleChoice()) {
      this.questionForm.controls.correctOptionIndex.setValue(null);
      return;
    }

    const count = this.detailsForm.controls.numberOfOptions.value ?? 0;
    for (let i = 0; i < count; i++) {
      this.optionsArray.push(this.fb.nonNullable.group({ text: ['', Validators.required] }));
    }
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  private buildAnswerOptions(): AnswerOption[] {
    if (this.isMultipleChoice()) {
      return this.optionsArray.controls.map((group, index) => ({
        key: this.optionLetter(index),
        text: (group.get('text')?.value as string) ?? '',
      }));
    }
    if (this.isTrueFalse()) {
      return [
        { key: 'A', text: 'True' },
        { key: 'B', text: 'False' },
      ];
    }
    return [];
  }

  onDownloadTemplate(): void {
    const details = this.detailsForm.getRawValue();
    if (!details.educationLevel || !details.interviewType || !details.questionType) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Details',
        detail: 'Complete the question details step first.',
      });
      return;
    }

    const payload: ExportTemplatePayload = {
      educationLevelId: details.educationLevel,
      schemeId: details.cadre,
      interviewTypeId: details.interviewType,
      questionTypeId: details.questionType,
      answerOptions: this.buildAnswerOptions(),
    };

    this.questionBankApi.exportTemplate(payload).subscribe({
      next: (response) => {
        if (!response.data) {
          return;
        }
        downloadBase64Xlsx(response.data, 'question_template.xlsx');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Download Failed',
          detail: 'Could not download the template. Please try again later.',
        });
      },
    });
  }

  onTemplateFileSelect(event: FileSelectEvent): void {
    this.selectedTemplateFile = event.files[0] ?? null;
  }

  onSubmit(): void {
    if (this.mode() === 'template') {
      this.submitTemplate();
      return;
    }

    this.submitQuestion(false);
  }

  private submitTemplate(): void {
    if (!this.selectedTemplateFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please upload a filled template before importing.',
      });
      return;
    }

    const details = this.detailsForm.getRawValue();
    const schemeId = details.cadre[0];
    if (schemeId === undefined || !details.educationLevel || !details.interviewType || !details.questionType) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Details',
        detail: 'Complete the question details step first.',
      });
      return;
    }

    this.submitting.set(true);
    this.questionBankApi
      .importQuestions(
        schemeId,
        details.educationLevel,
        details.interviewType,
        details.questionType,
        details.questionCategory ?? 0,
        details.points ?? 0,
        details.questionLevel,
        this.selectedTemplateFile,
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.selectedTemplateFile = null;
          this.importResult.set(
            response.data ?? { totalRows: 0, savedRows: 0, skippedRows: 0, failedRows: [] },
          );
          this.showResultDialog.set(true);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Import Failed',
            detail: 'Could not import the questions. Please try again later.',
          });
        },
      });
  }

  onDownloadErrorReport(): void {
    const base64 = this.importResult()?.errorReportBase64;
    if (!base64) {
      return;
    }
    downloadBase64Xlsx(base64, 'error_report.xlsx');
  }

  onImportDone(): void {
    this.showResultDialog.set(false);
    this.importResult.set(null);
    this.resetAfterSubmit();
  }

  private buildPayload(allowDuplicate: boolean): AddQuestionPayload {
    const details = this.detailsForm.getRawValue();
    const question = this.questionForm.getRawValue();

    let correctAnswer = '';
    if (this.isMultipleChoice()) {
      correctAnswer = question.correctOptionIndex !== null ? this.optionLetter(question.correctOptionIndex) : '';
    } else if (this.isTrueFalse()) {
      correctAnswer = question.correctAnswer === 'True' ? 'A' : question.correctAnswer === 'False' ? 'B' : '';
    }

    return {
      educationLevelId: details.educationLevel!,
      selectedSchemeIds: details.cadre,
      interviewTypeId: details.interviewType!,
      questionTypeId: details.questionType!,
      questionCategoryId: details.questionCategory ?? undefined,
      pointAllocation: details.points!,
      questionLevel: details.questionLevel,
      question: question.questionText,
      answerOptions: this.buildAnswerOptions(),
      correctAnswer,
      expectedAnswer: this.isOpenEnded() ? question.modelAnswer : '',
      allowDuplicate,
    };
  }

  private submitQuestion(allowDuplicate: boolean): void {
    if (this.questionForm.controls.questionText.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    if (this.isMultipleChoice()) {
      const optionsInvalid = this.optionsArray.invalid;
      const noCorrectAnswer = this.questionForm.controls.correctOptionIndex.value === null;
      if (optionsInvalid || noCorrectAnswer) {
        this.questionForm.markAllAsTouched();
        return;
      }
    }

    const payload = this.buildPayload(allowDuplicate);

    this.submitting.set(true);
    this.questionBankApi
      .addQuestion(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Question Added',
            detail: response.message,
          });
          this.resetAfterSubmit();
        },
        error: (error) => {
          const detail: string = error.error?.message ?? '';
          if (detail.includes('Similar question detected')) {
            this.confirmDuplicate(detail);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Save Failed',
              detail: detail || 'Could not save the question. Please try again later.',
            });
          }
        },
      });
  }

  private confirmDuplicate(detail: string): void {
    this.confirmationService.confirm({
      header: 'Duplicate Question Detected',
      message: detail,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Save Anyway', severity: 'warn' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => this.submitQuestion(true),
    });
  }

  private resetAfterSubmit(): void {
    this.detailsForm.reset();
    this.questionForm.reset();
    this.optionsArray.clear();
    this.cadreOptions.set([]);
    this.mode.set('one-by-one');
    this.activeStep.set(1);
  }
}
