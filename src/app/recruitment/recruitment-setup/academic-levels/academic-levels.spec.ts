import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicLevels } from './academic-levels';

describe('AcademicLevels', () => {
  let component: AcademicLevels;
  let fixture: ComponentFixture<AcademicLevels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicLevels],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicLevels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
