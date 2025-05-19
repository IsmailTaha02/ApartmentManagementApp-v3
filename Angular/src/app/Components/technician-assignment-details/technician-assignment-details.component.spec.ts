import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianAssignmentDetailsComponent } from './technician-assignment-details.component';

describe('TechnicianAssignmentDetailsComponent', () => {
  let component: TechnicianAssignmentDetailsComponent;
  let fixture: ComponentFixture<TechnicianAssignmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianAssignmentDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicianAssignmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
