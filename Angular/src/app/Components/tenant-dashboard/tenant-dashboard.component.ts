import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tenant-dashboard.component.html',
  styleUrls: ['./tenant-dashboard.component.css']
})
export class TenantDashboardComponent implements OnInit {
  userId = signal<number>(0);
  tenantName = signal<string>('Tenant User'); // Default name
  tenantAvatar = signal<string>('assets/images/default-avatar.png'); // Default avatar

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId.set(parseInt(storedUserId, 10));
    }

    // Load additional tenant data if needed
    this.loadTenantData();
  }

  private loadTenantData(): void {
    // You can implement data loading here if needed
    // Example: Fetch tenant details from API
  }

  navigateToMaintenanceCenter(): void {
    this.router.navigate(['/tenant-dashboard/maintenance-center']);
  }

  logout(): void {
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}