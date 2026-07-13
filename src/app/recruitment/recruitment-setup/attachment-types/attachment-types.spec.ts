import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentTypes } from './attachment-types';

describe('AttachmentTypes', () => {
  let component: AttachmentTypes;
  let fixture: ComponentFixture<AttachmentTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
