import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRankComponent } from './doctor-rank.component';

describe('DoctorRankComponent', () => {
  let component: DoctorRankComponent;
  let fixture: ComponentFixture<DoctorRankComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorRankComponent]
    });
    fixture = TestBed.createComponent(DoctorRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
