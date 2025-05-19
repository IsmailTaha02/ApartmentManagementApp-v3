import { Component, OnInit, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaintenanceTopbarComponent } from "../TopBar/maintenance-topbar/maintenance-topbar.component";

interface MaintenanceRequest {
  id: number;
  apartment_id: number;
  description: string;
  problem_type: string;
  request_date: string;
  status: string;
  technician_id: number;
  user_id: number;
  user?: {
    name: string;
    phone: string;
  };
  priority?: string;
}

interface FilterOptions {
  problemType: string;
  priority: string;
  dateRange: string;
  searchTerm: string;
}

@Component({
  selector: 'app-technician-assignments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaintenanceTopbarComponent
],
  templateUrl: './technician-assignments.component.html',
  styleUrls: ['./technician-assignments.component.css']
})
export class TechnicianAssignmentsComponent implements OnInit {
  assignments = signal<MaintenanceRequest[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  technicianId = signal<string | null>(null);
  processingRequests = signal<number[]>([]);

  // Filter signals
  filters = signal<FilterOptions>({
    problemType: '',
    priority: '',
    dateRange: '',
    searchTerm: ''
  });

  private API_BASE_URL = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load saved filters from localStorage
    effect(() => {
      const savedFilters = localStorage.getItem('tech_assignments_filters');
      if (savedFilters) {
        this.filters.set(JSON.parse(savedFilters));
      }
    });

    // Save filters to localStorage when they change
    effect(() => {
      localStorage.setItem('tech_assignments_filters', JSON.stringify(this.filters()));
    });
  }

  ngOnInit() {
    this.checkAuthAndLoadData();
  }

  // Text truncation method
  truncateText(text: string, limit: number = 100): string {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  }

  // Filter status methods
  hasActiveFilters(): boolean {
    const currentFilters = this.filters();
    return (
      currentFilters.problemType !== '' ||
      currentFilters.priority !== '' ||
      currentFilters.dateRange !== '' ||
      currentFilters.searchTerm !== ''
    );
  }

  getDateRangeLabel(dateRange: string): string {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      default: return '';
    }
  }

  private checkAuthAndLoadData(): void {
    const storedUserId = localStorage.getItem('user_id');
    const storedRole = localStorage.getItem('role');
    
    if (!storedUserId || storedRole !== 'Technician') {
      this.error.set('Technician not logged in or unauthorized');
      this.loading.set(false);
      this.router.navigate(['/login']);
      return;
    }

    this.technicianId.set(storedUserId);
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<MaintenanceRequest[]>(
      `${this.API_BASE_URL}/technician/${this.technicianId()}/requests`
    ).subscribe({
      next: (data) => {
        const pendingRequests = data.filter(request => request.status === 'Pending');
        this.assignments.set(pendingRequests);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.error.set(err.status === 404 
          ? 'No assignments found' 
          : 'Failed to load assignments. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getCardClass(problemType: string): string {
    const classMap: Record<string, string> = {
      'Plumbing': 'plumbing-card',
      'Electrical': 'electrical-card',
      'HVAC': 'hvac-card',
      'default': 'default-card'
    };
    return classMap[problemType] || classMap['default'];
  }

  getIcon(problemType: string): string {
    const iconMap: Record<string, string> = {
      'Plumbing': 'fas fa-faucet',
      'Electrical': 'fas fa-bolt',
      'HVAC': 'fas fa-fan',
      'default': 'fas fa-tools'
    };
    return iconMap[problemType] || iconMap['default'];
  }

  isProcessing(requestId: number): boolean {
    return this.processingRequests().includes(requestId);
  }

  get filteredAssignments() {
    return this.assignments().filter(assignment => {
      const filters = this.filters();
      
      if (filters.problemType && assignment.problem_type !== filters.problemType) {
        return false;
      }
      
      if (filters.priority && assignment.priority !== filters.priority) {
        return false;
      }
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const matchesDescription = assignment.description.toLowerCase().includes(searchTerm);
        const matchesApartment = assignment.apartment_id.toString().includes(searchTerm);
        const matchesTenant = assignment.user?.name.toLowerCase().includes(searchTerm) || false;
        
        if (!matchesDescription && !matchesApartment && !matchesTenant) {
          return false;
        }
      }
      
      if (filters.dateRange) {
        const requestDate = new Date(assignment.request_date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filters.dateRange === 'today' && diffDays > 0) {
          return false;
        }
        if (filters.dateRange === 'week' && diffDays > 7) {
          return false;
        }
        if (filters.dateRange === 'month' && diffDays > 30) {
          return false;
        }
      }
      
      return true;
    });
  }

  get uniqueProblemTypes(): string[] {
    return [...new Set(this.assignments().map(a => a.problem_type))].sort();
  }

  get uniquePriorities(): string[] {
    const priorities = new Set<string>();
    this.assignments().forEach(a => {
      if (a.priority) priorities.add(a.priority);
    });
    return Array.from(priorities).sort();
  }

  updateFilter<K extends keyof FilterOptions>(key: K, value: FilterOptions[K]): void {
    this.filters.update(current => ({
      ...current,
      [key]: value
    }));
  }

  resetFilters(): void {
    this.filters.set({
      problemType: '',
      priority: '',
      dateRange: '',
      searchTerm: ''
    });
  }

  viewDetails(requestId: number): void {
    const technicianId = this.technicianId();
    if (technicianId) {
      this.router.navigate(['/technician', technicianId, 'assignment-details', requestId]);
    }
  }

  respondToRequest(requestId: number, response: 'Accepted' | 'Rejected', event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.processingRequests.update(requests => [...requests, requestId]);

    const newStatus = response === 'Accepted' ? 'In Progress' : 'Rejected';
    
    this.http.patch(
      `${this.API_BASE_URL}/maintenance-requests/${requestId}`,
      { status: newStatus }
    ).subscribe({
      next: () => {
        this.processingRequests.update(requests => 
          requests.filter(id => id !== requestId)
        );
        this.assignments.update(requests => 
          requests.filter(req => req.id !== requestId)
        );
      },
      error: (err) => {
        console.error('Error responding to request:', err);
        this.processingRequests.update(requests => 
          requests.filter(id => id !== requestId)
        );
        this.error.set('Failed to update request status. Please try again.');
      }
    });
  }

  trackByRequestId(index: number, request: MaintenanceRequest): number {
    return request.id;
  }
}