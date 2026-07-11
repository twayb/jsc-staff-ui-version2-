import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSection } from './service-section';

describe('ServiceSection', () => {
  let component: ServiceSection;
  let fixture: ComponentFixture<ServiceSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceSection],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
