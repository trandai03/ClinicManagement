import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajorDetailComponent } from './major-detail.component';

describe('MajorDetailComponent', () => {
  let component: MajorDetailComponent;
  let fixture: ComponentFixture<MajorDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MajorDetailComponent]
    });
    fixture = TestBed.createComponent(MajorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
