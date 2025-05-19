import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TechnicianService } from '../../Services/technician.service';
import { MaintenanceTopbarComponent } from '../TopBar/maintenance-topbar/maintenance-topbar.component';
@Component({
  selector: 'app-technician-requests',
  standalone: true,
  templateUrl: './technician-requests.component.html',
  styleUrls: ['./technician-requests.component.css'],
  imports: [CommonModule, HttpClientModule, FormsModule,MaintenanceTopbarComponent]
})
export class TechnicianRequestsComponent implements OnInit {
  private http = inject(HttpClient);
  private technicianService = inject(TechnicianService);

  technicianId = 0;
  requests = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  today = new Date().toISOString().split('T')[0];
  editedRequestIds = new Set<number>();

  searchQuery = signal<string>('');
  statusFilter = signal<string>('All');

  ngOnInit() {
    this.technicianService.currentTechnicianId$.subscribe(id => {
      if (id !== null) {
        this.technicianId = id;
        this.loadRequests();
      } else {
        this.loading.set(false);
        this.error.set('Technician ID not available.');
      }
    });
  }

  formatDateForInput(dateString: string | null): string {
    if (!dateString) return '';
    
    try {
      const dateObj = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00');
      return dateObj.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  }

  onDateChange(request: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    request.scheduled_date = input.value ? new Date(input.value).toISOString() : null;
    this.onFieldChange(request.id);
  }

  loadRequests() {
    this.loading.set(true);
    this.http.get<any[]>(`http://localhost:5000/api/technician/${this.technicianId}/requests`)
      .subscribe({
        next: data => {
          // Filter out rejected requests and format dates
          const filteredRequests = data
            .filter(req => req.status.toLowerCase() !== 'rejected') // Exclude rejected
            .map(req => ({
              ...req,
              scheduled_date: req.scheduled_date ? req.scheduled_date.split('T')[0] : null
            }));
          
          this.requests.set(filteredRequests);
          this.loading.set(false);
        },
        error: err => {
          console.error('Error loading requests', err);
          this.error.set('Failed to load requests.');
          this.loading.set(false);
        }
      });
  }

  filteredRequests = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.statusFilter();

    return this.requests().filter(request => {
      // Ensure we don't include rejected requests (though they should already be filtered)
      if (request.status.toLowerCase() === 'rejected') return false;

      const matchesSearch = request.problem_type.toLowerCase().includes(query) ||
                          request.description.toLowerCase().includes(query);
      const matchesStatus = status === 'All' || request.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.statusFilter.set(select.value);
  }

  onFieldChange(requestId: number) {
    this.editedRequestIds.add(requestId);
  }

  updateRequest(request: any) {
    if (!this.editedRequestIds.has(request.id)) {
      console.log('No changes detected for request:', request.id);
      alert('No changes detected');
      return;
    }
  
    this.http.patch(`http://localhost:5000/api/maintenance-requests/${request.id}`, {
      status: request.status,
      scheduled_date: request.scheduled_date
    }).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.editedRequestIds.delete(request.id);
        this.loadRequests(); // Refresh the list
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert(`Update failed: ${err.message}`);
      }
    });
  }
}