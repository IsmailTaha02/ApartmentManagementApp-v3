import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-card.component.html',
  styleUrl: './payment-card.component.css'
})
export class PaymentCardComponent {
  
  @Input() title!: string;
  @Input() amount!: number;
  @Input() dueDate!: string;
  @Input() paidDate!: string;
  @Input() status!: 'due' | 'overdue' | 'done';

}
