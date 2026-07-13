import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramCategories } from './program-categories';

describe('ProgramCategories', () => {
  let component: ProgramCategories;
  let fixture: ComponentFixture<ProgramCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
