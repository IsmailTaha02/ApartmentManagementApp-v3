import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

type MaintenanceRequestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected' | 'Resolved' | 'Cancelled';
type ResponseAction = 'Accepted' | 'Rejected';

interface User {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

interface Apartment {
  id: number;
  unit_number: string;
}

interface MaintenanceRequest {
  id: number;
  problem_type: string;
  description: string;
  request_date: string;
  status: MaintenanceRequestStatus;
  apartment_id: number;
  user?: User;
  technician?: User;
  apartment?: Apartment;
  priority?: 'Low' | 'Medium' | 'High';
  notes?: string;
  images?: string[];
  response?: string;
  scheduled_date?: string;
}

@Component({
  selector: 'app-technician-assignment-details',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './technician-assignment-details.component.html',
  styleUrls: ['./technician-assignment-details.component.css']
})
export class TechnicianAssignmentDetailsComponent implements OnInit {
  private readonly API_BASE_URL = 'http://localhost:5000/api';
  
  assignment = signal<MaintenanceRequest | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  newNote = signal('');

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.loadAssignmentDetails(requestId);
    } else {
      this.error.set('Invalid request ID');
      this.loading.set(false);
      setTimeout(() => this.router.navigate(['/technician-dashboard/assignments']), 2000);
    }
  }

  loadAssignmentDetails(requestId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<MaintenanceRequest>(
      `${this.API_BASE_URL}/maintenance-requests/${requestId}`
    ).subscribe({
      next: (data) => {
        this.assignment.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading assignment details', err);
        this.error.set(err.error?.message || 'Failed to load assignment details');
        this.loading.set(false);
      }
    });
  }

  getIcon(problemType: string | undefined): string {
    if (!problemType) return 'fas fa-wrench';
    
    const iconMap: Record<string, string> = {
      'Electrical': 'fas fa-bolt',
      'Plumbing': 'fas fa-faucet',
      'HVAC': 'fas fa-fan',
      'General': 'fas fa-tools'
    };
    return iconMap[problemType] || 'fas fa-wrench';
  }

  getHeaderClass(problemType: string | undefined): string {
    if (!problemType) return 'default-header';
    
    const classMap: Record<string, string> = {
      'Plumbing': 'plumbing-header',
      'Electrical': 'electrical-header',
      'HVAC': 'hvac-header',
      'General': 'general-header'
    };
    return classMap[problemType] || 'default-header';
  }

  respondToRequest(requestId: number | undefined, response: ResponseAction, event: Event): void {
    if (!requestId) return;
    
    event.stopPropagation();
    const newStatus = response === 'Accepted' ? 'In Progress' : 'Rejected';
    
    this.http.patch(
      `${this.API_BASE_URL}/maintenance-requests/${requestId}`,
      { status: newStatus }
    ).subscribe({
      next: () => {
        this.assignment.update(a => a ? {...a, status: newStatus} : null);
        setTimeout(() => this.router.navigate(['/technician-dashboard/assignments']), 1500);
      },
      error: (err) => {
        console.error('Error responding to request', err);
        this.error.set('Failed to update request status. Please try again.');
      }
    });
  }

  addNote(): void {
    const assignment = this.assignment();
    if (!assignment || !this.newNote()) return;

    const notes = assignment.notes 
      ? `${assignment.notes}\n${new Date().toLocaleString()}: ${this.newNote()}`
      : `${new Date().toLocaleString()}: ${this.newNote()}`;

    this.http.patch(
      `${this.API_BASE_URL}/maintenance-requests/${assignment.id}`,
      { notes }
    ).subscribe({
      next: () => {
        this.assignment.update(a => a ? {...a, notes} : null);
        this.newNote.set('');
      },
      error: (err) => {
        console.error('Error adding note', err);
        this.error.set('Failed to add note');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/technician-dashboard/assignments']);
  }
}