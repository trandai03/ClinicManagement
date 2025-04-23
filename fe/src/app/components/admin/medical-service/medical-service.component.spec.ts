import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalServiceComponent } from './medical-service.component';

describe('MedicalServiceComponent', () => {
  let component: MedicalServiceComponent;
  let fixture: ComponentFixture<MedicalServiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MedicalServiceComponent]
    });
    fixture = TestBed.createComponent(MedicalServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
