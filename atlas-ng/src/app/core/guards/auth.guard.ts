import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if user has a token
  const token = localStorage.getItem('bearerToken');

  if (token && token !== 'null' && token !== 'undefined') {
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if user is already logged in
  const token = localStorage.getItem('bearerToken');

  if (token && token !== 'null' && token !== 'undefined') {
    // Already logged in, redirect to home
    router.navigate(['/home']);
    return false;
  }

  return true;
};
