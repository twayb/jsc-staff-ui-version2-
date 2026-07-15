import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Stepper, StepList, Step, StepPanels, StepPanel } from 'primeng/stepper';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Button } from 'primeng/button';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppRichTextEditor } from '../../shared/app-rich-text-editor/app-rich-text-editor';

type QuestionType = 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Essay';
type AddQuestionMode = 'one-by-one' | 'template';

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
    InputNumber,
    InputText,
    Textarea,
    RadioButton,
    Button,
    FileUpload,
    NgClass,
    AppBreadcrumb,
    AppRichTextEditor,
  ],
  templateUrl: './add-question.html',
  styleUrl: './add-question.css',
})
export class AddQuestion {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Add Question' },
  ];

  readonly activeStep = signal(1);
  readonly mode = signal<AddQuestionMode>('one-by-one');
  selectedTemplateFile: File | null = null;

  readonly educationLevelOptions = [
    { label: 'Certificate', value: 'Certificate' },
    { label: 'Diploma', value: 'Diploma' },
    { label: "Bachelor's Degree", value: "Bachelor's Degree" },
    { label: "Master's Degree", value: "Master's Degree" },
    { label: 'PhD', value: 'PhD' },
  ];

  readonly cadreOptions = [
    { label: 'Magistrate', value: 'Magistrate' },
    { label: 'Legal Officer', value: 'Legal Officer' },
    { label: 'Court Clerk', value: 'Court Clerk' },
    { label: 'ICT Officer', value: 'ICT Officer' },
    { label: 'HR Officer', value: 'HR Officer' },
    { label: 'Court Administrator', value: 'Court Administrator' },
  ];

  readonly interviewTypeOptions = [
    { label: 'Oral Interview', value: 'Oral Interview' },
    { label: 'Written Test', value: 'Written Test' },
    { label: 'Practical Assessment', value: 'Practical Assessment' },
    { label: 'Aptitude Test', value: 'Aptitude Test' },
    { label: 'Panel Interview', value: 'Panel Interview' },
  ];

  readonly questionTypeOptions: { label: string; value: QuestionType }[] = [
    { label: 'Multiple Choice', value: 'Multiple Choice' },
    { label: 'True/False', value: 'True/False' },
    { label: 'Short Answer', value: 'Short Answer' },
    { label: 'Essay', value: 'Essay' },
  ];

  readonly questionCategoryOptions = [
    { label: 'Technical', value: 'Technical' },
    { label: 'Legal Knowledge', value: 'Legal Knowledge' },
    { label: 'General Knowledge', value: 'General Knowledge' },
    { label: 'Behavioral', value: 'Behavioral' },
    { label: 'Situational Judgment', value: 'Situational Judgment' },
  ];

  readonly questionLevelOptions = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];

  readonly optionCountOptions = [
    { label: '3 (A-C)', value: 3 },
    { label: '4 (A-D)', value: 4 },
    { label: '5 (A-E)', value: 5 },
  ];

  readonly detailsForm = this.fb.nonNullable.group({
    educationLevel: ['', Validators.required],
    cadre: ['', Validators.required],
    interviewType: ['', Validators.required],
    questionType: this.fb.nonNullable.control<QuestionType | ''>('', Validators.required),
    questionCategory: ['', Validators.required],
    questionLevel: ['', Validators.required],
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

  readonly isMultipleChoice = computed(() => this.questionType() === 'Multiple Choice');
  readonly isTrueFalse = computed(() => this.questionType() === 'True/False');
  readonly isOpenEnded = computed(() => this.questionType() === 'Short Answer' || this.questionType() === 'Essay');

  private readonly questionType = signal<QuestionType | ''>('');

  constructor() {
    this.detailsForm.controls.questionType.valueChanges.subscribe((value) => {
      this.questionType.set(value);
      const numberOfOptions = this.detailsForm.controls.numberOfOptions;
      if (value === 'Multiple Choice') {
        numberOfOptions.setValidators(Validators.required);
      } else {
        numberOfOptions.clearValidators();
        numberOfOptions.setValue(null);
      }
      numberOfOptions.updateValueAndValidity();
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

  onDownloadTemplate(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Download Template',
      detail: 'Template download is not available in this demo.',
    });
  }

  onTemplateFileSelect(event: FileSelectEvent): void {
    this.selectedTemplateFile = event.files[0] ?? null;
  }

  onSubmit(): void {
    if (this.mode() === 'template') {
      if (!this.selectedTemplateFile) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No File Selected',
          detail: 'Please upload a filled template before importing.',
        });
        return;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Questions Imported',
        detail: 'Questions from the template were imported successfully.',
      });

      this.selectedTemplateFile = null;
      this.detailsForm.reset();
      this.mode.set('one-by-one');
      this.activeStep.set(1);
      return;
    }

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

    this.messageService.add({
      severity: 'success',
      summary: 'Question Added',
      detail: 'The question was added to the question bank successfully.',
    });

    this.detailsForm.reset();
    this.questionForm.reset();
    this.optionsArray.clear();
    this.activeStep.set(1);
  }
}
