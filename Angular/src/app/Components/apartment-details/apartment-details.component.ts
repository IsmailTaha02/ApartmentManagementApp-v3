import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../Services/api.service'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../Services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ContactLoginPromptComponent } from '../contact-login-prompt/contact-login-prompt.component';
import { ApartmentTopbarComponent } from "../TopBar/apartment-topbar/apartment-topbar.component"; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apartment-details',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ApartmentTopbarComponent, FormsModule],
  templateUrl: './apartment-details.component.html',
  styleUrls: ['./apartment-details.component.css']
})
export class ApartmentDetailsComponent implements OnInit {
  apartment: any = null;
  error: string | null = null;
  mainPhoto: string = 'assets/default-image.jpg';
  safeVideoUrl: SafeResourceUrl | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  isLoggedIn = false;
  role: string | null = null;

  selectedUserId: number | null = null;
  potentialUsers: any[] = [];
  selectedStatus = '';

  transactionData = {
    amount: null as number | null,
    // transaction_type: 'Rent' as 'Rent' | 'Sale',
    payment_method: 'Visa' as 'Visa' | 'MasterCard' | 'Cash'
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    const apartmentId = Number(this.route.snapshot.paramMap.get('id'));
    if (apartmentId) {
      this.fetchApartmentDetails(apartmentId);
    }

    this.role = localStorage.getItem('role');

    if (this.role === 'Owner' || this.role === 'Administrator') {
      this.loadPotentialUsers();
    }
  }

  fetchApartmentDetails(id: number): void {
    this.apiService.getApartment(id).subscribe({
      next: (data) => {
        this.apartment = data;
        this.selectedStatus = data.status;
        this.mainPhoto = data.photos && data.photos.length > 0 ? data.photos[0] : 'assets/default-image.jpg';
        console.log(this.apartment.video)
      },
      error: () => {
        this.error = 'Failed to load apartment';
      }
    });
  }

  loadPotentialUsers(): void {
    this.apiService.getPotentialBuyersOrTenants().subscribe({
      next: (users) => this.potentialUsers = users,
      error: () => console.error('Failed to load potential users')
    });
  }

  submitStatusUpdate(): void {
    if (!this.apartment) return;

    const isSoldOrRented = this.selectedStatus === 'Sale' || this.selectedStatus === 'Rent';

    // Validation
    if (isSoldOrRented) {
      if (
        this.transactionData.amount === null ||
        // !this.transactionData.transaction_type ||
        !this.transactionData.payment_method
      ) {
        alert('Please fill all transaction details.');
        return;
      }
      if (!this.selectedUserId) {
        alert('Please select a buyer/tenant.');
        return;
      }
    }

    // Prepare payload
    const payload = {
      transaction_type: this.selectedStatus,
      transaction: isSoldOrRented
        ? {
            amount: this.transactionData.amount!,
            // transaction_type: this.transactionData.transaction_type,
            payment_method: this.transactionData.payment_method
          }
        : null,
      buyerId: isSoldOrRented ? this.selectedUserId : null
    };

    this.apiService.updateApartmentStatusWithTransaction(this.apartment.id, payload).subscribe({
      next: () => {
        alert('Apartment status, transaction, and buyer updated successfully.');
        this.fetchApartmentDetails(this.apartment.id);
        this.resetTransactionData();
        this.selectedUserId = null;
      },
      error: () => alert('Failed to update apartment status and transaction.')
    });
  }

  resetTransactionData(): void {
    this.transactionData = {
      amount: null,
      // transaction_type: 'Rent',
      payment_method: 'Visa'
    };
  }

  detachBuyerTenant(): void {
    if (!this.apartment) return;

    this.apiService.removeApartmentBuyer(this.apartment.id).subscribe({
      next: () => {
        alert('Buyer/Tenant detached');
        this.fetchApartmentDetails(this.apartment.id);
      },
      error: () => alert('Failed to detach buyer/tenant')
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
      this.router.navigate([`/tenant-dashboard/messages?apartmentId=${apartmentId}`]);
    } else {
      const dialogRef = this.dialog.open(ContactLoginPromptComponent);
      dialogRef.afterClosed().subscribe(choice => {
        if (choice === 'login') {
          this.router.navigate(['/login'], { queryParams: { redirectTo: `/tenant-dashboard/messages?apartmentId=${apartmentId}` } });
        } else if (choice === 'signup') {
          this.router.navigate(['/signup'], { queryParams: { redirectTo: `/tenant-dashboard/messages?apartmentId=${apartmentId}`, forcedRole: 'Buyer/Tenant' } });
        }
      });
    }
  }
}
