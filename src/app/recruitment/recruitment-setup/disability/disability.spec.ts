import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Disability } from './disability';

describe('Disability', () => {
  let component: Disability;
  let fixture: ComponentFixture<Disability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Disability],
    }).compileComponents();

    fixture = TestBed.createComponent(Disability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
