import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortlistRemarks } from './shortlist-remarks';

describe('ShortlistRemarks', () => {
  let component: ShortlistRemarks;
  let fixture: ComponentFixture<ShortlistRemarks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortlistRemarks],
    }).compileComponents();

    fixture = TestBed.createComponent(ShortlistRemarks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
