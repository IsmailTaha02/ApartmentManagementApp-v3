import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaymentsTopbarComponent } from '../../TopBar/payments-topbar/payments-topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-customer-payments',
  standalone: true,
  imports: [CommonModule,FormsModule,PaymentsTopbarComponent,NgSelectModule],
  templateUrl: './customer-payments.component.html',
  styleUrls: ['./customer-payments.component.scss']
})
export class CustomerPaymentsComponent implements OnInit {

  statusFilter: string = 'All';

  payments: any[] = [];
  filteredPayments: any[] = [];

  currentUserId: number | null = null;

  monthOptions: string[] = [];
  monthFilter: string | null = null;


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('currentUser');  // Adjust key if needed
    console.log(storedUser)
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.currentUserId = parsedUser.id;
    }
  
    this.http.get<any>('http://localhost:5000/payments').subscribe((data) => {
      const allPayments = [
        ...data.due.map((p: any) => ({ ...p, status: 'Due' })),
        ...data.overdue.map((p: any) => ({ ...p, status: 'Overdue' })),
        ...data.completed.map((p: any) => ({ ...p, status: 'Completed' }))
      ];
  
      // 🔐 Filter to current user's payments
      this.payments = allPayments.filter(p => p.user?.id === this.currentUserId);
  
      // ✅ Build month filters only for current user's data
      const monthsSet = new Set<string>();
      this.payments.forEach(p => {
        const date = new Date(p.due_date);
        const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthsSet.add(monthLabel);
      });
  
      this.monthOptions = Array.from(monthsSet);
      this.applyFilter();
    });
  }
  

  applyFilter(): void {
    this.filteredPayments = this.payments.filter(p => {
      const matchStatus =
        this.statusFilter === 'All' || p.status === this.statusFilter;
  
      const matchMonth =
        !this.monthFilter ||
        new Date(p.due_date).toLocaleString('default', { month: 'long', year: 'numeric' }) === this.monthFilter;
  
      return matchStatus && matchMonth;
    });
  }  
  
}
