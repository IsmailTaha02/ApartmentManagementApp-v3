import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceTopbarComponent } from './maintenance-topbar.component';

describe('MaintenanceTopbarComponent', () => {
  let component: MaintenanceTopbarComponent;
  let fixture: ComponentFixture<MaintenanceTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceTopbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
