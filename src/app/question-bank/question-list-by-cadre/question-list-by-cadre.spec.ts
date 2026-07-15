import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionListByCadre } from './question-list-by-cadre';

describe('QuestionListByCadre', () => {
  let component: QuestionListByCadre;
  let fixture: ComponentFixture<QuestionListByCadre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListByCadre],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionListByCadre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
