import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabankByCadre } from './databank-by-cadre';

describe('DatabankByCadre', () => {
  let component: DatabankByCadre;
  let fixture: ComponentFixture<DatabankByCadre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabankByCadre],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabankByCadre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
