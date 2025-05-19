import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, DatePipe } from '@angular/common';

export interface MaintenanceRequest {
  id: string;
  problemType: string;
  status: string;
  createdAt: string;
  apartmentNumber: string;
  priority: string;
  description: string;
  response?: string;
  technician_id?: string;
}

@Component({
  selector: 'app-maintenance-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './maintenance-request-detail.component.html',
  styleUrls: ['./maintenance-request-detail.component.css'],
  providers: [DatePipe]
})
export class MaintenanceRequestDetailComponent implements OnInit {
  request: MaintenanceRequest | null = null;
  statusClass: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const requestData = navigation?.extras.state?.['requestData'];

    if (requestData) {
      this.processRequestData(requestData);
    } else {
      const requestId = this.route.snapshot.paramMap.get('id');
      if (requestId) {
        this.fetchRequest(requestId);
      } else {
        this.router.navigate(['/maintenance-center']);
      }
    }
  }

  private processRequestData(data: any): void {
    this.request = {
      id: data.id?.toString() || '',
      problemType: data.problem_type || data.problemType || 'general',
      status: data.status || 'pending',
      createdAt: data.request_date || data.createdAt || new Date().toISOString(),
      apartmentNumber: data.apartment_id?.toString() || data.apartmentNumber || 'N/A',
      priority: data.priority || 'medium',
      description: data.description || '',
      response: data.response || '',
      technician_id: data.technician_id?.toString() || ''
    };
    this.statusClass = this.getStatusClass(this.request.status);
    this.isLoading = false;
  }

  private fetchRequest(id: string): void {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:5000/api/maintenance-requests/${id}`)
      .subscribe({
        next: (data) => {
          this.processRequestData(data);
        },
        error: (err) => {
          console.error('Error fetching request:', err);
          this.isLoading = false;
          // Fallback to mock data if API fails
          this.request = {
            id: id,
            problemType: 'general',
            status: 'pending',
            createdAt: new Date().toISOString(),
            apartmentNumber: 'N/A',
            priority: 'medium',
            description: 'Failed to load description',
            response: '',
            technician_id: ''
          };
          this.statusClass = this.getStatusClass(this.request.status);
        }
      });
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getRequestIcon(problemType: string): string {
    const normalizedType = problemType?.toLowerCase().trim() || 'general';
    const iconMap: Record<string, string> = {
      'plumbing': 'plumbing',
      'electrical': 'electrical_services',
      'hvac': 'ac_unit',
      'appliance': 'kitchen',
      'general': 'handyman'
    };
    return iconMap[normalizedType] || 'handyman';
  }

  formatDate(dateString: string | undefined): string {
    return dateString ? this.datePipe.transform(dateString, 'medium') || 'Unknown date' : 'Unknown date';
  }

  goBack(): void {
    this.router.navigate(['/maintenance-center']);
  }
}