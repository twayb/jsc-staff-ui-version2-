import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewSesssionByVenue } from './interview-sesssion-by-venue';

describe('InterviewSesssionByVenue', () => {
  let component: InterviewSesssionByVenue;
  let fixture: ComponentFixture<InterviewSesssionByVenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewSesssionByVenue],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewSesssionByVenue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
