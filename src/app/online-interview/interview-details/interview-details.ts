import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import {
  InterviewQuestionItem,
  InterviewTypeSeverity,
  OnlineInterviewDataService,
} from '../online-interview-data.service';

@Component({
  selector: 'app-interview-details',
  imports: [FormsModule, Tag, Dialog, Select, Button, Skeleton, AppBreadcrumb],
  templateUrl: './interview-details.html',
  styleUrl: './interview-details.css',
})
export class InterviewDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly interviewData = inject(OnlineInterviewDataService);

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  readonly interview = this.interviewData.interviewSets.find((item) => item.id === this.id);

  readonly loading = signal(true);
  readonly skeletonFields = Array.from({ length: 6 });

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Online Interview', routerLink: '/online-interview' },
    { label: 'Interview List', routerLink: '/online-interview/interview-list' },
    { label: this.interview?.title ?? 'Interview' },
  ];

  showQuestionsDialog = false;
  private pendingQuestionIds: string[] = [];

  selectedQuestions(): InterviewQuestionItem[] {
    return this.interviewData.getQuestionsByIds(this.pendingQuestionIds);
  }

  replacementOptions(currentId: string): { label: string; value: string }[] {
    if (!this.interview) {
      return [];
    }

    return this.interviewData
      .getQuestionsForCadre(this.interview.cadre)
      .filter((question) => question.id === currentId || !this.pendingQuestionIds.includes(question.id))
      .map((question) => ({ label: question.text, value: question.id }));
  }

  interviewTypeSeverity(interviewType: string): InterviewTypeSeverity {
    return this.interviewData.interviewTypeSeverity(interviewType);
  }

  formatDuration(minutes: number): string {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  onOpenQuestionsDialog(): void {
    this.pendingQuestionIds = [...(this.interview?.questionIds ?? [])];
    this.showQuestionsDialog = true;
  }

  onReplaceQuestion(oldId: string, newId: string): void {
    if (!newId || newId === oldId) {
      return;
    }

    this.pendingQuestionIds = this.pendingQuestionIds.map((id) => (id === oldId ? newId : id));
  }

  onUpdateQuestions(): void {
    if (!this.interview) {
      return;
    }

    this.interview.questionIds = [...this.pendingQuestionIds];
    this.showQuestionsDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Questions Updated',
      detail: 'The interview questions were updated successfully.',
    });
  }

  onPrint(): void {
    window.print();
  }
}
