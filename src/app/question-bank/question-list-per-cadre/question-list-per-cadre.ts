import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Menu } from 'primeng/menu';
import { NgClass } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { CountUp } from '../../shared/count-up.directive';
import { titleCase } from '../../core/utils';
import {
  AnswerOption,
  QuestionBankApiService,
  QuestionRecord,
  QuestionTypeRecord,
} from '../../core/question-bank/question-bank-api.service';

type QuestionStatus = 'ACTIVE' | 'INACTIVE';
type QuestionApproval = 'Pending' | 'Approved';
type KpiFilter = 'pending' | 'approved' | 'used' | 'unused' | null;

interface QuestionRow {
  id: number;
  question: string;
  type: string;
  status: QuestionStatus;
  approval: QuestionApproval;
  answerOptions: AnswerOption[];
  correctAnswer: string;
  expectedAnswer: string;
  questionLevel: string;
  pointAllocation: number;
}

@Component({
  selector: 'app-question-list-per-cadre',
  imports: [NgClass, Button, Dialog, Tag, Menu, AppBreadcrumb, AppDataTable, CountUp],
  templateUrl: './question-list-per-cadre.html',
  styleUrl: './question-list-per-cadre.css',
})
export class QuestionListPerCadre implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly category = this.route.snapshot.paramMap.get('schemeCategoryId') ?? '';
  readonly schemeId = Number(this.route.snapshot.paramMap.get('schemeId'));
  readonly cadre = (history.state as { cadreName?: string })?.cadreName ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Question List', routerLink: '/question-bank/questions' },
    { label: this.category, routerLink: ['/question-bank/questions', this.category] },
    { label: this.cadre },
  ];

  readonly loading = signal(true);

  private questionTypes: QuestionTypeRecord[] = [];
  readonly questions = signal<QuestionRow[]>([]);

  readonly pendingCount = computed(() => this.questions().filter((q) => q.approval === 'Pending').length);
  readonly approvedCount = computed(() => this.questions().filter((q) => q.approval === 'Approved').length);
  readonly usedCount = computed(() => this.questions().filter((q) => q.status === 'ACTIVE').length);
  readonly unusedCount = computed(() => this.questions().filter((q) => q.status === 'INACTIVE').length);

  readonly activeFilter = signal<KpiFilter>(null);

  readonly filteredQuestions = computed(() => {
    const filter = this.activeFilter();
    const all = this.questions();
    switch (filter) {
      case 'pending':
        return all.filter((q) => q.approval === 'Pending');
      case 'approved':
        return all.filter((q) => q.approval === 'Approved');
      case 'used':
        return all.filter((q) => q.status === 'ACTIVE');
      case 'unused':
        return all.filter((q) => q.status === 'INACTIVE');
      default:
        return all;
    }
  });

  toggleFilter(filter: KpiFilter): void {
    this.activeFilter.update((current) => (current === filter ? null : filter));
    this.selection = [];
  }

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      types: this.questionBankApi.getQuestionTypes(),
      questions: this.questionBankApi.getQuestionsByScheme(this.schemeId),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ types, questions }) => {
          this.questionTypes = types.data?.content ?? [];
          this.questions.set((questions.data?.content ?? []).map((record) => this.toRow(record)));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Questions',
            detail: 'Could not load questions for this cadre. Please try again later.',
          });
        },
      });
  }

  private toRow(record: QuestionRecord): QuestionRow {
    return {
      id: record.id,
      question: record.question.replace(/<[^>]*>/g, ''),
      type: this.questionTypes.find((type) => type.id === record.questionTypeId)?.name ?? '—',
      status: record.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      approval: record.state === 'APPROVED' ? 'Approved' : 'Pending',
      answerOptions: record.answerOptions ?? [],
      correctAnswer: record.correctAnswer,
      expectedAnswer: record.expectedAnswer,
      questionLevel: record.questionLevel,
      pointAllocation: record.pointAllocation,
    };
  }

  private reloadQuestions(): void {
    this.questionBankApi.getQuestionsByScheme(this.schemeId).subscribe({
      next: (response) => {
        this.questions.set((response.data?.content ?? []).map((record) => this.toRow(record)));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to Reload Questions',
          detail: 'Could not refresh the questions list. Please try again later.',
        });
      },
    });
  }

  isMultipleChoice(row: QuestionRow): boolean {
    return row.type === 'Multiple Choice';
  }

  isTrueFalse(row: QuestionRow): boolean {
    return row.type === 'True or False';
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  approvalSeverity(approval: QuestionApproval): 'success' | 'warn' {
    return approval === 'Approved' ? 'success' : 'warn';
  }

  statusSeverity(status: QuestionStatus): 'success' | 'secondary' {
    return status === 'ACTIVE' ? 'success' : 'secondary';
  }

  statusLabel(status: QuestionStatus): string {
    return titleCase(status);
  }

  selection: QuestionRow[] = [];

  isSelected(question: QuestionRow): boolean {
    return this.selection.includes(question);
  }

  toggleSelection(question: QuestionRow): void {
    this.selection = this.isSelected(question)
      ? this.selection.filter((q) => q !== question)
      : [...this.selection, question];
  }

  isAllSelected(): boolean {
    return this.filteredQuestions().length > 0 && this.selection.length === this.filteredQuestions().length;
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selection = checked ? [...this.filteredQuestions()] : [];
  }

  onApproveSelected(): void {
    const ids = this.selection.map((q) => q.id);
    if (ids.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Approve Selected Questions',
      message: `Are you sure you want to approve all ${ids.length} selected question${ids.length === 1 ? '' : 's'}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Approve', severity: 'success' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.questionBankApi.approveQuestions(ids).subscribe({
          next: () => {
            this.selection = [];
            this.reloadQuestions();
            this.messageService.add({
              severity: 'success',
              summary: 'Questions Approved',
              detail: `${ids.length} question${ids.length === 1 ? '' : 's'} approved successfully.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Approve Failed',
              detail: 'Could not approve the selected questions. Please try again later.',
            });
          },
        });
      },
    });
  }

  onActivateSelected(): void {
    this.bulkUpdateStatus('ACTIVE');
  }

  onDeactivateSelected(): void {
    this.bulkUpdateStatus('INACTIVE');
  }

  private bulkUpdateStatus(status: QuestionStatus): void {
    const ids = this.selection.map((q) => q.id);
    if (ids.length === 0) {
      return;
    }

    const verb = status === 'ACTIVE' ? 'activate' : 'deactivate';
    this.confirmationService.confirm({
      header: status === 'ACTIVE' ? 'Activate Selected Questions' : 'Deactivate Selected Questions',
      message: `Are you sure you want to ${verb} all ${ids.length} selected question${ids.length === 1 ? '' : 's'}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: status === 'ACTIVE' ? 'Activate' : 'Deactivate',
        severity: status === 'ACTIVE' ? 'info' : 'secondary',
      },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.questionBankApi.updateQuestionsStatus(ids, status).subscribe({
          next: () => {
            this.selection = [];
            this.reloadQuestions();
            this.messageService.add({
              severity: 'success',
              summary: status === 'ACTIVE' ? 'Questions Activated' : 'Questions Deactivated',
              detail: `${ids.length} question${ids.length === 1 ? '' : 's'} ${verb}d successfully.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Update Failed',
              detail: `Could not ${verb} the selected questions. Please try again later.`,
            });
          },
        });
      },
    });
  }

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, question: QuestionRow, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(question) },
      ...(question.approval === 'Pending'
        ? [{ label: 'Approve', icon: 'pi pi-check', command: () => this.onApprove(question) }]
        : []),
      {
        label: question.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
        icon: question.status === 'ACTIVE' ? 'pi pi-ban' : 'pi pi-bolt',
        command: () => this.onToggleStatus(question),
      },
    ];
    menu.toggle(event);
  }

  showViewDialog = false;
  viewingQuestion: QuestionRow | null = null;

  onView(question: QuestionRow): void {
    this.viewingQuestion = question;
    this.showViewDialog = true;
  }

  onApprove(question: QuestionRow): void {
    this.confirmationService.confirm({
      header: 'Approve Question',
      message: `Are you sure you want to approve "${question.question}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Approve', severity: 'success' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.questionBankApi.approveQuestion(question.id).subscribe({
          next: () => {
            this.reloadQuestions();
            this.messageService.add({
              severity: 'success',
              summary: 'Question Approved',
              detail: 'The question was approved successfully.',
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Approve Failed',
              detail: 'Could not approve the question. Please try again later.',
            });
          },
        });
      },
    });
  }

  onToggleStatus(question: QuestionRow): void {
    const nextStatus: QuestionStatus = question.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const verb = nextStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    this.confirmationService.confirm({
      header: nextStatus === 'ACTIVE' ? 'Activate Question' : 'Deactivate Question',
      message: `Are you sure you want to ${verb} "${question.question}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate', severity: nextStatus === 'ACTIVE' ? 'info' : 'secondary' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.questionBankApi.updateQuestionStatus(question.id, nextStatus).subscribe({
          next: () => {
            this.reloadQuestions();
            this.messageService.add({
              severity: 'success',
              summary: nextStatus === 'ACTIVE' ? 'Question Activated' : 'Question Deactivated',
              detail: `The question was ${verb}d successfully.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Update Failed',
              detail: `Could not ${verb} the question. Please try again later.`,
            });
          },
        });
      },
    });
  }
}
