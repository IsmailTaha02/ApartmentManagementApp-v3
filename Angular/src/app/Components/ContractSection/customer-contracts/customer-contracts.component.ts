import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractTopbarComponent } from '../../TopBar/contract-topbar/contract-topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [ContractTopbarComponent, CommonModule, FormsModule, NgSelectModule],
  selector: 'app-customer-contracts',
  templateUrl: './customer-contracts.component.html',
  styleUrls: ['./customer-contracts.component.css']
})
export class CustomerContractsComponent implements OnInit {
  contracts: any[] = [];
  selectedStatus: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    let params = new HttpParams();

    if (this.selectedStatus) {
      params = params.set('status', this.selectedStatus);
    }

    const token = localStorage.getItem('token');  // Assuming you store token on login
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>('http://localhost:5000/customer-contracts', { params, headers })
      .subscribe({
        next: data => this.contracts = data,
        error: err => console.error('Error loading customer contracts:', err)
      });

  }

  viewDetails(contract: any): void {
    this.router.navigate(['tenant-dashboard/contract-details', contract.id]);
  }
}
