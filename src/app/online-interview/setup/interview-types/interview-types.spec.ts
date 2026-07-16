import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewTypes } from './interview-types';

describe('InterviewTypes', () => {
  let component: InterviewTypes;
  let fixture: ComponentFixture<InterviewTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
