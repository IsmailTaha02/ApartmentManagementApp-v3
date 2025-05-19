import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceRequestService {
  private apiUrl = 'http://localhost:3000/api/requests'; // Adjust to your actual API endpoint

  constructor(private http: HttpClient) {}

  getRequestDetails(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}