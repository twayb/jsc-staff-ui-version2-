import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewSession } from './interview-session';

describe('InterviewSession', () => {
  let component: InterviewSession;
  let fixture: ComponentFixture<InterviewSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewSession],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewSession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
