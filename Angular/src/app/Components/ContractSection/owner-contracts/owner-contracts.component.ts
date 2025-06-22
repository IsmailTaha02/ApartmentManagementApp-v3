import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ContractTopbarComponent } from '../../TopBar/contract-topbar/contract-topbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [ContractTopbarComponent, CommonModule, FormsModule, NgSelectModule],
  selector: 'app-contracts',
  templateUrl: './owner-contracts.component.html',
  styleUrls: ['./owner-contracts.component.css']
})
export class OwnerContractsComponent implements OnInit {
  contracts: any[] = [];
  users: any[] = [];
  apartments: any[] = [];

  selectedStatus: string = '';
  selectedUser: string = '';
  selectedApartment: string = '';
  selectedType: string = '';
  contractTypes: string[] = ['Sale', 'Rent'];
  
  selectedContract: any = null;

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadUsers();
    this.loadApartments();
  }

  loadContracts(): void {
    let params = new HttpParams();

    if (this.selectedStatus) params = params.set('status', this.selectedStatus);
    if (this.selectedUser) params = params.set('user_id', this.selectedUser);
    if (this.selectedApartment) params = params.set('apartment_id', this.selectedApartment);
    if (this.selectedType) params = params.set('contract_type', this.selectedType);

    this.http.get<any[]>('http://localhost:5000/contracts', { params })
      .subscribe({
        next: (data) => {
          this.contracts = data;
        },
        error: (err) => {
          console.error('Error loading contracts:', err);
        }
      });
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:5000/users')
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Error loading users:', err);
        }
      });
  }

  loadApartments(): void {
    this.http.get<any[]>('http://localhost:5000/apartments')
      .subscribe({
        next: (data) => {
          this.apartments = data;
        },
        error: (err) => {
          console.error('Error loading apartments:', err);
        }
      });
  }

  selectedContractId: number | null = null;

  viewDetails(contract: any): void {
    console.log("navigatin: ",contract.id);
    this.router.navigate(['/owner-dashboard/contract-details', contract.id]);
  }
  
  closeDetails(): void {
    this.selectedContractId = null;
  }

  createContract() {
    // Navigate to contract creation page
    // Example:
    this.router.navigate(['/owner-dashboard/create-contract']);
  }  

  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedUser = '';
    this.selectedApartment = '';
    this.selectedType = '';
    this.loadContracts();
  }
}
