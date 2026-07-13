import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryScale } from './salary-scale';

describe('SalaryScale', () => {
  let component: SalaryScale;
  let fixture: ComponentFixture<SalaryScale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryScale],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryScale);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
