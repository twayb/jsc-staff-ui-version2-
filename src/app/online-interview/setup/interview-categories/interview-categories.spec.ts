import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewCategories } from './interview-categories';

describe('InterviewCategories', () => {
  let component: InterviewCategories;
  let fixture: ComponentFixture<InterviewCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
