import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ContractTopbarComponent } from "../../TopBar/contract-topbar/contract-topbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone:true,
  imports: [ContractTopbarComponent, CommonModule, FormsModule],
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContractComponent implements OnInit {
  contractData = {
    contract_type: '',
    owner_id: null,
    buyer_id: null,
    apartment_id: null,
    contract_details: ''
  };

  contractTypes = ['Sale', 'Rent'];
  owners: any[] = [];
  buyers: any[] = [];
  apartments: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
    this.loadApartments();
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:5000/users').subscribe(data => {
      this.owners = data.filter(u => u.role === 'Administrator'); //should be owner
      this.buyers = data.filter(u => u.role === 'Buyer/Tenant');
    });
  }

  loadApartments() {
    this.http.get<any[]>('http://localhost:5000/apartments').subscribe(data => {
      this.apartments = data.filter(apt => apt.status === 'Available');
    });
  }

  submitContract() {
    this.http.post('http://localhost:5000/contracts', this.contractData).subscribe({
      next: () => {
        alert('Contract created successfully!');
        this.router.navigate(['/owner-dashboard/admin-contracts']);
      },
      error: (err) => {
        console.error('Error creating contract:', err);
        alert('Failed to create contract.');
      }
    });
  }
}
