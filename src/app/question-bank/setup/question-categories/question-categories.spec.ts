import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionCategories } from './question-categories';

describe('QuestionCategories', () => {
  let component: QuestionCategories;
  let fixture: ComponentFixture<QuestionCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
