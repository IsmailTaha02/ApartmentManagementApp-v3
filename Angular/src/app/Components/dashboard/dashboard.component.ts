import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardTopbarComponent } from '../TopBar/dashboard-topbar/dashboard-topbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, DashboardTopbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  currentUser: any;

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  goToMaintenance() {
    if (!this.currentUser) return;

    if (this.currentUser.role === 'Technician') {
      this.router.navigate([`/technician/${this.currentUser.id}/requests`]);
    } else if (
      this.currentUser.role === 'Buyer/Tenant' ||
      this.currentUser.role === 'Tenant'
    ) {
      this.router.navigate(['/maintenance-request']);
    } else {
      console.warn('User role not recognized. Staying on dashboard.');
    }
  }
}
