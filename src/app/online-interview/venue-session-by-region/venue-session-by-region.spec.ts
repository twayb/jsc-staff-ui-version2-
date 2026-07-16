import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueSessionByRegion } from './venue-session-by-region';

describe('VenueSessionByRegion', () => {
  let component: VenueSessionByRegion;
  let fixture: ComponentFixture<VenueSessionByRegion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueSessionByRegion],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueSessionByRegion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
