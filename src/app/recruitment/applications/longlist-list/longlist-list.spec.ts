import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LonglistList } from './longlist-list';

describe('LonglistList', () => {
  let component: LonglistList;
  let fixture: ComponentFixture<LonglistList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LonglistList],
    }).compileComponents();

    fixture = TestBed.createComponent(LonglistList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
