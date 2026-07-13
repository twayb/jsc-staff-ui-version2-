import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateByVenue } from './candidate-by-venue';

describe('CandidateByVenue', () => {
  let component: CandidateByVenue;
  let fixture: ComponentFixture<CandidateByVenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateByVenue],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateByVenue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
