import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../Services/api.service';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-list-container">
      <h2>User List</h2>
      <ul *ngIf="users$ | async as users; else loading">
        <li *ngFor="let user of users">{{ user }}</li>
      </ul>
      <ng-template #loading>
        <p>Loading users...</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .user-list-container {
      text-align: center;
      padding: 20px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      background: #f8f9fa;
      margin: 5px;
      padding: 10px;
      border-radius: 5px;
    }
  `]
})
export class UserListComponent implements OnInit {
  users$: Observable<string[]> | undefined; // ✅ Uses async pipe for better performance

  constructor(private userService: ApiService) {}

  ngOnInit(): void {
    this.users$ = this.userService.getUsers(); // ✅ Assigning directly to an observable
  }
}
