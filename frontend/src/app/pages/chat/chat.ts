
import { Component } from '@angular/core';
import { NgFor, NgIf, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, NgStyle, FormsModule, RouterLink]
})
export class Chat {
  friends = [
    { name: 'John Doe', online: true },
    { name: 'Jane Smith', online: false },
    { name: 'Mike Johnson', online: true },
    { name: 'Sara Lee', online: true },
    { name: 'Emily Turner', online: false }
  ];
  selectedFriend = this.friends[0];
  messages = [
    { text: 'Hey there!', fromMe: false },
    { text: 'Hello! How are you?', fromMe: true },
    { text: 'I am good, thanks!', fromMe: false }
  ];
  messageText = '';

  selectFriend(friend: any) {
    this.selectedFriend = friend;
    // Optionally, load messages for selected friend
  }

  sendMessage() {
    if (this.messageText.trim()) {
      this.messages.push({ text: this.messageText, fromMe: true });
      this.messageText = '';
    }
  }
}
