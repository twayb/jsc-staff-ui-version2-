import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantAssigned } from './applicant-assigned';

describe('ApplicantAssigned', () => {
  let component: ApplicantAssigned;
  let fixture: ComponentFixture<ApplicantAssigned>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantAssigned],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantAssigned);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
