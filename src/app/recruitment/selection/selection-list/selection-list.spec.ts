import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionList } from './selection-list';

describe('SelectionList', () => {
  let component: SelectionList;
  let fixture: ComponentFixture<SelectionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionList],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
