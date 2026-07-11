import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Permits } from './permits';

describe('Permits', () => {
  let component: Permits;
  let fixture: ComponentFixture<Permits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Permits],
    }).compileComponents();

    fixture = TestBed.createComponent(Permits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
