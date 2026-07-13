import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDetails } from './applicant-details';

describe('ApplicantDetails', () => {
  let component: ApplicantDetails;
  let fixture: ComponentFixture<ApplicantDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
