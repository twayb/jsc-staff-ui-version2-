import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { CountUp } from '../../shared/count-up.directive';
import { CadreQuestionCount, QuestionDataService } from '../question-data.service';

@Component({
  selector: 'app-question-list-by-cadre',
  imports: [AppBreadcrumb, AppDataTable, CountUp],
  templateUrl: './question-list-by-cadre.html',
  styleUrl: './question-list-by-cadre.css',
})
export class QuestionListByCadre {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly questionData = inject(QuestionDataService);

  readonly category = this.route.snapshot.paramMap.get('category') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Question Bank', routerLink: '/question-bank' },
    { label: 'Question List', routerLink: '/question-bank/questions' },
    { label: this.category },
  ];

  readonly loading = signal(true);

  constructor() {
    setTimeout(() => this.loading.set(false), 800);
  }

  readonly cadres: CadreQuestionCount[] = this.questionData.getCadreBreakdown(this.category);

  get totalCadre(): number {
    return this.cadres.length;
  }

  get totalQuestions(): number {
    return this.cadres.reduce((sum, c) => sum + c.questions, 0);
  }

  onView(cadre: CadreQuestionCount): void {
    this.router.navigate(['/question-bank/questions', this.category, cadre.cadre]);
  }
}
