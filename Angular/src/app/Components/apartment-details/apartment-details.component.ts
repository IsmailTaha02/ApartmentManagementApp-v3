import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../Services/api.service'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../Services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ContactLoginPromptComponent } from '../contact-login-prompt/contact-login-prompt.component'; 

@Component({
  selector: 'app-apartment-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './apartment-details.component.html',
  styleUrls: ['./apartment-details.component.css']
})
export class ApartmentDetailsComponent implements OnInit {
  apartment: any = null;
  error: string | null = null;
  mainPhoto: string = 'assets/default-image.jpg';
  safeVideoUrl: SafeResourceUrl | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    // Load apartment
    const apartmentId = this.route.snapshot.paramMap.get('id');
    if (apartmentId) {
      this.fetchApartmentDetails(Number(apartmentId));
    }
  }

  fetchApartmentDetails(id: number): void {
    this.apiService.getApartment(id).subscribe({
      next: (data: any) => {
        console.log("✅ Apartment Data Received:", data);
        this.apartment = data;
        this.error = null;

        this.mainPhoto = this.apartment.photos?.[0] || 'assets/default-image.jpg';

        if (this.apartment.video) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.apartment.video);
        }

        if (this.apartment.map_location) {
          this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.apartment.map_location);
        }
      },
      error: (err) => {
        console.error('❌ Error fetching apartment:', err);
        this.error = "Failed to load apartment details. Please try again.";
      }
    });
  }

  changeMainPhoto(photo: string): void {
    this.mainPhoto = photo;
  }

  goBack(): void {
    window.history.back();
  }

  contactOwner(apartmentId: number): void {
    if (this.isLoggedIn) {
      this.router.navigate([`/contact-owner/${apartmentId}`]);
      return;
    }

    const dialogRef = this.dialog.open(ContactLoginPromptComponent);

    dialogRef.afterClosed().subscribe(choice => {
      if (choice === 'login') {
        this.router.navigate(['/login'], { queryParams: { redirectTo: `/tenant-dashboard/messages?apartmentId=${apartmentId}` } });
      } else if (choice === 'signup') {
        this.router.navigate(['/signup'], { queryParams: { redirectTo: `/contact-owner/${apartmentId}` } });
      }
      // cancel = do nothing
    });
  }

  // openContactForm(): void {
  //   console.log('✅ Opening contact form...');
  //   // TODO: Implement modal or form for contacting the owner
  // }
}
