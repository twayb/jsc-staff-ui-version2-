import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LonglistDistribution } from './longlist-distribution';

describe('LonglistDistribution', () => {
  let component: LonglistDistribution;
  let fixture: ComponentFixture<LonglistDistribution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LonglistDistribution],
    }).compileComponents();

    fixture = TestBed.createComponent(LonglistDistribution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
