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
      font-size: 24px;
      margin-bottom: 10px;
      color: #3f51b5;
    }
    mat-dialog-content p {
      font-size: 16px;
      color: #000;
      margin: 15px 0;
    }
    mat-dialog-actions button {
      min-width: 90px;
      margin-left: 8px;
    }
    button[color="primary"] {
      font-weight: 600;
    }
    /* Custom style for Sign Up button */
    .signup-button {
      background-color: black;
      color: white;
      font-weight: 600;
      padding: 7px
    }
    .signup-button:hover {
      background-color: #222; /* slightly lighter black on hover */
    }
  `]
})
export class ContactLoginPromptComponent {
  constructor(private dialogRef: MatDialogRef<ContactLoginPromptComponent>) {}

  close(choice: 'login' | 'signup' | 'cancel') {
    this.dialogRef.close(choice);
  }
}
