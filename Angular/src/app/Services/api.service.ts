import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';


// ✅ Define an interface (Optional, but improves Type Safety)
interface Apartment {
  id: number;
  owner_id: number;
  location: string;
  unit_number: string;
  area: number;
  number_of_rooms: number;
  type: string;
  description?: string;
  photos?: string[];
  parking_availability?: boolean;
  video?: string | null;
  map_location?: string | null;
  price: number;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'  // ✅ Ensures ApiService is available globally
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/apartments'; // ✅ Flask API Endpoint
  private usersApiUrl = 'http://localhost:5000/users'; // ✅ Users API

  constructor(private http: HttpClient) {}

  // ✅ Fetch all apartments
  getAllApartments(): Observable<Apartment[]> {
    return this.http.get<Apartment[]>(this.apiUrl, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Fetch a single apartment by ID (Fix: Ensure function name matches usage)
  getApartment(id: number): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.apiUrl}/${id}`, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Fetch users list
  getUsers(): Observable<string[]> {
    return this.http.get<string[]>(this.usersApiUrl, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Fetch apartments with filters (e.g., price range, location, etc.)
  getFilteredApartments(filters: any): Observable<Apartment[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    });

    return this.http.get<Apartment[]>(`${this.apiUrl}`, { params, ...this.getHttpOptions() }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Create a new apartment (POST)
  addApartment(apartmentData: Apartment): Observable<Apartment> {
    return this.http.post<Apartment>(this.apiUrl, apartmentData, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Update an existing apartment (PUT)
  updateApartment(id: number, apartmentData: Partial<Apartment>): Observable<Apartment> {
    return this.http.put<Apartment>(`${this.apiUrl}/${id}`, apartmentData, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Delete an apartment (DELETE) with headers
  deleteApartment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions()).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Error Handling
  private handleError(error: any) {
    console.error('❌ API Error:', error);
    let errorMessage = 'Something went wrong. Please try again.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server error (${error.status}): ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // ✅ Standard HTTP Headers
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getPotentialBuyersOrTenants() {
    return this.http.get<any[]>('http://localhost:5000/api/potential-buyers-tenants');
  }
  
  updateApartmentStatusWithTransaction(apartmentId: number, payload: { 
    transaction_type: string, 
    transaction: {
      amount: number,
      // transaction_type: 'Rent' | 'Sale',
      payment_method: 'Visa' | 'MasterCard' | 'Cash'
    } | null
    buyerId: number | null 
  }) {
    return this.http.post(`http://localhost:5000/apartments/${apartmentId}/status-with-transaction`, payload);
  }
  
  
  assignApartmentToUser(apartmentId: number, userId: number) {
    return this.http.post(`http://localhost:5000/api/assign-apartment`, {
      apartment_id: apartmentId,
      user_id: userId
    });
  }
  
  removeApartmentBuyer(apartmentId: number) {
    return this.http.post(`http://localhost:5000/api/remove-apartment-buyer`, {
      apartment_id: apartmentId
    });
  }
  
  
}
