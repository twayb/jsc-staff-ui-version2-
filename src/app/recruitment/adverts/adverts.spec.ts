import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adverts } from './adverts';

describe('Adverts', () => {
  let component: Adverts;
  let fixture: ComponentFixture<Adverts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adverts],
    }).compileComponents();

    fixture = TestBed.createComponent(Adverts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
