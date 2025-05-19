import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Represents technician statistics EXCLUDING rejected requests
 */
interface TechnicianStats {
  total: number;      // Total active requests (pending + completed, excluding rejected)
  pending: number;    // Requests in 'pending' status
  completed: number;  // Requests in 'completed' status
  // Note: Rejected requests are explicitly excluded from all counts
}

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  private currentTechnicianId = new BehaviorSubject<number | null>(null);
  currentTechnicianId$ = this.currentTechnicianId.asObservable();

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * Sets the currently logged-in technician ID
   * @param id - Technician ID
   */
  setTechnicianId(id: number): void {
    this.currentTechnicianId.next(id);
  }

  /**
   * Fetches technician statistics (EXCLUDING rejected requests)
   * @param technicianId - ID of the technician
   * @returns Observable with stats data
   */
  getTechnicianStats(technicianId: number): Observable<TechnicianStats> {
    return this.http.get<TechnicianStats>(
      `${this.apiUrl}/technician/${technicianId}/stats`,
      { params: { exclude_rejected: 'true' } }  // Explicitly tell backend to exclude rejected
    );
  }
}