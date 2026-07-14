import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankDashboard } from './question-bank-dashboard';

describe('QuestionBankDashboard', () => {
  let component: QuestionBankDashboard;
  let fixture: ComponentFixture<QuestionBankDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionBankDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionBankDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
