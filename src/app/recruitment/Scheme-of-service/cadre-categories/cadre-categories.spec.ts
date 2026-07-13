import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadreCategories } from './cadre-categories';

describe('CadreCategories', () => {
  let component: CadreCategories;
  let fixture: ComponentFixture<CadreCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadreCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(CadreCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
