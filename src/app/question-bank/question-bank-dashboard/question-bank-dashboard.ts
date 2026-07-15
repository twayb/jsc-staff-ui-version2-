import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { QuestionDataService } from '../question-data.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

@Component({
  selector: 'app-question-bank-dashboard',
  imports: [RouterLink, AppSkeleton, CountUp],
  templateUrl: './question-bank-dashboard.html',
  styleUrl: './question-bank-dashboard.css',
})
export class QuestionBankDashboard implements OnInit {
  private readonly questionData = inject(QuestionDataService);

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly categoryIcon = this.questionData.categoryIcon;

  readonly topCategories = computed(() =>
    [...this.questionData.categoryStats].sort((a, b) => b.totalQuestions - a.totalQuestions).slice(0, 6),
  );

  readonly stats: Stat[] = [
    {
      label: 'Total Questions',
      value: this.questionData.totalQuestions,
      icon: 'pi-book',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/question-bank/questions',
    },
    {
      label: 'Total Categories',
      value: this.questionData.categoryStats.length,
      icon: 'pi-tags',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/question-bank/setup/question-categories',
    },
    {
      label: 'Total Question Types',
      value: 4,
      icon: 'pi-list-check',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: '/question-bank/setup/question-types',
    },
    {
      label: 'Pending Approval',
      value: 12,
      icon: 'pi-clock',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: null,
    },
  ];
}
