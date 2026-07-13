import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewListByCadre } from './interview-list-by-cadre';

describe('InterviewListByCadre', () => {
  let component: InterviewListByCadre;
  let fixture: ComponentFixture<InterviewListByCadre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewListByCadre],
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewListByCadre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
