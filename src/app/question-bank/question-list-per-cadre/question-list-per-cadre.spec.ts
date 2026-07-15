import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionListPerCadre } from './question-list-per-cadre';

describe('QuestionListPerCadre', () => {
  let component: QuestionListPerCadre;
  let fixture: ComponentFixture<QuestionListPerCadre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListPerCadre],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionListPerCadre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
