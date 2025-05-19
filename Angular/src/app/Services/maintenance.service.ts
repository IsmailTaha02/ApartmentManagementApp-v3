import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MaintenanceRequest } from '../models/maintenance-request.model';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiBaseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get requests by technician ID
  getRequestsByTechnician(id: number): Observable<MaintenanceRequest[]> {
    return this.http.get<MaintenanceRequest[]>(
      `${this.apiBaseUrl}/maintenance/technician/${id}/requests`
    ).pipe(
      catchError(err => {
        console.error('API Error:', err);
        return of([]); // Return empty array on error
      })
    );
  }

  // Update the status of a request
  updateRequestStatus(id: number, status: string): Observable<MaintenanceRequest> {
    return this.http.patch<MaintenanceRequest>(
      `${this.apiBaseUrl}/maintenance/requests/${id}/status`,
      { status }
    );
  }

  // Get request details by request ID
  getRequestById(requestId: string): Observable<MaintenanceRequest | null> {
    return this.http.get<MaintenanceRequest>(
      `${this.apiBaseUrl}/maintenance/requests/${requestId}`
    ).pipe(
      catchError(err => {
        console.error('Error fetching request details:', err);
        return of(null); // Return null on error
      })
    );
  }
}
