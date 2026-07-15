import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { QuestionDataService } from '../question-data.service';

@Component({
  selector: 'app-question-list',
  imports: [RouterLink, AppBreadcrumb, AppSkeleton, CountUp],
  templateUrl: './question-list.html',
  styleUrl: './question-list.css',
})
export class QuestionList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly questionData = inject(QuestionDataService);

  @ViewChild('scrollArea') scrollAreaRef?: ElementRef<HTMLElement>;

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Question List' },
  ];

  readonly loading = signal(true);
  readonly hasOverflow = signal(false);

  ngOnInit(): void {
    setTimeout(() => {
      this.loading.set(false);
      setTimeout(() => this.checkOverflow());
    }, 800);

    const onResize = () => this.checkOverflow();
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  private checkOverflow(): void {
    const el = this.scrollAreaRef?.nativeElement;
    this.hasOverflow.set(!!el && el.scrollHeight > el.clientHeight);
  }

  readonly categoryIcon = this.questionData.categoryIcon;
  readonly categoryStats = this.questionData.categoryStats;

  get totalQuestions(): number {
    return this.questionData.totalQuestions;
  }
}
