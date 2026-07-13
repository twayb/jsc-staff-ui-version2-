import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputerSkills } from './computer-skills';

describe('ComputerSkills', () => {
  let component: ComputerSkills;
  let fixture: ComponentFixture<ComputerSkills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComputerSkills],
    }).compileComponents();

    fixture = TestBed.createComponent(ComputerSkills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
