import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTypes } from './question-types';

describe('QuestionTypes', () => {
  let component: QuestionTypes;
  let fixture: ComponentFixture<QuestionTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
