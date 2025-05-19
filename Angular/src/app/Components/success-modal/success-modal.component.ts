import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; // Add this
import { MatIconModule } from '@angular/material/icon'; // Add this
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule] // Add necessary modules
})
export class SuccessModalComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<SuccessModalComponent>) {}

  ngOnInit(): void {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}