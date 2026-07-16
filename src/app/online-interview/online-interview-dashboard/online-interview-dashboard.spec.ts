import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineInterviewDashboard } from './online-interview-dashboard';

describe('OnlineInterviewDashboard', () => {
  let component: OnlineInterviewDashboard;
  let fixture: ComponentFixture<OnlineInterviewDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineInterviewDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineInterviewDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
