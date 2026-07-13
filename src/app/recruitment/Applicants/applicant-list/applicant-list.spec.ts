import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantList } from './applicant-list';

describe('ApplicantList', () => {
  let component: ApplicantList;
  let fixture: ComponentFixture<ApplicantList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantList],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
