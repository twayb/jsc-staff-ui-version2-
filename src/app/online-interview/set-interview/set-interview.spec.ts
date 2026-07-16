import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetInterview } from './set-interview';

describe('SetInterview', () => {
  let component: SetInterview;
  let fixture: ComponentFixture<SetInterview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetInterview],
    }).compileComponents();

    fixture = TestBed.createComponent(SetInterview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
