import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabankList } from './databank-list';

describe('DatabankList', () => {
  let component: DatabankList;
  let fixture: ComponentFixture<DatabankList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabankList],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabankList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
