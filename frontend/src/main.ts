import { bootstrapApplication } from '@angular/platform-browser';

import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app/app.routes';

import { AppComponent } from './app/app.component';

import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),

    provideHttpClient(withInterceptors([jwtInterceptor])),

    provideAnimations(),
  ],
}).catch((bootstrapError) => console.error(bootstrapError));
