import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private socketService: SocketService) {}

  onNotification(callback: (notification: any) => void): void {
    this.socketService.onNotification(callback);
  }

  offNotification(callback: (notification: any) => void): void {
    this.socketService.off('notification', callback);
  }
}
