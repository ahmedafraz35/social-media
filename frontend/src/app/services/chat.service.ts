import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth/auth.service';

export interface ChatUser {
  id: number;
  username: string;
  profileImage?: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  message: string;
  sentAt: Date;
  isRead: boolean;
}

export interface Conversation {
  chatRoomId: number;
  otherUser: ChatUser;
  lastMessage?: string;
  lastMessageSenderId?: number;
  lastMessageAt: Date;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5036/api/chat';
  private hubConnection: signalR.HubConnection | null = null;

  // Subjects for real-time updates
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  
  public messages$ = this.messagesSubject.asObservable();
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Initialize SignalR connection
  async startConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    // Stop existing connection if any
    if (this.hubConnection) {
      await this.stopConnection();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5036/chatHub', {
        withCredentials: false,  // Set to false for CORS
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR Connected successfully');

      // Join chat with current user ID
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        await this.hubConnection.invoke('JoinChat', currentUser.id);
        console.log('Joined chat for user:', currentUser.id);
      }

      // Listen for incoming messages
      this.hubConnection.on('ReceiveMessage', (message: any) => {
        console.log('Received message via SignalR:', message);
        const chatMessage: ChatMessage = {
          id: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          receiverId: currentUser?.id || 0,
          message: message.message,
          sentAt: new Date(message.sentAt),
          isRead: message.isRead
        };

        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, chatMessage]);
      });

      // Listen for message sent confirmations
      this.hubConnection.on('MessageSent', (response: any) => {
        console.log('Message sent successfully:', response);
      });

      // Listen for read receipts
      this.hubConnection.on('MessagesRead', (senderId: number) => {
        const currentMessages = this.messagesSubject.value;
        const updatedMessages = currentMessages.map(msg => 
          msg.senderId === currentUser?.id && msg.receiverId === senderId
            ? { ...msg, isRead: true }
            : msg
        );
        this.messagesSubject.next(updatedMessages);
      });

    } catch (err) {
      console.error('Error while starting SignalR connection:', err);
      throw err;
    }
  }

  // Stop SignalR connection
  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  // Send message via SignalR
  async sendMessage(receiverId: number, message: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.error('SignalR connection not available. Attempting to reconnect...');
      try {
        await this.startConnection();
      } catch (error) {
        console.error('Failed to reconnect to SignalR:', error);
        throw new Error('Chat connection unavailable');
      }
    }

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        console.log('Sending message via SignalR:', { receiverId, message });
        await this.hubConnection.invoke('SendMessage', receiverId, message);
      } catch (err) {
        console.error('Error sending message:', err);
        throw err;
      }
    } else {
      throw new Error('Unable to establish chat connection');
    }
  }

  // Mark messages as read
  async markMessagesAsRead(senderId: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn('SignalR connection not available for marking messages as read');
      return;
    }

    try {
      await this.hubConnection.invoke('MarkMessagesAsRead', senderId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }

  // Get all users for chat
  getChatUsers(currentUserId: number): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.apiUrl}/users/${currentUserId}`);
  }

  // Get chat history between two users
  getChatHistory(userId1: number, userId2: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${userId1}/${userId2}`);
  }

  // Get user conversations
  getConversations(userId: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  // Update local messages (for UI updates)
  updateMessages(messages: ChatMessage[]): void {
    this.messagesSubject.next(messages);
  }

  // Clear messages
  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}
