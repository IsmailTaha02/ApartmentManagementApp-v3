import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
    HeaderComponent
  ],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css']
})
export class SignupPageComponent {
  // Icons
  faUser = faUser;
  faLock = faLock;
  faFacebook = faFacebook;

  // Form fields
  fullName: string = '';
  email: string = '';
  phoneNumber: string = '';
  role: string = '';
  job: string = '';
  facebookLink: string = '';
  password: string = '';

  // State
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage = signal<string | null>(null);

  // Inject services
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signup method
  onSignup() {
    this.errorMessage = '';
    this.successMessage.set(null);
    this.isSubmitting = true;

    const user = {
      full_name: this.fullName,
      email: this.email,
      phone_number: this.phoneNumber,
      role: this.role,
      job: this.job || null,
      facebook_link: this.facebookLink || null,
      password: this.password
    };

    this.http.post('http://localhost:5000/users', user).subscribe({
      next: (res: any) => {
        // Store token if returned
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        this.successMessage.set('Account created successfully! Redirecting to login...');

        // Get redirectTo from query params if any
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');

        setTimeout(() => {
          if (redirectTo) {
            // Pass redirectTo when navigating to login page
            this.router.navigate(['/login'], { queryParams: { redirectTo } });
          } else {
            this.router.navigate(['/login']);
          }
        }, 2000);

        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Failed to sign up. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
