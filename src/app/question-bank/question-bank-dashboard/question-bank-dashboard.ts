import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { QuestionBankApiService, SchemeCategoryStatRecord } from '../../core/question-bank/question-bank-api.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

interface CategoryStat {
  id: number;
  category: string;
  totalQuestions: number;
}

function mapCategoryStat(record: SchemeCategoryStatRecord): CategoryStat {
  return { id: record.schemeCategoryId, category: record.schemeCategoryName, totalQuestions: record.total };
}

@Component({
  selector: 'app-question-bank-dashboard',
  imports: [RouterLink, AppSkeleton, CountUp],
  templateUrl: './question-bank-dashboard.html',
  styleUrl: './question-bank-dashboard.css',
})
export class QuestionBankDashboard implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly loading = signal(true);
  readonly categoryIcon = 'pi-book';

  private readonly categoryStats = signal<CategoryStat[]>([]);
  private readonly questionTypeCount = signal(0);
  private readonly questionCategoryCount = signal(0);

  readonly totalQuestions = computed(() =>
    this.categoryStats().reduce((sum, stat) => sum + stat.totalQuestions, 0),
  );

  readonly topCategories = computed(() =>
    [...this.categoryStats()].sort((a, b) => b.totalQuestions - a.totalQuestions).slice(0, 6),
  );

  readonly stats = computed<Stat[]>(() => [
    {
      label: 'Total Questions',
      value: this.totalQuestions(),
      icon: 'pi-book',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/question-bank/questions',
    },
    {
      label: 'Scheme Categories',
      value: this.categoryStats().length,
      icon: 'pi-tags',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/question-bank/questions',
    },
    {
      label: 'Question Types',
      value: this.questionTypeCount(),
      icon: 'pi-list-check',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: '/question-bank/setup/question-types',
    },
    {
      label: 'Question Categories',
      value: this.questionCategoryCount(),
      icon: 'pi-sitemap',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: '/question-bank/setup/question-categories',
    },
  ]);

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      categories: this.questionBankApi.getQuestionsBySchemeCategory(),
      types: this.questionBankApi.getQuestionTypes(),
      questionCategories: this.questionBankApi.getQuestionCategories(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ categories, types, questionCategories }) => {
          this.categoryStats.set((categories.data ?? []).map(mapCategoryStat));
          this.questionTypeCount.set(types.data?.page.totalElements ?? 0);
          this.questionCategoryCount.set(questionCategories.data?.page.totalElements ?? 0);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Dashboard',
            detail: 'Could not load question bank statistics. Please try again later.',
          });
        },
      });
  }
}
