import { Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-notification-center',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './notification-center.component.html',

  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  private dismissTimers: number[] = [];

  private readonly notificationHandler = (notification: any) => {
    this.notifications.unshift(notification);

    const timer = window.setTimeout(() => {
      this.notifications.pop();
    }, 5000);

    this.dismissTimers.push(timer);
  };

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.onNotification(this.notificationHandler);
  }

  ngOnDestroy(): void {
    this.socketService.off('notification', this.notificationHandler);
    this.dismissTimers.forEach((timer) => window.clearTimeout(timer));
  }
}
