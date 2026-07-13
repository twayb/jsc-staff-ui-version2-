import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueByRegion } from './venue-by-region';

describe('VenueByRegion', () => {
  let component: VenueByRegion;
  let fixture: ComponentFixture<VenueByRegion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueByRegion],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueByRegion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
