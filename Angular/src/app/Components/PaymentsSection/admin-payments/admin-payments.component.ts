import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaymentsTopbarComponent } from '../../TopBar/payments-topbar/payments-topbar.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule,FormsModule,SidebarComponent,PaymentsTopbarComponent,NgSelectModule],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent implements OnInit {

  statusFilter: string = 'All';

  payments: any[] = [];
  filteredPayments: any[] = [];

  users: any[] = [];
  userFilter: number | null = null;
  userSearch: string = '';
  
  apartments: any[] = [];
  apartmentSearch: string = '';
  apartmentFilter: number | null = null;

  monthOptions: string[] = [];
  monthFilter: string | null = null;


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:5000/payments').subscribe((data) => {
      this.payments = [
        ...data.due.map((p: any) => ({ ...p, status: 'Due' })),
        ...data.overdue.map((p: any) => ({ ...p, status: 'Overdue' })),
        ...data.completed.map((p: any) => ({ ...p, status: 'Completed' }))
      ];
  
      // Extract unique users
      this.users = Array.from(
        new Map(
          this.payments
            .filter(p => p.user)  // ignore nulls
            .map(p => [p.user.id, p.user])
        ).values()
      );
  
      // Extract unique apartments
      this.apartments = Array.from(
        new Map(
          this.payments
            .filter(p => p.apartment)  // ignore nulls
            .map(p => [p.apartment.id, p.apartment])
        ).values()
      );

      const monthsSet = new Set<string>();

      this.payments.forEach(p => {
        const date = new Date(p.due_date);
        const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g. April 2025
        monthsSet.add(monthLabel);
      });

      this.monthOptions = ['All', ...Array.from(monthsSet)];

      this.applyFilter(); // Apply filters after loading
    });
  }
  

  applyFilter(): void {
    this.filteredPayments = this.payments.filter(p => {
      const matchStatus =
        this.statusFilter === 'All' || p.status === this.statusFilter;
  
      const matchUserDropdown =
        !this.userFilter || p.user?.id === +this.userFilter;
  
      const matchUserSearch =
        !this.userSearch ||
        p.user?.full_name.toLowerCase().includes(this.userSearch.toLowerCase());
  
      const matchApartmentDropdown =
        !this.apartmentFilter || p.apartment?.id === +this.apartmentFilter;
  
      const matchApartmentSearch =
        !this.apartmentSearch ||
        p.apartment?.location.toLowerCase().includes(this.apartmentSearch.toLowerCase());
      
      const matchMonth =
        !this.monthFilter ||  this.monthFilter === 'All' || // if no month selected or all, show all
        new Date(p.due_date).toLocaleString('default', { month: 'long', year: 'numeric' }) === this.monthFilter;

      return (
        matchStatus &&
        matchUserDropdown &&
        matchUserSearch &&
        matchApartmentDropdown &&
        matchApartmentSearch &&
        matchMonth
      );
    });
  }
  
  
}
