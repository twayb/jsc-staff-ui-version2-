import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { CountUp } from '../../shared/count-up.directive';
import {
  QuestionBankApiService,
  SchemeQuestionCountRecord,
} from '../../core/question-bank/question-bank-api.service';

interface CadreQuestionCount {
  schemeId: number;
  cadre: string;
  questions: number;
}

@Component({
  selector: 'app-question-list-by-cadre',
  imports: [AppBreadcrumb, AppDataTable, CountUp],
  templateUrl: './question-list-by-cadre.html',
  styleUrl: './question-list-by-cadre.css',
})
export class QuestionListByCadre implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly questionBankApi = inject(QuestionBankApiService);

  readonly schemeCategoryId = Number(this.route.snapshot.paramMap.get('schemeCategoryId'));

  readonly category = signal('');
  readonly cadres = signal<CadreQuestionCount[]>([]);

  readonly breadcrumbItems = computed<MenuItem[]>(() => [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Question List', routerLink: '/question-bank/questions' },
    { label: this.category() },
  ]);

  readonly loading = signal(true);

  readonly totalCadre = computed(() => this.cadres().length);
  readonly totalQuestions = computed(() => this.cadres().reduce((sum, c) => sum + c.questions, 0));

  ngOnInit(): void {
    this.loading.set(true);
    this.questionBankApi
      .getQuestionsGroupByScheme(this.schemeCategoryId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const records = response.data ?? [];
          this.category.set(records[0]?.schemeCategoryName ?? '');
          this.cadres.set(
            records.map((record: SchemeQuestionCountRecord) => ({
              schemeId: record.schemeId,
              cadre: record.schemeName,
              questions: record.total,
            })),
          );
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Cadres',
            detail: 'Could not load cadres for this category. Please try again later.',
          });
        },
      });
  }

  onView(cadre: CadreQuestionCount): void {
    this.router.navigate(['/question-bank/questions', this.schemeCategoryId, cadre.schemeId]);
  }
}
