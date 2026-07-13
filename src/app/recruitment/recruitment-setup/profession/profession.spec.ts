import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profession } from './profession';

describe('Profession', () => {
  let component: Profession;
  let fixture: ComponentFixture<Profession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profession],
    }).compileComponents();

    fixture = TestBed.createComponent(Profession);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
