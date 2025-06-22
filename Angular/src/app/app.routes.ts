import { Route } from '@angular/router';
import { CustomerPaymentsComponent } from './Components/PaymentsSection/customer-payments/customer-payments.component';

export const routes: Route[] = [
  { path: '', redirectTo: 'home-page', pathMatch: 'full' },

  // ================= PUBLIC PAGES =================
  {
    path: 'home-page',
    loadComponent: () =>
      import('./Components/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'apartment/:id',
    loadComponent: () =>
      import('./Components/apartment-details/apartment-details.component').then(m => m.ApartmentDetailsComponent)
  },
  {
    path: 'buy-homes',
    loadComponent: () =>
      import('./Components/buy-homes/buy-homes.component').then(m => m.BuyHomesComponent)
  },
  {
    path: 'rent-homes',
    loadComponent: () =>
      import('./Components/rent-homes/rent-homes.component').then(m => m.RentHomesComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./Components/LoginPage/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./Components/signup-page/signup-page.component').then(m => m.SignupPageComponent)
  },
  {
    path: 'contact-owner/:apartmentId',
    loadComponent: () =>
      import('./Components/contact-owner/contact-owner.component').then(m => m.ContactOwner)
  },

  // ================= MAINTENANCE CENTER =================
  {
    path: 'maintenance-center/:userId',
    loadComponent: () =>
      import('./Components/maintenance-center/maintenance-center.component').then(
        m => m.MaintenanceCenterComponent
      )
  },

  // ================= DASHBOARDS =================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./Components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'technician-requests', pathMatch: 'full' },
      {
        path: 'technician-requests',
        loadComponent: () =>
          import('./Components/technician-requests/technician-requests.component').then(
            m => m.TechnicianRequestsComponent
          )
      }
    ]
  },

  // ================= TECHNICIAN DASHBOARD =================
  {
    path: 'technician-dashboard',
    loadComponent: () =>
      import('./Components/technician-dashboard/technician-dashboard.component').then(
        m => m.TechnicianDashboardComponent
      ),
    children: [
      { path: '', redirectTo: 'assignments', pathMatch: 'full' },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./Components/technician-assignments/technician-assignments.component').then(
            m => m.TechnicianAssignmentsComponent
          )
      },
      {
        path: 'assignment-details/:id',
        loadComponent: () =>
          import('./Components/technician-assignment-details/technician-assignment-details.component').then(
            m => m.TechnicianAssignmentDetailsComponent
          )
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./Components/technician-requests/technician-requests.component').then(
            m => m.TechnicianRequestsComponent
          )
      },
      {
        path: 'maintenance-request/:id',
        loadComponent: () =>
          import('./Components/maintenance-request-detail/maintenance-request-detail.component').then(
            m => m.MaintenanceRequestDetailComponent
          )
      },
      {
        path: 'customer-payments',
        loadComponent: () =>
          import('./Components/PaymentsSection/customer-payments/customer-payments.component').then(
            m => m.CustomerPaymentsComponent
          )
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./Components/messages/messages.component').then(
            m => m.MessagesComponent
          )
      },
      {
        path: 'customer-apartments',
        loadComponent: () =>
          import('./Components/ApartmentsSection/customer-apartments/customer-apartments.component').then(
            m => m.CustomerApartmentsComponent
          )
      },
    
    ]
  },

  // ================= TENANT DASHBOARD =================
  {
    path: 'tenant-dashboard',
    loadComponent: () =>
      import('./Components/tenant-dashboard/tenant-dashboard.component').then(
        m => m.TenantDashboardComponent
      ),
    children: [
      { path: '', redirectTo: 'maintenance-center', pathMatch: 'full' },
      {
        path: 'maintenance-center',
        loadComponent: () =>
          import('./Components/maintenance-center/maintenance-center.component').then(
            m => m.MaintenanceCenterComponent
          )
      },
      {
        path: 'maintenance-request',
        loadComponent: () =>
          import('./Components/maintenance-request/maintenance-request.component').then(
            m => m.MaintenanceRequestComponent
          )
      },
      
      {
        path: 'maintenance-request/:id',
        loadComponent: () =>
          import('./Components/maintenance-request-detail/maintenance-request-detail.component').then(
            m => m.MaintenanceRequestDetailComponent
          ),
        data: { from: 'tenant' }
      },

      {
        path: 'customer-payments',
        loadComponent: () =>
          import('./Components/PaymentsSection/customer-payments/customer-payments.component').then(
            m => m.CustomerPaymentsComponent
          )
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./Components/messages/messages.component').then(
            m => m.MessagesComponent
          )
      },
      {
        path: 'customer-apartments',
        loadComponent: () =>
          import('./Components/ApartmentsSection/customer-apartments/customer-apartments.component').then(
            m => m.CustomerApartmentsComponent
          )
      },
      {
        path: 'customer-contracts',
        loadComponent: () =>
          import('./Components/ContractSection/customer-contracts/customer-contracts.component').then(
            m => m.CustomerContractsComponent
          )
      },
      {
        path: 'contract-details/:id',
        loadComponent: () =>
          import('./Components/ContractSection/contract-details/contract-details.component').then(
            m => m.ContractDetailsComponent
          )
      },
      {
        path: 'apartment-details/:id',
        loadComponent: () =>
          import('./Components/apartment-details/apartment-details.component').then(
            m => m.ApartmentDetailsComponent
          )
      },
    ]
  },

  // ================= OWNER DASHBOARD =================
  {
    path: 'owner-dashboard',
    loadComponent: () =>
      import('./Components/owner-dashboard/owner-dashboard.component').then(
        m => m.OwnerDashboardComponent
      ),
    children: [
      { path: '', redirectTo: 'admin-payments', pathMatch: 'full' },
 
      {
        path: 'maintenance-requests',
        loadComponent: () =>
          import('./Components/technician-requests/technician-requests.component').then(
            m => m.TechnicianRequestsComponent
          )
      },
      {
        path: 'maintenance-request/:id',
        loadComponent: () =>
          import('./Components/maintenance-request-detail/maintenance-request-detail.component').then(
            m => m.MaintenanceRequestDetailComponent
          ),
        data: { from: 'owner' }
      },
      {
        path: 'admin-payments',
        loadComponent: () =>
          import('./Components/PaymentsSection/admin-payments/admin-payments.component').then(
            m => m.AdminPaymentsComponent
          )
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./Components/messages/messages.component').then(
            m => m.MessagesComponent
          )
      },
      {
        path: 'admin-apartments',
        loadComponent: () =>
          import('./Components/ApartmentsSection/admin-apartments/admin-apartments.component').then(
            m => m.AdminApartmentsComponent
          )
      },
      {
        path: 'admin-contracts',
        loadComponent: () =>
          import('./Components/ContractSection/owner-contracts/owner-contracts.component').then(
            m => m.OwnerContractsComponent
          )
      },
      {
        path: 'contract-details/:id',
        loadComponent: () =>
          import('./Components/ContractSection/contract-details/contract-details.component').then(
            m => m.ContractDetailsComponent
          )
      },
      {
        path: 'create-contract',
        loadComponent: () =>
          import('./Components/ContractSection/create-contract/create-contract.component').then(
            m => m.CreateContractComponent
          )
      },
      {
        path: 'apartment-details/:id',
        loadComponent: () =>
          import('./Components/apartment-details/apartment-details.component').then(
            m => m.ApartmentDetailsComponent
          )
      },

    ]
  },

  // ================= STANDALONE PAGES =================
  {
    path: 'maintenance-request',
    loadComponent: () =>
      import('./Components/maintenance-request/maintenance-request.component').then(
        m => m.MaintenanceRequestComponent
      )
  },
  {
    path: 'maintenance-request/:id',
    loadComponent: () =>
      import('./Components/maintenance-request-detail/maintenance-request-detail.component').then(
        m => m.MaintenanceRequestDetailComponent
      )
  },

  // ================= TECHNICIAN ROUTES =================
  {
    path: 'technician/:id',
    children: [
      { path: '', redirectTo: 'assignments', pathMatch: 'full' },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./Components/technician-assignments/technician-assignments.component').then(
            m => m.TechnicianAssignmentsComponent
          )
      },
      {
        path: 'assignment-details/:requestId',
        loadComponent: () =>
          import('./Components/technician-assignment-details/technician-assignment-details.component').then(
            m => m.TechnicianAssignmentDetailsComponent
          )
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./Components/technician-requests/technician-requests.component').then(
            m => m.TechnicianRequestsComponent
          )
      }
    ]
  },

  // ================= FALLBACK =================
  { path: '**', redirectTo: 'home-page' }
];