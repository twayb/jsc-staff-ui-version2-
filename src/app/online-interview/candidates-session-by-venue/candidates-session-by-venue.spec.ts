import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesSessionByVenue } from './candidates-session-by-venue';

describe('CandidatesSessionByVenue', () => {
  let component: CandidatesSessionByVenue;
  let fixture: ComponentFixture<CandidatesSessionByVenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatesSessionByVenue],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatesSessionByVenue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
