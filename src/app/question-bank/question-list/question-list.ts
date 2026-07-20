import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { QuestionBankApiService, SchemeCategoryStatRecord } from '../../core/question-bank/question-bank-api.service';

interface QuestionCategoryStat {
  id: number;
  category: string;
  totalQuestions: number;
}

function mapCategoryStat(record: SchemeCategoryStatRecord): QuestionCategoryStat {
  return {
    id: record.schemeCategoryId,
    category: record.schemeCategoryName,
    totalQuestions: record.total,
  };
}

@Component({
  selector: 'app-question-list',
  imports: [RouterLink, AppBreadcrumb, AppSkeleton, CountUp],
  templateUrl: './question-list.html',
  styleUrl: './question-list.css',
})
export class QuestionList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  @ViewChild('scrollArea') scrollAreaRef?: ElementRef<HTMLElement>;

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Question List' },
  ];

  readonly loading = signal(true);
  readonly hasOverflow = signal(false);
  readonly categoryIcon = 'pi-book';
  readonly categoryStats = signal<QuestionCategoryStat[]>([]);

  readonly totalQuestions = computed(() =>
    this.categoryStats().reduce((sum, stat) => sum + stat.totalQuestions, 0),
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getQuestionsBySchemeCategory()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.categoryStats.set((response.data ?? []).map(mapCategoryStat));
          setTimeout(() => this.checkOverflow());
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Categories',
            detail: 'Could not load question categories. Please try again later.',
          });
        },
      });

    const onResize = () => this.checkOverflow();
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  private checkOverflow(): void {
    const el = this.scrollAreaRef?.nativeElement;
    this.hasOverflow.set(!!el && el.scrollHeight > el.clientHeight);
  }
}
