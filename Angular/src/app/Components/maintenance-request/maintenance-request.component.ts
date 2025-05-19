import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule 
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Add this import

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SuccessModalComponent } from '../success-modal/success-modal.component';

@Component({
  selector: 'app-maintenance-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule // Add this
  ],
  templateUrl: './maintenance-request.component.html',
  styleUrls: ['./maintenance-request.component.css']
})
export class MaintenanceRequestComponent implements OnInit {
  userId = 0;
  maintenanceForm!: FormGroup;
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  step: number = 1;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Add this
  ) {}
  ngOnInit(): void {
    this.maintenanceForm = this.fb.group({
      residentName: ['', Validators.required],
      apartmentNumber: ['', Validators.required],
      category: ['', Validators.required],
      urgency: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      technicianId: ['', Validators.required]  // ✅ Added field
    });
  }

  get f() {
    return this.maintenanceForm.controls;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  nextStep(): void {
    if (this.step === 1 && (!this.f['residentName'].valid || !this.f['apartmentNumber'].valid)) return;
    if (this.step === 2 && (!this.f['category'].valid || !this.f['urgency'].valid || !this.f['description'].valid || !this.f['technicianId'].valid)) return;
    this.step++;
  }

  previousStep(): void {
    this.step--;
  }
  submitRequest(): void {
    if (this.maintenanceForm.invalid) return;
  
    const formData = new FormData();
    formData.append('user_id', localStorage.getItem('user_id') || '');
    formData.append('apartment_id', this.f['apartmentNumber'].value);
    formData.append('technician_id', this.f['technicianId'].value);
    formData.append('problem_type', this.f['category'].value);
    formData.append('description', this.f['description'].value);
    formData.append('status', 'Pending');
  
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
  
    const apiUrl = '/api/maintenance-requests';
    
    this.http.post(apiUrl, formData).subscribe({
      next: () => {
        this.dialog.open(SuccessModalComponent); // Now this will work
        
        this.snackBar.open('✅ Request Submitted Successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.maintenanceForm.reset();
        this.photoPreview = null;
        this.step = 1;
      },
      error: (err) => {
        console.error('Submission Error:', err);
        this.snackBar.open('❌ Submission Failed. Try Again.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}