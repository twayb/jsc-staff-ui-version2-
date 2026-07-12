import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotShortlist } from './not-shortlist';

describe('NotShortlist', () => {
  let component: NotShortlist;
  let fixture: ComponentFixture<NotShortlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotShortlist],
    }).compileComponents();

    fixture = TestBed.createComponent(NotShortlist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
