import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { Menu } from 'primeng/menu';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { CountUp } from '../../shared/count-up.directive';

type QuestionType = 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Essay';
type QuestionStatus = 'Active' | 'Inactive';
type QuestionApproval = 'Pending' | 'Approved';

interface QuestionRow {
  question: string;
  type: QuestionType;
  status: QuestionStatus;
  approval: QuestionApproval;
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  modelAnswer?: string;
}

interface QuestionDraft {
  questionText: string;
  options: string[];
  correctOptionIndex: number | null;
  correctAnswer: string;
  modelAnswer: string;
}

@Component({
  selector: 'app-question-list-per-cadre',
  imports: [
    FormsModule,
    NgClass,
    Button,
    Dialog,
    Tag,
    Menu,
    InputText,
    Textarea,
    RadioButton,
    Select,
    AppBreadcrumb,
    AppDataTable,
    CountUp,
  ],
  templateUrl: './question-list-per-cadre.html',
  styleUrl: './question-list-per-cadre.css',
})
export class QuestionListPerCadre {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly category = this.route.snapshot.paramMap.get('category') ?? '';
  readonly cadre = this.route.snapshot.paramMap.get('cadre') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Question List', routerLink: '/question-bank/questions' },
    { label: this.category, routerLink: ['/question-bank/questions', this.category] },
    { label: this.cadre },
  ];

  readonly loading = signal(true);

  constructor() {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly trueFalseOptions = [
    { label: 'True', value: 'True' },
    { label: 'False', value: 'False' },
  ];

  questions: QuestionRow[] = [
    {
      question: 'What is the primary function of a firewall in network security?',
      type: 'Multiple Choice',
      status: 'Active',
      approval: 'Approved',
      options: [
        'To encrypt data during transmission',
        'To monitor and control incoming and outgoing network traffic',
        'To increase internet connection speed',
        'To provide backup power during outages',
      ],
      correctOptionIndex: 1,
    },
    {
      question: 'A database index always improves write performance.',
      type: 'True/False',
      status: 'Active',
      approval: 'Approved',
      correctAnswer: 'False',
    },
    {
      question: 'Explain the difference between TCP and UDP protocols.',
      type: 'Short Answer',
      status: 'Inactive',
      approval: 'Pending',
      modelAnswer:
        'TCP is connection-oriented and guarantees ordered delivery, while UDP is connectionless and faster but does not guarantee delivery.',
    },
    {
      question: 'Describe the process of normalizing a relational database, with examples.',
      type: 'Essay',
      status: 'Active',
      approval: 'Pending',
      modelAnswer:
        'Normalization organizes data to reduce redundancy, typically progressing through 1NF, 2NF, and 3NF, e.g. splitting a customer-orders table so repeating groups are moved into their own related table.',
    },
    {
      question: 'Which of the following best describes cloud elasticity?',
      type: 'Multiple Choice',
      status: 'Inactive',
      approval: 'Pending',
      options: [
        'The ability to run without internet access',
        'The ability to automatically scale resources based on demand',
        'A fixed allocation of server resources',
        'The physical location of data centers',
      ],
      correctOptionIndex: 1,
    },
    {
      question: 'HTTPS uses port 443 by default.',
      type: 'True/False',
      status: 'Active',
      approval: 'Pending',
      correctAnswer: 'True',
    },
    {
      question: 'What are the key responsibilities of a Database Administrator?',
      type: 'Short Answer',
      status: 'Active',
      approval: 'Approved',
      modelAnswer: 'Managing database security, performance tuning, backups, and ensuring data integrity.',
    },
    {
      question: 'Discuss the advantages and disadvantages of microservices architecture.',
      type: 'Essay',
      status: 'Inactive',
      approval: 'Pending',
      modelAnswer:
        'Advantages include independent scalability and deployability; disadvantages include increased operational complexity and network latency.',
    },
  ];

  selection: QuestionRow[] = [];

  get pendingCount(): number {
    return this.questions.filter((q) => q.approval === 'Pending').length;
  }

  get approvedCount(): number {
    return this.questions.filter((q) => q.approval === 'Approved').length;
  }

  get usedCount(): number {
    return this.questions.filter((q) => q.status === 'Active').length;
  }

  get unusedCount(): number {
    return this.questions.filter((q) => q.status === 'Inactive').length;
  }

  approvalSeverity(approval: QuestionApproval): 'success' | 'warn' {
    return approval === 'Approved' ? 'success' : 'warn';
  }

  statusSeverity(status: QuestionStatus): 'success' | 'secondary' {
    return status === 'Active' ? 'success' : 'secondary';
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  isSelected(question: QuestionRow): boolean {
    return this.selection.includes(question);
  }

  toggleSelection(question: QuestionRow): void {
    this.selection = this.isSelected(question)
      ? this.selection.filter((q) => q !== question)
      : [...this.selection, question];
  }

  isAllSelected(): boolean {
    return this.questions.length > 0 && this.selection.length === this.questions.length;
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selection = checked ? [...this.questions] : [];
  }

  onApproveSelected(): void {
    const count = this.selection.length;
    this.questions = this.questions.map((q) =>
      this.selection.includes(q) ? { ...q, approval: 'Approved' } : q,
    );
    this.selection = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Questions Approved',
      detail: `${count} question${count === 1 ? '' : 's'} approved successfully.`,
    });
  }

  onActivateSelected(): void {
    const count = this.selection.length;
    this.questions = this.questions.map((q) =>
      this.selection.includes(q) ? { ...q, status: 'Active' } : q,
    );
    this.selection = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Questions Activated',
      detail: `${count} question${count === 1 ? '' : 's'} activated successfully.`,
    });
  }

  onDeactivateSelected(): void {
    const count = this.selection.length;
    this.questions = this.questions.map((q) =>
      this.selection.includes(q) ? { ...q, status: 'Inactive' } : q,
    );
    this.selection = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Questions Deactivated',
      detail: `${count} question${count === 1 ? '' : 's'} deactivated successfully.`,
    });
  }

  showViewDialog = false;
  viewingQuestion: QuestionRow | null = null;
  editMode = false;
  draft: QuestionDraft = { questionText: '', options: [], correctOptionIndex: null, correctAnswer: '', modelAnswer: '' };

  actionMenuItems: MenuItem[] = [];

  openActionMenu(event: Event, question: QuestionRow, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(question) },
      ...(question.approval === 'Pending'
        ? [{ label: 'Approve', icon: 'pi pi-check', command: () => this.onApprove(question) }]
        : []),
      {
        label: question.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: question.status === 'Active' ? 'pi pi-ban' : 'pi pi-bolt',
        command: () => this.onToggleStatus(question),
      },
    ];
    menu.toggle(event);
  }

  onView(question: QuestionRow): void {
    this.viewingQuestion = question;
    this.editMode = false;
    this.showViewDialog = true;
  }

  onEdit(): void {
    const question = this.viewingQuestion;
    if (!question) return;

    this.draft = {
      questionText: question.question,
      options: [...(question.options ?? [])],
      correctOptionIndex: question.correctOptionIndex ?? null,
      correctAnswer: question.correctAnswer ?? '',
      modelAnswer: question.modelAnswer ?? '',
    };
    this.editMode = true;
  }

  onCancelEdit(): void {
    this.editMode = false;
  }

  onSaveEdit(): void {
    const target = this.viewingQuestion;
    if (!target) return;

    const updated: QuestionRow = {
      ...target,
      question: this.draft.questionText,
      options: target.type === 'Multiple Choice' ? this.draft.options : target.options,
      correctOptionIndex:
        target.type === 'Multiple Choice' ? (this.draft.correctOptionIndex ?? undefined) : target.correctOptionIndex,
      correctAnswer: target.type === 'True/False' ? this.draft.correctAnswer : target.correctAnswer,
      modelAnswer:
        target.type === 'Short Answer' || target.type === 'Essay' ? this.draft.modelAnswer : target.modelAnswer,
    };

    this.questions = this.questions.map((q) => (q === target ? updated : q));
    this.viewingQuestion = updated;
    this.editMode = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Question Updated',
      detail: 'The question was updated successfully.',
    });
  }

  onApproveInDialog(): void {
    const question = this.viewingQuestion;
    if (!question) return;

    this.onApprove(question);
    this.viewingQuestion = { ...question, approval: 'Approved' };
  }

  onApprove(question: QuestionRow): void {
    this.questions = this.questions.map((q) => (q === question ? { ...q, approval: 'Approved' } : q));
    this.messageService.add({
      severity: 'success',
      summary: 'Question Approved',
      detail: 'The question was approved successfully.',
    });
  }

  onToggleStatus(question: QuestionRow): void {
    const nextStatus: QuestionStatus = question.status === 'Active' ? 'Inactive' : 'Active';
    this.questions = this.questions.map((q) => (q === question ? { ...q, status: nextStatus } : q));
    this.messageService.add({
      severity: 'success',
      summary: nextStatus === 'Active' ? 'Question Activated' : 'Question Deactivated',
      detail: `The question was ${nextStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`,
    });
  }
}
