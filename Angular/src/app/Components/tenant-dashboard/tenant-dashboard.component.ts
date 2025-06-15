import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

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
  tenantAvatar = signal<string>('icons/customer-icon.png'); // Default avatar

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('user_id');
    const storedUser = localStorage.getItem('currentUser');

    if (storedUserId) {
      this.userId.set(parseInt(storedUserId, 10));
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.tenantName.set(user.full_name || user.email || 'Tenant User');
      } catch (e) {
        console.error('Failed to parse currentUser from localStorage:', e);
      }  
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
    this.authService.logout();
  }
}