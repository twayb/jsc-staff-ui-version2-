import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributeByRegion } from './distribute-by-region';

describe('DistributeByRegion', () => {
  let component: DistributeByRegion;
  let fixture: ComponentFixture<DistributeByRegion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributeByRegion],
    }).compileComponents();

    fixture = TestBed.createComponent(DistributeByRegion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
