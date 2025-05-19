import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceRequestDetailComponent } from './maintenance-request-detail.component';

describe('MaintenanceRequestDetailComponent', () => {
  let component: MaintenanceRequestDetailComponent;
  let fixture: ComponentFixture<MaintenanceRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceRequestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
