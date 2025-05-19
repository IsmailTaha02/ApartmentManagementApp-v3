import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';  // For fetching data from the backend
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  standalone: true,
  imports: [CommonModule,RouterModule,HeaderComponent],
  selector: 'app-main',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  apartments: any[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.getNewListings();
  }

  // Fetch new listings from the backend
  getNewListings() {
    this.http.get<any[]>('http://localhost:5000/apartments')  // Replace with your actual Flask API endpoint
      .subscribe(data => {
        this.apartments = data;  // Assign the fetched apartments data to the apartments array
      });
  }

  // Navigate to apartments page
  goToApartments() {
    this.router.navigate(['/apartments']);
  }

  // Navigate to users page
  goToUsers() {
    this.router.navigate(['/users']);
  }

   // Navigate to users page
   addToCart(apartment: any) {
    this.router.navigate(['/users']);
  }
}
