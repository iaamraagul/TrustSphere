import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { NotificationCenterComponent } from './shared/notification-center/notification-center.component';

@Component({
  selector: 'app-root',

  standalone: true,

  imports: [RouterOutlet, NotificationCenterComponent],

  template: `
    <app-notification-center> </app-notification-center>

    <router-outlet> </router-outlet>
  `,
})
export class AppComponent {}
