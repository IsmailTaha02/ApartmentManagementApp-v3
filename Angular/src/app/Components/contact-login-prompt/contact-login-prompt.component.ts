import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact-login-prompt',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Login or Sign Up</h2>
    <mat-dialog-content>
      <p>You must be logged in to contact the owner.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close('cancel')">Cancel</button>
      <button  class="signup-button" (click)="close('signup')">Sign Up</button>
      <button mat-flat-button color="primary" (click)="close('login')">Login</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      font-weight: 700;
      font-size: 26px;
      margin-bottom: 12px;
      color: #3f51b5;
    }
  
    mat-dialog-content p {
      font-size: 16px;
      color: #333;
      margin: 20px 0;
      line-height: 1.4;
    }
  
    mat-dialog-actions {
      padding: 10px 30px 20px;
   
    }
  
    mat-dialog-actions button {
      min-width: 100px;
      padding: 8px 16px;
      margin-left: 10px;
      border-radius: 8px;
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
  
    button[color="primary"] {
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(63, 81, 181, 0.3);
    }
  
    button[color="primary"]:hover {
      background-color: #3949ab; /* darker shade of primary */
    }
  
    .signup-button {
      background-color: #000;
      color: #fff;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  
    .signup-button:hover {
      background-color: #222;
      box-shadow: 0 4px 6px rgba(0,0,0,0.4);
    }
  
    button[mat-button] {
      background: #f5f5f5;
      color: #555;
      border-radius: 8px;
    }
  
    button[mat-button]:hover {
      background: #e0e0e0;
    }
  `]  
})
export class ContactLoginPromptComponent {
  constructor(private dialogRef: MatDialogRef<ContactLoginPromptComponent>) {}

  close(choice: 'login' | 'signup' | 'cancel') {
    this.dialogRef.close(choice);
  }
}
