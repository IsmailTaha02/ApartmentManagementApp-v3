import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TechnicianService } from '../../Services/technician.service';
import { AuthService } from '../../Services/auth.service';
@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './technician-dashboard.component.html',
  styleUrls: ['./technician-dashboard.component.scss']
})
export class TechnicianDashboardComponent implements OnInit {
  // User Data
  currentUserRole = signal<string | null>(null);
  technicianId = signal<number | null>(null);
  technicianName = signal<string>('Loading...');
  technicianAvatar = signal<string>('icons/technician-icon.png');

  // Dashboard Stats
  totalRequests = signal<number>(0);
  pendingRequests = signal<number>(0);
  completedRequests = signal<number>(0);

  // UI State
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  constructor(
    private technicianService: TechnicianService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        this.currentUserRole.set(user.role);
        
        if (user.role === 'Technician') {
          this.technicianId.set(user.id);
          this.technicianName.set(user.full_name || 'Technician');
          this.technicianAvatar.set(user.avatar || this.technicianAvatar());
          this.loadDashboardStats();
        } else {
          this.router.navigate(['/access-denied']);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.handleError('Failed to load user data');
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  private loadDashboardStats(): void {
    const id = this.technicianId();
    if (!id) return;

    this.isLoading.set(true);
    this.technicianService.getTechnicianStats(id).subscribe({
      next: (stats) => {
        this.totalRequests.set(stats.total);
        this.pendingRequests.set(stats.pending);
        this.completedRequests.set(stats.completed);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.handleError('Failed to load dashboard statistics');
        this.isLoading.set(false);
      }
    });
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(null), 5000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home-page']);
  }

  refreshData(): void {
    this.errorMessage.set(null);
    this.loadDashboardStats();
  }
}