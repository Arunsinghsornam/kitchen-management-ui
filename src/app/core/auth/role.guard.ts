import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => {

  return () => {

    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.getRole();

    console.log('Current Role:', role);
    console.log('Allowed Roles:', roles);

    if (roles.includes(role)) {
      console.log('Access Granted');
      return true;
    }

    console.log('Access Denied');
    router.navigate(['/dashboard']);

    return false;
  };

};