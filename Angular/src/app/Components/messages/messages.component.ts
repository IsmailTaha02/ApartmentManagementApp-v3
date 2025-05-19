import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesTopbarComponent } from '../TopBar/messages-topbar/messages-topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  standalone: true,
  imports:[CommonModule,FormsModule,MessagesTopbarComponent,NgSelectModule],
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})

export class MessagesComponent implements OnInit {
  chats: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  userId: number = Number(localStorage.getItem('user_id'));

  newChatReceiver: number | null = null;
  newChatMessage: string = '';
  newChatType: string = 'General';
  newChatApartment: number | null = null;
  availableUsers: any[] = [];


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMessages();
    this.loadAvailableUsers();
  }

  loadMessages(): void {
    this.http.get<any[]>(`http://localhost:5000/messages?user_id=${this.userId}`).subscribe(data => {
      const grouped = this.groupMessages(data);
      this.chats = grouped;
    });
  }

  filteredAvailableUsers: any[] = [];

  loadAvailableUsers(): void {
    this.http.get<any[]>('http://localhost:5000/users').subscribe(data => {
      this.availableUsers = data.filter(u => u.id !== this.userId);
      this.filteredAvailableUsers = this.availableUsers.filter(
        u => !this.chats.some(chat => chat.id === u.id)
      );
    });
  }


  onSelectUser(selected: any) {
    console.log('Selected user ID:', selected);
  }
  
  getUsersNotInChat(): any[] {
    const existingIds = this.chats.map(chat => chat.id);
    return this.availableUsers.filter(u => !existingIds.includes(u.id));
  }
  
  groupMessages(messages: any[]): any[] {
    const map = new Map<number, any>();
  
    for (const msg of messages) {
      // Safeguard for missing sender or receiver
      if (!msg.sender || !msg.receiver) continue;
  
      const otherUser = msg.sender.id === this.userId ? msg.receiver : msg.sender;
      const existing = map.get(otherUser.id);
  
      if (!existing) {
        map.set(otherUser.id, {
          id: otherUser.id,
          name: otherUser.full_name,
          role: otherUser.role,
          lastMessage: msg.content,
          messages: [{
            content: msg.content,
            timestamp: msg.timestamp,
            isOwn: msg.sender.id === this.userId
          }]
        });
      } else {
        existing.messages.push({
          content: msg.content,
          timestamp: msg.timestamp,
          isOwn: msg.sender.id === this.userId
        });
        existing.lastMessage = msg.content;
      }
    }
  
    return Array.from(map.values());
  }
  

  selectChat(chat: any): void {
    this.selectedChat = chat;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  sendMessage(): void {
    if (!this.newMessage || !this.selectedChat) return;

    const newMsg = {
      sender_id: this.userId,
      receiver_id: this.selectedChat.id,
      content: this.newMessage
    };

    this.http.post('http://localhost:5000/messages', newMsg).subscribe((savedMessage: any) => {
      this.selectedChat.messages.push({
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        isOwn: true
      });
      this.selectedChat.lastMessage = savedMessage.content;
      this.newMessage = '';
    });
  }

  startNewChat() {
    if (!this.newChatReceiver || !this.newChatMessage) return;
  
    const newMsg = {
      sender_id: this.userId,
      receiver_id: this.newChatReceiver,
      content: this.newChatMessage,
      message_type: this.newChatType,
      apartment_id: this.newChatApartment
    };
  
    this.http.post('http://localhost:5000/messages', newMsg).subscribe(() => {
      this.loadMessages(); // Refresh the chat list
      this.newMessage = '';
      this.newChatReceiver = null;
      this.newChatMessage = '';
    });
  }

}
