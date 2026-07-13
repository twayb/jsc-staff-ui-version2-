import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cadre } from './cadre';

describe('Cadre', () => {
  let component: Cadre;
  let fixture: ComponentFixture<Cadre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadre],
    }).compileComponents();

    fixture = TestBed.createComponent(Cadre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
