import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionByRegion } from './session-by-region';

describe('SessionByRegion', () => {
  let component: SessionByRegion;
  let fixture: ComponentFixture<SessionByRegion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionByRegion],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionByRegion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
