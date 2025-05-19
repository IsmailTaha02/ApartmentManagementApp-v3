import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MaintenanceTopbarComponent } from '../TopBar/maintenance-topbar/maintenance-topbar.component';

export interface MaintenanceRequest {
  id: number;
  problemType?: string;
  description: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
  createdAt: string;
  apartmentNumber: string;
  priority: 'Low' | 'Medium' | 'High';
  images?: string[];
  response?: string;
  technician_id?: number;
}

@Component({
  selector: 'app-maintenance-center',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MaintenanceTopbarComponent
  ],
  templateUrl: './maintenance-center.component.html',
  styleUrls: ['./maintenance-center.component.css']
})
export class MaintenanceCenterComponent implements OnInit {
  userId = signal<string>('');
  maintenanceRequests = signal<MaintenanceRequest[]>([]);
  filteredRequests = signal<MaintenanceRequest[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Filter options
  statusFilter = signal<string>('All');
  priorityFilter = signal<string>('All');
  problemTypeFilter = signal<string>('All');

  // Available filter options
  statusOptions = ['All', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'];
  priorityOptions = ['All', 'Low', 'Medium', 'High'];
  problemTypeOptions = ['All', 'plumbing', 'electrical', 'hvac', 'appliance', 'general'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.userId.set(userId);
      this.fetchRequests();
    } else {
      this.error.set('Please login to view maintenance requests');
      this.loading.set(false);
      this.router.navigate(['/login']);
    }
  }

  fetchRequests(): void {
    this.loading.set(true);
    this.error.set('');
    
    this.http.get<any[]>(`http://localhost:5000/api/maintenance-requests?user_id=${this.userId()}`)
      .subscribe({
        next: (data) => {
          const safeData = data.map(request => ({
            ...request,
            apartmentNumber: request.apartment_id?.toString() || 'N/A',
            problemType: request.problem_type ?? 'general',
            createdAt: request.request_date ?? new Date().toISOString(),
            priority: request.priority ?? 'Medium',
            status: request.status ?? 'Pending'
          }));
          this.maintenanceRequests.set(safeData);
          this.applyFilters(); // Apply filters after fetching data
          this.loading.set(false);
        },
        error: (err) => {
          console.error('API error:', err);
          this.error.set(err.error?.message ?? 'Failed to load maintenance requests');
          this.loading.set(false);
        }
      });
  }

  applyFilters(): void {
    let filtered = this.maintenanceRequests();

    // Apply status filter
    if (this.statusFilter() !== 'All') {
      filtered = filtered.filter(request => request.status === this.statusFilter());
    }

    // Apply priority filter
    if (this.priorityFilter() !== 'All') {
      filtered = filtered.filter(request => request.priority === this.priorityFilter());
    }

    // Apply problem type filter
    if (this.problemTypeFilter() !== 'All') {
      filtered = filtered.filter(request => request.problemType?.toLowerCase() === this.problemTypeFilter().toLowerCase());
    }

    this.filteredRequests.set(filtered);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.statusFilter.set('All');
    this.priorityFilter.set('All');
    this.problemTypeFilter.set('All');
    this.applyFilters();
  }

  // ... (rest of your existing methods remain unchanged)
  viewRequestDetails(request: MaintenanceRequest): void {
    if (!request?.id) return;
    this.router.navigate(['/tenant-dashboard/maintenance-request', request.id], {
      state: { requestData: request }
    });
  }

  goToDetails(requestId: number): void {
    if (!requestId) return;
    this.router.navigate(['/tenant-dashboard/maintenance-request', requestId]);
  }

  getStatusClass(status?: string): string {
    if (!status) return 'status-unknown';
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getRequestIcon(problemType?: string): string {
    if (!problemType) return 'handyman';
    const iconMap: Record<string, string> = {
      'plumbing': 'plumbing',
      'electrical': 'electrical_services',
      'hvac': 'ac_unit',
      'appliance': 'kitchen',
      'general': 'handyman'
    };
    return iconMap[problemType.toLowerCase().trim()] ?? 'handyman';
  }

  goToNewRequest(): void {
    this.router.navigate(['/tenant-dashboard/maintenance-request']);
  }

  refreshRequests(): void {
    this.fetchRequests();
  }

  getPriorityClass(priority?: string): string {
    return priority?.toLowerCase() ?? 'medium';
  }
}