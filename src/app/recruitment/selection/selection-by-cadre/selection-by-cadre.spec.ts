import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionByCadre } from './selection-by-cadre';

describe('SelectionByCadre', () => {
  let component: SelectionByCadre;
  let fixture: ComponentFixture<SelectionByCadre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionByCadre],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionByCadre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
