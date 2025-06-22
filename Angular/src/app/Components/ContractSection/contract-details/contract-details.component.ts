import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ContractTopbarComponent } from "../../TopBar/contract-topbar/contract-topbar.component";

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [CommonModule, ContractTopbarComponent],
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.css']
})
export class ContractDetailsComponent implements OnInit {
  contractId!: number;
  selectedContractDetails: any = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private location: Location) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.contractId = +id;
        this.loadContractDetails(this.contractId);
      }
    });
  }

  loadContractDetails(id: number) {
    this.http.get(`http://localhost:5000/contracts/${id}`)
      .subscribe({
        next: (data) => this.selectedContractDetails = data,
        error: (err) => console.error('Error loading contract details:', err)
      });
  }

  goBack() {
    this.location.back();
  }

  printContract() {
    const content = document.getElementById('contract-content')?.innerHTML;
    if (content) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Contract #${this.contractId}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
                .contract-container { background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
                .contract-header, .party-section, .signatures { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .description-box, .apartment-section { background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 15px; }
                .signed { color: green; font-weight: bold; }
                .signatures span:not(.signed) { color: red; }
                h1 { text-align: center; }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  }
  

  downloadContract() {
    const content = document.getElementById('contract-content')?.innerHTML;
    if (content) {
      const htmlContent = `
        <html>
          <head>
            <title>Contract #${this.contractId}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
              .contract-container { background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 10px; }
              .contract-header, .party-section, .signatures { display: flex; justify-content: space-between; margin-bottom: 15px; }
              .description-box, .apartment-section { background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 15px; }
              .signed { color: green; font-weight: bold; }
              .signatures span:not(.signed) { color: red; }
              h1 { text-align: center; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${this.contractId}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
  
}
