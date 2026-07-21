import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import {
  InterviewSetupPayload,
  InterviewSetupRecord,
  QuestionBankApiService,
} from '../../core/question-bank/question-bank-api.service';
import { titleCase } from '../../core/utils';

type InterviewTypeSeverity = 'success' | 'info' | 'secondary';

interface InterviewDetail {
  title: string;
  cadre: string;
  interviewType: string;
  selectionMode: string;
  questionCount: number;
  showResults: boolean;
  scheduledDate: string;
  scheduledTime: string;
  endDate: string;
  endTime: string;
  durationMinutes: number;
}

interface QuestionPreview {
  id: number;
  text: string;
  category: string;
  level: string;
}

function splitDateTime(value: string): { date: string; time: string } {
  const [date, time] = value.split('T');
  return { date: date ?? '', time: time?.slice(0, 5) ?? '' };
}

function mapInterview(record: InterviewSetupRecord): InterviewDetail {
  const start = splitDateTime(record.startDateTime);
  const end = splitDateTime(record.endDateTime);
  return {
    title: `${record.advertName} — ${titleCase(record.interviewTypeName)}`,
    cadre: record.advertName,
    interviewType: titleCase(record.interviewTypeName),
    selectionMode: titleCase(record.questionSelectionMode),
    questionCount: record.numberOfQuestions,
    showResults: record.showResultToCandidate,
    scheduledDate: start.date,
    scheduledTime: start.time,
    endDate: end.date,
    endTime: end.time,
    durationMinutes: record.durationHours * 60 + record.durationMinutes,
  };
}

@Component({
  selector: 'app-interview-details',
  imports: [FormsModule, Tag, Dialog, Select, Button, Skeleton, AppBreadcrumb],
  templateUrl: './interview-details.html',
  styleUrl: './interview-details.css',
})
export class InterviewDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly interview = signal<InterviewDetail | null>(null);
  private rawRecord: InterviewSetupRecord | null = null;

  /** All questions available for this interview's scheme/question type — powers the edit checklist. */
  readonly allQuestions = signal<QuestionPreview[]>([]);
  /** Working copy of selected ids while the dialog is open (edited independently of the saved record). */
  readonly selectedQuestionIds = signal<number[]>([]);

  readonly loading = signal(true);
  readonly questionsLoading = signal(false);
  readonly savingQuestions = signal(false);
  readonly skeletonFields = Array.from({ length: 6 });

  readonly breadcrumbItems = signal<MenuItem[]>([
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview List', routerLink: '/online-interview/interview-list' },
    { label: 'Interview' },
  ]);

  private questionCategoryNamesById = new Map<number, string>();

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      interview: this.questionBankApi.getInterviewSetupById(this.id),
      questionCategories: this.questionBankApi.getQuestionCategories(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ interview, questionCategories }) => {
          if (!interview.data) {
            return;
          }
          this.questionCategoryNamesById = new Map(
            (questionCategories.data?.content ?? []).map((category) => [category.id, category.category]),
          );

          this.rawRecord = interview.data;
          const detail = mapInterview(interview.data);
          this.interview.set(detail);
          this.selectedQuestionIds.set(interview.data.selectedQuestionIds);
          this.breadcrumbItems.set([
            { label: 'Online Interview', routerLink: '/online-interview' },
            { label: 'Interview List', routerLink: '/online-interview/interview-list' },
            { label: detail.title },
          ]);
          this.loadQuestions(interview.data);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Interview',
            detail: 'Could not load the interview details. Please try again later.',
          });
        },
      });
  }

  private loadQuestions(record: InterviewSetupRecord): void {
    this.questionsLoading.set(true);
    this.questionBankApi
      .getQuestionsByScheme(record.schemeId, 0, 1000, record.questionTypeId ?? undefined)
      .pipe(finalize(() => this.questionsLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.allQuestions.set(
            (response.data?.content ?? []).map((question) => ({
              id: question.id,
              text: question.question.replace(/<[^>]*>/g, ''),
              category: this.questionCategoryNamesById.get(question.questionCategoryId) ?? '—',
              level: titleCase(question.questionLevel),
            })),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Questions',
            detail: 'Could not load questions for this cadre and question type.',
          });
        },
      });
  }

  interviewTypeSeverity(interviewType: string): InterviewTypeSeverity {
    const upper = interviewType.toUpperCase();
    if (upper.includes('WRITTEN')) {
      return 'info';
    }
    if (upper.includes('ORAL')) {
      return 'success';
    }
    return 'secondary';
  }

  formatDuration(minutes: number): string {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  isOralInterview(interviewType: string): boolean {
    return interviewType.toUpperCase().includes('ORAL');
  }

  readonly printing = signal(false);

  showQuestionsDialog = false;

  onOpenQuestionsDialog(): void {
    if (this.rawRecord) {
      this.selectedQuestionIds.set(this.rawRecord.selectedQuestionIds);
    }
    this.showQuestionsDialog = true;
  }

  onCancelQuestionsDialog(): void {
    if (this.rawRecord) {
      this.selectedQuestionIds.set(this.rawRecord.selectedQuestionIds);
    }
    this.showQuestionsDialog = false;
  }

  questionOptionsForSlot(index: number): { label: string; value: number }[] {
    const usedByOtherSlots = new Set(this.selectedQuestionIds().filter((_, i) => i !== index));
    return this.allQuestions()
      .filter((question) => !usedByOtherSlots.has(question.id))
      .map((question) => ({ label: question.text, value: question.id }));
  }

  questionDetailFor(id: number): QuestionPreview | undefined {
    return this.allQuestions().find((question) => question.id === id);
  }

  onReplaceQuestion(index: number, newId: number): void {
    this.selectedQuestionIds.update((ids) => ids.map((id, i) => (i === index ? newId : id)));
  }

  canEditQuestions(): boolean {
    return this.rawRecord?.questionTypeId != null;
  }

  onSaveQuestions(): void {
    const record = this.rawRecord;
    if (!record || record.questionTypeId == null) {
      return;
    }

    const payload: InterviewSetupPayload = {
      id: record.id,
      advertId: record.advertId,
      interviewTypeId: record.interviewTypeId,
      questionTypeId: record.questionTypeId,
      numberOfQuestions: record.numberOfQuestions,
      questionSelectionMode: 'MANUAL',
      selectedQuestionIds: this.selectedQuestionIds(),
      selectedInstructionIds: record.selectedInstructionIds ?? [],
      startDateTime: record.startDateTime,
      endDateTime: record.endDateTime,
      showResultToCandidate: record.showResultToCandidate,
      durationHours: record.durationHours,
      durationMinutes: record.durationMinutes,
      questionQuotas: null,
    };

    this.savingQuestions.set(true);
    this.questionBankApi
      .addInterviewSetup(payload)
      .pipe(finalize(() => this.savingQuestions.set(false)))
      .subscribe({
        next: (response) => {
          this.rawRecord = response.data ?? { ...record, ...payload, id: record.id };
          const detail = mapInterview(this.rawRecord);
          this.interview.set(detail);
          this.messageService.add({
            severity: 'success',
            summary: 'Questions Updated',
            detail: 'The selected questions were updated successfully.',
          });
          this.showQuestionsDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: 'Could not update the selected questions. Please try again later.',
          });
        },
      });
  }

  showPdfDialog = false;
  readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  private rawPdfUrl: string | null = null;

  onPrint(): void {
    this.printing.set(true);
    this.questionBankApi
      .getInterviewQuestionsBase64(this.id)
      .pipe(finalize(() => this.printing.set(false)))
      .subscribe({
        next: (base64) => {
          const byteCharacters = atob(base64);
          const byteArray = new Uint8Array([...byteCharacters].map((char) => char.charCodeAt(0)));
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          this.rawPdfUrl = window.URL.createObjectURL(blob);
          this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl));
          this.showPdfDialog = true;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Print Failed',
            detail: 'Could not generate the interview questions PDF. Please try again later.',
          });
        },
      });
  }

  onClosePdfDialog(): void {
    this.showPdfDialog = false;
    if (this.rawPdfUrl) {
      window.URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfUrl.set(null);
  }
}
