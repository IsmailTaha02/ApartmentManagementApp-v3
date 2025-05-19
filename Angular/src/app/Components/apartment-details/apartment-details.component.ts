import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../Services/api.service'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-apartment-details',
  standalone: true,
  imports: [CommonModule,HeaderComponent], 
  templateUrl: './apartment-details.component.html',
  styleUrls: ['./apartment-details.component.css']
})
export class ApartmentDetailsComponent implements OnInit {
  apartment: any = null;
  error: string | null = null; 
  mainPhoto: string = 'assets/default-image.jpg';
  safeVideoUrl: SafeResourceUrl | null = null;
  safeMapUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const apartmentId = this.route.snapshot.paramMap.get('id');
    if (apartmentId) {
      this.fetchApartmentDetails(Number(apartmentId)); // ✅ Ensure ID is a number
    }
  }

  fetchApartmentDetails(id: number): void {
    this.apiService.getApartment(id).subscribe(
      (data: any) => {
        console.log("✅ Apartment Data Received:", data);
        this.apartment = data;
        this.error = null; // ✅ Reset error if data is received

        // ✅ Set main photo
        this.mainPhoto = this.apartment.photos?.length
          ? this.apartment.photos[0]
          : 'assets/default-image.jpg';

        // ✅ Handle video and map links
        if (this.apartment.video) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.apartment.video);
        }
        if (this.apartment.map_location) {
          this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.apartment.map_location);
        }
      },
      (error: any) => {
        console.error('❌ Error fetching apartment:', error);
        this.error = "Failed to load apartment details. Please try again.";
      }
    );
  }

  changeMainPhoto(photo: string): void {
    this.mainPhoto = photo;
  }

  goBack(): void {
    window.history.back();
  }
}
