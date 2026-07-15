import { Injectable } from '@angular/core';

export interface QuestionCategoryStat {
  category: string;
  totalQuestions: number;
}

export interface CadreQuestionCount {
  cadre: string;
  questions: number;
}

const CATEGORY_STATS: QuestionCategoryStat[] = [
  { category: 'Information Communication and Technology', totalQuestions: 128 },
  { category: 'Public Administration and Governance', totalQuestions: 342 },
  { category: 'Accounting and Finance', totalQuestions: 96 },
  { category: 'Human Resource Management', totalQuestions: 64 },
  { category: 'Communication and Journalism', totalQuestions: 58 },
  { category: 'Records Management', totalQuestions: 73 },
  { category: 'Security', totalQuestions: 47 },
  { category: 'Office Assistant', totalQuestions: 39 },
  { category: 'Driving', totalQuestions: 22 },
  { category: 'Cook', totalQuestions: 18 },
  { category: 'Secretarial Studies', totalQuestions: 41 },
  { category: 'Procurement and Supply Management', totalQuestions: 66 },
  { category: 'Full Technician', totalQuestions: 29 },
  { category: 'Statistics', totalQuestions: 53 },
  { category: 'Economics', totalQuestions: 61 },
  { category: 'Library and Information Management', totalQuestions: 34 },
  { category: 'Transport and Logistics Management', totalQuestions: 45 },
  { category: 'Environmental Studies', totalQuestions: 37 },
  { category: 'Civil Engineering', totalQuestions: 52 },
];

const CADRE_NAMES = ['Afisa TEHAMA - Usimamizi wa Data za Kieletroniki (Database Administration) Daraja II', 'Afisa TEHAMA - Usimamizi wa Data za Kieletroniki (Database Administration) Daraja II'];
const DISTRIBUTION = [0.3, 0.22, 0.18, 0.14, 0.1, 0.06];

@Injectable({ providedIn: 'root' })
export class QuestionDataService {
  readonly categoryIcon = 'pi-book';
  readonly categoryStats = CATEGORY_STATS;

  get totalQuestions(): number {
    return CATEGORY_STATS.reduce((sum, c) => sum + c.totalQuestions, 0);
  }

  getCategory(category: string): QuestionCategoryStat | undefined {
    return CATEGORY_STATS.find((c) => c.category === category);
  }

  getCadreBreakdown(category: string): CadreQuestionCount[] {
    const total = this.getCategory(category)?.totalQuestions ?? 0;

    const rows = CADRE_NAMES.map((cadre, i) => ({
      cadre,
      questions: Math.round(total * DISTRIBUTION[i]),
    }));

    const sum = rows.reduce((s, r) => s + r.questions, 0);
    rows[rows.length - 1].questions += total - sum;

    return rows;
  }
}
