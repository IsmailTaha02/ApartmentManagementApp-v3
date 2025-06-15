import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent {

  constructor(private router: Router, private authService: AuthService,) {}
  logout(): void {
    this.authService.logout();
  }
}
