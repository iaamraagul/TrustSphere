import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  showNotifications = false;
  userEmail = '';

  notifications = [
    { message: 'New User Registered', time: '2 min ago' },
    { message: 'Verification Completed', time: '5 min ago' },
    { message: 'Fraud Alert Triggered', time: '10 min ago' },
  ];

  private readonly notificationHandler = (socketNotification: any) => {
    this.notifications.unshift({
      message: socketNotification.message,
      time: 'Just now',
    });
  };

  constructor(
    public authService: AuthService,
    private router: Router,
    public socketService: SocketService,
    public themeService: ThemeService,
  ) {
    this.socketService.onNotification(this.notificationHandler);
  }

  ngOnInit(): void {
    this.userEmail = this.authService.getUser()?.email || '';
  }

  ngOnDestroy(): void {
    this.socketService.off('notification', this.notificationHandler);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  logout(): void {
    this.authService.logout();
    this.socketService.disable();
    this.router.navigate(['/auth/login']);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleLiveSync(): void {
    this.socketService.toggle();
  }
}
