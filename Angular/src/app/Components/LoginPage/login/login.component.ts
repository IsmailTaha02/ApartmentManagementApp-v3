import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faHouse, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { TechnicianService } from '../../../Services/technician.service';
import { HeaderComponent } from '../../header/header.component';

// Define what a User looks like
interface User {
  id: number;
  email: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent
  ]
})
export class LoginComponent {
  // Icons for our buttons
  faHouse = faHouse;
  faUser = faUser;
  faLock = faLock;
  faGoogle = faGoogle;
  faFacebook = faFacebook;

  // Form fields
  username: string = '';
  password: string = '';
  isLoggingIn: boolean = false;
  errorMessage: string = '';

  // Track the logged-in user
  currentUser = signal<User | null>(null);

  // Get the services we need
  private http = inject(HttpClient);
  private router = inject(Router);
  private technicianService = inject(TechnicianService);

  // When login button is clicked
  onLogin() {
    this.isLoggingIn = true;
    this.errorMessage = '';

    this.http.post<{ user: User }>('http://localhost:5000/api/login', {
      email: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        // Save the user data
        this.currentUser.set(res.user);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        localStorage.setItem('user_id', res.user.id.toString());
        localStorage.setItem('role', res.user.role);

        // If user is a technician, set their ID
        if (res.user.role === 'Technician') {
          this.technicianService.setTechnicianId(res.user.id);
        }

        // Send user to the right page based on their role
        switch (res.user.role) {
          case 'Technician': this.router.navigate(['/technician-dashboard']); break;
          case 'Administrator': this.router.navigate(['/owner-dashboard']); break;
          case 'Owner': this.router.navigate(['/owner-dashboard']); break;
          case 'Buyer/Tenant': this.router.navigate(['/tenant-dashboard']); break;
          default: this.router.navigate(['/dashboard']);
        }

        this.isLoggingIn = false;
      },
      error: (err) => {
        this.errorMessage = 'Invalid email or password';
        this.isLoggingIn = false;
      }
    });
  }

  // These are just placeholders for now
  onGoogleLogin() { console.log('Google login'); }
  onFacebookLogin() { console.log('Facebook login'); }
}