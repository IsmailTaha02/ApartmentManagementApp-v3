import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { ApartmentTopbarComponent } from '../../TopBar/apartment-topbar/apartment-topbar.component';

@Component({
  selector: 'app-customer-apartments',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ApartmentTopbarComponent],
  templateUrl: './customer-apartments.component.html',
  styleUrls: ['./customer-apartments.component.scss']
})
export class CustomerApartmentsComponent implements OnInit {
  userId: number = Number(localStorage.getItem('user_id'));
  activeTab: 'mine' | 'explore' = 'mine';

  myApartments: any[] = [];
  searchResults: any[] = [];

  // Filters for exploring
  typeFilter: string = '';
  locationFilter: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minArea: number | null = null;
  maxArea: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMyApartments();
    this.applySearchFilters();
  }

  loadMyApartments(): void {
    this.http.get<any[]>(`http://localhost:5000/user/${this.userId}/apartments`).subscribe(data => {
      this.myApartments = data;
    });
  }

  applySearchFilters(): void {
    let params = new HttpParams();

    if (this.typeFilter) params = params.set('type', this.typeFilter);
    if (this.locationFilter) params = params.set('location', this.locationFilter);
    if (this.minPrice !== null) params = params.set('price_min', this.minPrice.toString());
    if (this.maxPrice !== null) params = params.set('price_max', this.maxPrice.toString());
    if (this.minArea !== null) params = params.set('area_min', this.minArea.toString());
    if (this.maxArea !== null) params = params.set('area_max', this.maxArea.toString());

    this.http.get<any[]>('http://localhost:5000/apartments', { params }).subscribe(data => {
      this.searchResults = data.filter(apt => apt.status === 'Available');
    });
  }
}
