import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewVenues } from './interview-venues';

describe('InterviewVenues', () => {
  let component: InterviewVenues;
  let fixture: ComponentFixture<InterviewVenues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewVenues],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewVenues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
