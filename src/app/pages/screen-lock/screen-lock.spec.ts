import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenLock } from './screen-lock';

describe('ScreenLock', () => {
  let component: ScreenLock;
  let fixture: ComponentFixture<ScreenLock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenLock],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenLock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
