import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApartmentTopbarComponent } from '../../TopBar/apartment-topbar/apartment-topbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-apartments',
  standalone: true,
  imports: [CommonModule, FormsModule, ApartmentTopbarComponent, RouterModule],
  templateUrl: './admin-apartments.component.html',
  styleUrls: ['./admin-apartments.component.scss']
})
export class AdminApartmentsComponent implements OnInit {
  apartments: any[] = [];
  filteredApartments: any[] = [];

  // Filter inputs
  typeFilter: string = '';
  locationFilter: string = '';
  cityFilter: string = '';
  unitNumber: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minArea: number | null = null;
  maxArea: number | null = null;

  selectedApartment: any = null;
  newImages: File[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApartments(); // initial load without filters
  }

  loadApartments(): void {
    let params = new HttpParams();

    if (this.typeFilter) params = params.set('type', this.typeFilter);
    if (this.unitNumber) params = params.set('unit_number', this.unitNumber);
    if (this.cityFilter) params = params.set('city', this.cityFilter);
    if (this.locationFilter) params = params.set('location', this.locationFilter);
    if (this.minPrice !== null) params = params.set('price_min', this.minPrice.toString());
    if (this.maxPrice !== null) params = params.set('price_max', this.maxPrice.toString());
    if (this.minArea !== null) params = params.set('area_min', this.minArea.toString());
    if (this.maxArea !== null) params = params.set('area_max', this.maxArea.toString());

    this.http.get<any[]>('http://localhost:5000/apartments', { params }).subscribe(data => {
      this.apartments = data;
      this.filteredApartments = data;
    });
  }

  applyFilters(): void {
    this.loadApartments();
  }

  openEditModal(apt: any): void {
    this.selectedApartment = { ...apt }; // deep copy
    this.newImages = [];
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.newImages.push(...files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (!this.selectedApartment.photos) this.selectedApartment.photos = [];
          this.selectedApartment.photos.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.selectedApartment.photos.splice(index, 1);
  }

  updateApartment(): void {
    const formData = new FormData();
  
    formData.append('id', this.selectedApartment.id);
    formData.append('location', this.selectedApartment.location);
    formData.append('city', this.selectedApartment.city);
    formData.append('price', this.selectedApartment.price);
    formData.append('area', this.selectedApartment.area);
    formData.append('number_of_rooms', this.selectedApartment.number_of_rooms);
    formData.append('description', this.selectedApartment.description);
    formData.append('type', this.selectedApartment.type);
    formData.append('unit_number', this.selectedApartment.unit_number);
    formData.append('status', this.selectedApartment.status);
  
    // Upload new files
    this.newImages.forEach(file => {
      formData.append('new_images', file);
    });
  
    // Filter only valid existing photo URLs
    const cleanedPhotos = (this.selectedApartment.photos || []).filter((url: string) =>
      url.includes('/static/uploads/')
    ).map((url: string) =>
      url.replace('http://localhost:5000', '').replace(/\\/g, '/')
    );
    
  
    formData.append('existing_photos', JSON.stringify(cleanedPhotos));
  
    this.http.put(`http://localhost:5000/apartments/${this.selectedApartment.id}`, formData)
      .subscribe(() => {
        this.selectedApartment = null;
        this.newImages = [];
        this.loadApartments();
      });
  }

  apartmentToDelete: any = null;
  showDeleteModal: boolean = false;

  opendeleteModal(apartment: any): void {
    this.apartmentToDelete = apartment;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.apartmentToDelete) return;

    this.http.delete(`http://localhost:5000/apartments/${this.apartmentToDelete.id}`)
      .subscribe({
        next: () => {
          this.apartments = this.apartments.filter(apt => apt.id !== this.apartmentToDelete.id);
          this.filteredApartments = this.filteredApartments.filter(apt => apt.id !== this.apartmentToDelete.id);
          this.apartmentToDelete = null;
          this.showDeleteModal = false;
        },
        error: err => {
          console.error('Failed to delete apartment', err);
          this.showDeleteModal = false;
        }
      });
  }

  cancelDelete(): void {
    this.apartmentToDelete = null;
    this.showDeleteModal = false;
  }


  showAddForm = false;

  newApartment: any = {
    location: '',
    city: '',
    unit_number: '',
    price: null,
    area: null,
    number_of_rooms: null,
    type: 'For Rent',
    description: '',
    status: 'Available',
    owner_id: 1 // Example static owner ID; adjust later based on auth
  };

// Instead of plain File[]
uploadedPhotos: { file: File, url: string }[] = [];

// Handle file upload (append to array instead of replacing)
handleNewPhotoUpload(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const files = Array.from(input.files);

    files.forEach(file => {
      // Prevent duplicates by file name (optional)
      if (!this.uploadedPhotos.some(p => p.file.name === file.name)) {
        const url = URL.createObjectURL(file);
        this.uploadedPhotos.push({ file, url });
      }
    });
  }
}

// Remove a selected photo before submission
removeNewPhoto(index: number): void {
  const removed = this.uploadedPhotos.splice(index, 1)[0];
  if (removed && removed.url) {
    URL.revokeObjectURL(removed.url);
  }
}

cancelAddForm(): void {
  this.uploadedPhotos.forEach(p => URL.revokeObjectURL(p.url));
  this.uploadedPhotos = [];
  this.showAddForm = false;
}

addSuccess: boolean = false;
// Form submission
submitNewApartment(): void {
  const formData = new FormData();
  for (let key in this.newApartment) {
    formData.append(key, this.newApartment[key]);
  }

  this.uploadedPhotos.forEach(p => {
    formData.append('photos', p.file);
  });

  this.http.post('http://localhost:5000/apartments', formData).subscribe({
    next: () => {
      this.addSuccess = true;
      this.showAddForm = false;
      this.loadApartments();

      // Cleanup URLs
      this.uploadedPhotos.forEach(p => URL.revokeObjectURL(p.url));
      this.uploadedPhotos = [];

      setTimeout(() => this.addSuccess = false, 3000);
    },
    error: err => {
      console.error('Failed to add apartment', err);
    }
  });
}

}
