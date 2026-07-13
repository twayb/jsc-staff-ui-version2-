import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Panelists } from './panelists';

describe('Panelists', () => {
  let component: Panelists;
  let fixture: ComponentFixture<Panelists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Panelists],
    }).compileComponents();

    fixture = TestBed.createComponent(Panelists);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
