import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuestion } from './add-question';

describe('AddQuestion', () => {
  let component: AddQuestion;
  let fixture: ComponentFixture<AddQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(AddQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
