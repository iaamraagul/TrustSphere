import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user.role === 'ADMIN') {
    return true;
  }

  return router.parseUrl('/dashboard');
};
