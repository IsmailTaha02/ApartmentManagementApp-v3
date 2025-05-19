import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// Root Component & Routes
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Angular Core Modules
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Third-Party Modules
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Services
import { ApiService } from './app/Services/api.service';

bootstrapApplication(AppComponent, {
  providers: [
    // ✅ Routing
    provideRouter(routes),

    // ✅ HTTP Client
    provideHttpClient(),

    // ✅ Core & Shared Modules
    importProvidersFrom(
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      BrowserAnimationsModule,

      // Angular Material Modules
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatOptionModule,
      MatButtonModule,
      MatIconModule,

      // Third-Party Modules
      FontAwesomeModule
    ),

    // ✅ Custom Global Services
    ApiService
  ]
});
