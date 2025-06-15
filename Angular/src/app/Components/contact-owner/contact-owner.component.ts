import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-contact-owner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-owner.component.html',
  styleUrls: ['./contact-owner.component.css']
})
export class ContactOwner implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  apartmentId!: string;
  apartment: any = null;
  apartmentLoaded = false;
  message: string = '';
  sending = false;
  sendSuccess = false;
  error = '';

  ngOnInit() {
    this.apartmentId = this.route.snapshot.paramMap.get('apartmentId')!;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: `/contact-owner/${this.apartmentId}` } });
      return;
    }

    this.loadApartment();
  }

  loadApartment() {
    this.http.get(`http://localhost:5000/apartments/${this.apartmentId}`).subscribe({
      next: (data) => {
        this.apartment = data;
        this.apartmentLoaded = true;
      },
      error: () => {
        this.error = 'Failed to load apartment info.';
      }
    });
  }

  sendMessage() {
    if (!this.message.trim()) return;

    this.sending = true;
    const payload = {
      apartment_id: this.apartmentId,
      sender_id: localStorage.getItem('user_id'),
      content: this.message
    };

    console.log(payload.sender_id);
    
    this.http.post(`http://localhost:5000/messages`, payload).subscribe({
      next: () => {
        this.sendSuccess = true;
        this.message = '';
      },
      error: () => {
        this.error = 'Failed to send message.';
      },
      complete: () => {
        this.sending = false;
      }
    });
  }
}
