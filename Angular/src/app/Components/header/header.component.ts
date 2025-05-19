import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd,RouterModule } from '@angular/router';  // Use NavigationEnd to track route changes
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  standalone: true,
  imports: [CommonModule,RouterModule],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  hideLoginButton: boolean = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const currentUrl = this.router.url;
    console.log('Header on init with URL:', currentUrl);
    this.hideLoginButton = currentUrl.includes('login');
  }
 
}
